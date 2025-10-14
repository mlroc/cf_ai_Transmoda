export interface Env {
  TRANS_SESSION: DurableObjectNamespace;
  // PDF_BUCKET: R2Bucket; // Commented out until R2 is enabled
  GEMINI_API_KEY: string;
  PROMPT_SUMMARY: string;
  PROMPT_SHORTFORM: string;
  // Optional: comma-separated list of allowed origins for CORS
  ALLOWED_ORIGINS?: string;
}

// Utility: Convert ArrayBuffer to base64 for inlineData payloads
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk) as unknown as number[]);
  }
  // btoa is available in Cloudflare Workers runtime
  return btoa(binary);
}

// Helper: parse content into cards based on separators
const parseContentIntoCards = (content: string): Array<{
  title: string;
  description: string;
  voiceover: string;
  hashtags: string;
  keyPoints: string;
}> => {
  try {
    // First try to parse as JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.cards && Array.isArray(parsed.cards)) {
        return parsed.cards;
      }
    }
  } catch {
    // Fall back to text parsing
  }

  // Split by *** or --- separators, handle various formats
  const sections = content
    .split(/\n\s*\*\*\*\s*\n|\n\s*---\s*\n|^#{1,6}\s*Shortform Content Ideas?\s*$/m)
    .filter(section => section.trim())
    .map(section => section.trim());

  const cards = sections.map(section => {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    const card: any = {};
    
    lines.forEach(line => {
      // Handle various formats: *Title:, Title:, *Title, etc.
      const patterns = {
        title: /^\*{0,2}Title:\*{0,2}\s*(.+)$/i,
        description: /^\*{0,2}Description:\*{0,2}\s*(.+)$/i,
        voiceover: /^\*{0,2}Voiceover:\*{0,2}\s*(.+)$/i,
        hashtags: /^\*{0,2}Hashtags?:\*{0,2}\s*(.+)$/i,
        keyPoints: /^\*{0,2}Key\s*Points?:\*{0,2}\s*(.+)$/i
      } as const;
      
      Object.entries(patterns).forEach(([key, pattern]) => {
        const match = line.match(pattern);
        if (match) {
          const typedKey = key as keyof typeof patterns;
          (card as Record<string, string>)[typedKey as string] = match[1].trim();
        }
      });
    });
    
    return card;
  }).filter(card => card.title);
  
  return cards;
};

// Security and CORS helpers
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_CHARS = 200_000;

function parseAllowedOrigins(env: Env): string[] {
  const raw = (env.ALLOWED_ORIGINS || "").trim();
  if (!raw) return [];
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const allow = parseAllowedOrigins(env);
  if (allow.length === 0) return origin; // dev default; set ALLOWED_ORIGINS in prod
  return allow.includes(origin) ? origin : null;
}

function securityHeaders(origin: string | null, extra: Record<string, string> = {}): HeadersInit {
  const base: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
    "X-Frame-Options": "DENY",
    ...(origin ? { "Access-Control-Allow-Origin": origin } : {}),
    "Vary": "Origin",
    ...extra,
  };
  return base;
}

function preflightHeaders(origin: string | null): HeadersInit {
  return securityHeaders(origin, {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
  });
}

export class TransSession implements DurableObject {
  state: DurableObjectState;
  env: Env;
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
  // Helper: normalize Workers AI output to string
  const stringifyOutput = (r: unknown): string => {
    if (typeof r === 'string') return r;
    try {
      const anyR: any = r as any;
      if (anyR && typeof anyR === 'object') {
        if (typeof anyR.response === 'string') return anyR.response;
        if (typeof anyR.result === 'string') return anyR.result;
      }
    } catch {}
    return JSON.stringify(r);
  };

    // CORS preflight
    if (request.method === "OPTIONS") {
      const origin = resolveAllowedOrigin(request, this.env);
      return new Response(null, { headers: preflightHeaders(origin) });
    }
    if (request.method === "POST" && url.pathname === "/summarize") {
      const form = await request.formData();
      const file = form.get("file");
      const modeRaw = form.get("mode");
      const mode = typeof modeRaw === "string" ? modeRaw.toLowerCase() : "summary";
      if (!(file instanceof File)) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "Missing file" }), { status: 400, headers: securityHeaders(origin, { "content-type": "application/json" }) });
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "File too large. Max 10MB." }), { status: 413, headers: securityHeaders(origin, { "content-type": "application/json" }) });
      }

      // Get prompts from environment variables
      const promptSummary = this.env.PROMPT_SUMMARY;
      const promptShortform = this.env.PROMPT_SHORTFORM;
      
      if (!promptSummary || !promptShortform) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "AI prompts not configured. Please contact support." }), { 
          status: 500, 
          headers: securityHeaders(origin, { "content-type": "application/json" }) 
        });
      }

      // Check if API key is configured
      if (!this.env.GEMINI_API_KEY) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "AI service not configured. Please contact support." }), { 
          status: 500, 
          headers: securityHeaders(origin, { "content-type": "application/json" }) 
        });
      }

      // Google Gemini API
      const model = "gemini-2.0-flash-exp";
      
      try {
        // Processing file for AI analysis
        // Read PDF file and attach as inlineData
        const pdfBuffer = await file.arrayBuffer();
        const base64Pdf = arrayBufferToBase64(pdfBuffer);

        // Check if it's a PDF file
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
        
        if (isPdf) {
          // For PDF files, process directly with Gemini's multimodal capabilities
          const contents = [{
            parts: [
              { text: mode === "shortform" ? promptShortform : promptSummary },
              { inlineData: { mimeType: "application/pdf", data: base64Pdf } }
            ]
          }];
          
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents })
          });
          
          if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            // Gemini API error - logging for debugging
            return new Response(JSON.stringify({ 
              error: `Gemini API error: ${geminiResponse.status}` 
            }), {
              status: 500,
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }
          
          const geminiData = await geminiResponse.json() as any;
          const content = stringifyOutput(geminiData.candidates?.[0]?.content?.parts?.[0]);
          
          // Parse content into cards if it's shortform mode
          if (mode === "shortform") {
            const cards = parseContentIntoCards(content);
            return new Response(JSON.stringify({ cards }), {
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }
          
          return new Response(JSON.stringify({ summary: content }), {
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        // For other file types, process as text
        const contents = [{
          parts: [
            { text: mode === "shortform" ? promptShortform : promptSummary },
            { inlineData: { mimeType: file.type || "text/plain", data: base64Pdf } }
          ]
        }];

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: mode === "shortform" ? {
              temperature: 0.9,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 1200,
            } : {
              temperature: 0.35,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 600,
            }
          })
        });

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          // Gemini API error details
          throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText} - ${errorText}`);
        }

        const geminiData = await geminiResponse.json() as any;
        // Gemini processing completed
        const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";

        const history = (await this.state.storage.get<string[]>("history")) ?? [];
        history.push(content);
        await this.state.storage.put("history", history.slice(-10));

        // Parse content into cards if it's shortform mode
        if (mode === "shortform") {
          const cards = parseContentIntoCards(content);
          return new Response(JSON.stringify({ cards }), {
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        return new Response(JSON.stringify({ summary: content }), {
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (error) {
        // AI processing error
        
        // Check if it's a rate limiting error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('429')) {
          return new Response(JSON.stringify({ 
            error: "Sorry, please try again later. Our AI service is currently busy." 
          }), {
            status: 429,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        
        // Check if it's a model error (skip alt-model call in file path; proceed to basic fallback below)
        // if (errorMessage.includes('model') || errorMessage.includes('not found')) {
        //   // In this path, we'll skip calling another model and move to the basic fallback below
        // }
        
        return new Response(JSON.stringify({ 
          error: "Sorry, please try again later. AI processing temporarily unavailable." 
        }), {
          status: 500,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (request.method === "POST" && url.pathname === "/reformat") {
      try {
        const { content, instruction } = await request.json<any>().catch(() => ({ content: "", instruction: "" }));
        if (!content || typeof content !== "string" || !instruction || typeof instruction !== "string") {
          return new Response(JSON.stringify({ error: "Missing content or instruction" }), { status: 400, headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" } });
        }
        const model = "gemini-2.0-flash-exp";

        const systemPrompt = `You are a precise editor. Reformat or revise the provided content according to the user's instruction while preserving its structure and constraints when present.\n\nHard constraints:\n- If the content appears to follow a specific template (e.g., shortform ideas separated by *** and fields like *Title:, *Voiceover:, *Hashtags:), PRESERVE that template and separators.\n- Output ONLY the revised content. No preamble, no commentary, no code fences.\n- Keep it concise and high-signal.\n`;

        const contents = [{
          parts: [
            { text: systemPrompt },
            { text: `User instruction: ${instruction}` },
            { text: `\n\nContent to revise:\n${content}` }
          ]
        }];

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.5,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 1200,
            }
          })
        });

        if (!resp.ok) {
          const errorText = await resp.text();
          // Reformat API error
          return new Response(JSON.stringify({ error: "Sorry, please try again later. AI processing temporarily unavailable." }), {
            status: 500,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        const data = await resp.json() as any;
        const revised = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Track simple chat history
        const chatHistory = (await this.state.storage.get<any[]>("chatHistory")) ?? [];
        chatHistory.push({
          t: Date.now(),
          instruction,
          beforeLen: content.length,
          afterLen: revised.length,
        });
        await this.state.storage.put("chatHistory", chatHistory.slice(-50));

        return new Response(JSON.stringify({ content: revised }), {
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (e) {
        // Reformat error
        return new Response(JSON.stringify({ error: "Sorry, please try again later. AI processing temporarily unavailable." }), {
          status: 500,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (request.method === "GET" && url.pathname === "/history") {
      const history = (await this.state.storage.get<string[]>("history")) ?? [];
      const origin = resolveAllowedOrigin(request, this.env);
      return new Response(JSON.stringify({ history }), { headers: securityHeaders(origin, { "content-type": "application/json" }) });
    }

    if (request.method === "GET" && url.pathname === "/test") {
      const origin = resolveAllowedOrigin(request, this.env);
      return new Response(JSON.stringify({ status: "ok" }), { headers: securityHeaders(origin, { "content-type": "application/json" }) });
    }

    if (request.method === "POST" && url.pathname === "/summarize-text") {
      const { text, mode } = await request.json<any>().catch(() => ({ text: "", mode: "summary" }));
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
      }
      if (text.length > MAX_TEXT_CHARS) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "Text too long. Please reduce input size." }), { status: 413, headers: securityHeaders(origin, { "content-type": "application/json" }) });
      }
      const model = "gemini-2.0-flash-exp";
      
      try {
        // Starting AI processing
        
        // Sanitize input text to remove page headers and academic-style citations like [12]
        const sanitizeText = (s: string) => {
          // Remove lines like [Page 1]
          let out = s.replace(/^\s*\[Page\s+\d+\]\s*$/gmi, "");
          // Remove bracketed numeric citations and ranges: [1], [12], [3,4], [2–5], also allowing internal spaces like [ 11 ]
          out = out.replace(/\[\s*(?:\d+(?:\s*[–-]\s*\d+)?(?:\s*,\s*\d+)*)\s*\]/g, "");
          // Collapse excessive whitespace
          out = out.replace(/[\t ]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
          return out.trim();
        };

        const safeText = sanitizeText(text).substring(0, 5000);
        const isShortform = String(mode).toLowerCase() === "shortform";
        
        // Processing text content

        const makeShortformPrompt = (doc: string, reinforcement = "") => `You are an elite short-form content strategist and viral content creator. Your job is to transform this document into 5 highly engaging, platform-optimized content ideas that will perform exceptionally well on TikTok, Instagram Reels, YouTube Shorts, and X/Twitter.

CRITICAL REQUIREMENTS:
- Focus on VIRAL POTENTIAL and audience engagement
- Create ideas that spark curiosity, controversy, or strong emotional reactions
- Each idea should be unique and tap into different psychological triggers
- Use proven viral content frameworks (hooks, patterns, trends)
- Make content that creators can immediately produce

CONTENT STRATEGY:
- Hook-driven titles that stop the scroll
- Voiceovers that build tension and deliver value
- Hashtags that maximize discoverability and trend participation
- Ideas that work across multiple platforms
- Content that encourages shares, saves, and comments

FORMAT REQUIREMENTS:
- Use EXACTLY this format with asterisk separators for easy parsing
- Each idea must be separated by "***" on its own line
- No numbered sections, just clean idea blocks

Return your answer in this EXACT format:

# Shortform Content Ideas

*Title: [Compelling, hook-driven title under 60 characters]
*Voiceover: [2-4 sentences that build engagement and deliver value. Use emotional triggers, questions, or bold statements]
*Hashtags: [5-8 relevant hashtags, mix trending and niche tags]

***

*Title: [Another unique angle with different psychological trigger]
*Voiceover: [Different approach - maybe educational, controversial, or inspirational]
*Hashtags: [Different hashtag strategy for this idea]

***

*Title: [Third unique perspective - perhaps practical or behind-the-scenes]
*Voiceover: [Another engaging angle that complements the others]
*Hashtags: [Optimized for different audience segment]

***

*Title: [Fourth idea with fresh hook and approach]
*Voiceover: [Different emotional or intellectual appeal]
*Hashtags: [Targeting different trending topics or communities]

***

*Title: [Fifth and final idea - perhaps most controversial or surprising]
*Voiceover: [Strongest hook or most valuable insight]
*Hashtags: [Most viral potential hashtags]

Document to analyze:

${doc}

${reinforcement}`;

        const requiredSections = ["***"];
        const canonicalize = (input: string) => input.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
        const sourceCanonical = canonicalize(safeText);
        const sourceSegments = (() => {
          if (!sourceCanonical) return [] as string[];
          const words = sourceCanonical.split(" ").filter(Boolean);
          const segments: string[] = [];
          const windowSize = 28;
          const maxWords = Math.min(words.length, 420);
          for (let start = 0; start < maxWords; start += windowSize) {
            const segment = words.slice(start, start + windowSize).join(" ");
            if (segment.length >= 140) {
              segments.push(segment);
            }
          }
          return segments;
        })();

        const outputCopiesSource = (output: string) => {
          if (!sourceSegments.length) return false;
          const outputCanonical = canonicalize(output);
          return sourceSegments.some((segment) => outputCanonical.includes(segment));
        };

        const isValidShortformOutput = (output: string) => {
          // Check for the new asterisk-based format
          const hasAsteriskFormat = output.includes('*Title:') && output.includes('*Voiceover:') && output.includes('*Hashtags:');
          const hasSeparators = (output.match(/\*\*/g) || []).length >= 4; // At least 4 separators for 5 ideas
          
          // Check if it's not just copying the source (but be more lenient)
          const copiesSource = outputCopiesSource(output);
          
          // Check if it's not just a wall of text (should have some structure)
          const hasStructure = output.split('\n').length > 10;
          
          // Validation check
          
          // Accept if it has the new asterisk format and separators, and doesn't copy source
          return hasAsteriskFormat && hasSeparators && hasStructure && !copiesSource;
        };

        const stringifyOutput = (r: unknown): string => {
          if (typeof r === 'string') return r;
          try {
            const anyR: any = r as any;
            if (anyR && typeof anyR === 'object') {
              if (typeof anyR.response === 'string') return anyR.response;
              if (typeof anyR.result === 'string') return anyR.result;
            }
          } catch {}
          return JSON.stringify(r);
        };

        if (isShortform) {
          type ShortformAttempt = {
            model: string;
            prompt: string;
            generationConfig: Record<string, unknown>;
          };

          const attemptConfigs: ShortformAttempt[] = [
            {
              model: "gemini-2.0-flash-exp",
              prompt: makeShortformPrompt(safeText),
              generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1200,
              },
            },
            {
              model: "gemini-2.0-flash-exp",
              prompt: makeShortformPrompt(safeText, "Emphasize bold, novel angles. Absolutely do not copy or quote lines from the document. Each idea must be unique and creator-ready."),
              generationConfig: {
                temperature: 1.0,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1200,
              },
            },
            {
              model: "gemini-2.0-flash-exp",
              prompt: makeShortformPrompt(safeText, "You must FOLLOW the template exactly. If you repeat the document, that is a failure. Invent fresh hooks and angles inspired by the document."),
              generationConfig: {
                temperature: 0.85,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1200,
              },
            },
          ];

          let shortformSummary: string | null = null;
          for (const attempt of attemptConfigs) {
            try {
              // Attempting shortform generation

              const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${attempt.model}:generateContent?key=${this.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: attempt.prompt
                    }]
                  }],
                  generationConfig: attempt.generationConfig
                })
              });

              // Gemini API response received

              if (!geminiResponse.ok) {
                const errorText = await geminiResponse.text();
                // Gemini API error
                throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`);
              }

              const geminiData = await geminiResponse.json() as any;
              // Gemini API response processed
              
              const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
              // Shortform attempt completed
              
              if (isValidShortformOutput(candidate)) {
                shortformSummary = candidate;
                break;
              }
            } catch (attemptError) {
              // Shortform attempt failed
            }
          }

          if (!shortformSummary) {
            // All shortform attempts failed, creating fallback content
            // Create a basic fallback shortform structure
            const fallbackContent = `# Shortform Content Ideas

## Idea 1
- Title: Key Insights from Research
- Voiceover: This research reveals fascinating insights about AI and machine learning that could change how we think about technology. The findings suggest new approaches to solving complex problems.
- Hashtags: #AI, #MachineLearning, #Research, #Innovation

## Idea 2
- Title: Breaking Down Complex Concepts
- Voiceover: Sometimes the most complex ideas can be explained simply. This study shows how to make advanced concepts accessible to everyone.
- Hashtags: #Education, #Simplification, #Learning, #Knowledge

## Idea 3
- Title: Future Implications
- Voiceover: What does this research mean for the future? The implications are far-reaching and could impact multiple industries.
- Hashtags: #Future, #Technology, #Impact, #Innovation

## Idea 4
- Title: Practical Applications
- Voiceover: Beyond theory, this research has real-world applications that could benefit many people. Here's how it could be used in practice.
- Hashtags: #Practical, #Applications, #RealWorld, #Benefits

## Idea 5
- Title: Expert Perspectives
- Voiceover: Leading experts weigh in on these findings and what they mean for the field. Their insights provide valuable context.
- Hashtags: #Experts, #Perspectives, #Insights, #Analysis`;

            const history = (await this.state.storage.get<string[]>("history")) ?? [];
            history.push(fallbackContent);
            await this.state.storage.put("history", history.slice(-10));
            return new Response(JSON.stringify({ summary: fallbackContent }), {
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }

          const history = (await this.state.storage.get<string[]>("history")) ?? [];
          history.push(shortformSummary);
          await this.state.storage.put("history", history.slice(-10));
          return new Response(JSON.stringify({ summary: shortformSummary }), {
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }

        const promptSummary = this.env.PROMPT_SUMMARY;
        if (!promptSummary) {
          return new Response(JSON.stringify({ error: "AI prompts not configured. Please contact support." }), { 
            status: 500, 
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" } 
          });
        }
        const prompt = `${promptSummary}\n\n${text}`;
        
        // Generating summary with Gemini
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.35,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 400,
            }
          })
        });

        // Summary Gemini API response received

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          // Summary Gemini API error
          throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`);
        }

        const geminiData = await geminiResponse.json() as any;
        // Summary Gemini processing completed
        const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated";

        const history = (await this.state.storage.get<string[]>("history")) ?? [];
        history.push(summary);
        await this.state.storage.put("history", history.slice(-10));
        return new Response(JSON.stringify({ summary }), {
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (error) {
        // AI processing error
        
        // Check if it's a rate limiting error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('429')) {
          return new Response(JSON.stringify({ 
            error: "Sorry, please try again later. Our AI service is currently busy." 
          }), {
            status: 429,
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
        
        // Check if it's a model error
        // if (errorMessage.includes('model') || errorMessage.includes('not found')) {
        //   // Skip secondary call and proceed to basic fallback below
        // }
        
        // Final fallback - provide a basic summary even if all API calls fail
        // All API attempts failed, providing basic fallback summary
        const isShortform = String(mode).toLowerCase() === "shortform";
        
        let fallbackSummary: string;
        if (isShortform) {
          fallbackSummary = `# Shortform Content Ideas

## Idea 1
- Title: Key Insights from Document
- Voiceover: This document contains valuable insights that could be transformed into engaging short-form content. The key points offer multiple angles for creator content.
- Hashtags: #Insights, #Content, #Creator, #Value

## Idea 2
- Title: Breaking Down Complex Topics
- Voiceover: Complex topics can be simplified and made accessible through creative storytelling. This approach helps audiences understand difficult concepts.
- Hashtags: #Education, #Simplification, #Storytelling, #Learning

## Idea 3
- Title: Practical Applications
- Voiceover: The concepts discussed have real-world applications that viewers can relate to and implement in their own lives or work.
- Hashtags: #Practical, #Applications, #RealWorld, #Implementation

## Idea 4
- Title: Expert Perspectives
- Voiceover: Expert analysis and insights provide credibility and depth to content, making it more valuable for audiences seeking quality information.
- Hashtags: #Expert, #Analysis, #Credibility, #Quality

## Idea 5
- Title: Future Implications
- Voiceover: Understanding the future implications of current trends and developments helps audiences stay ahead and make informed decisions.
- Hashtags: #Future, #Trends, #Innovation, #ForwardThinking`;
        } else {
          fallbackSummary = `This document contains valuable information and insights that could be useful for various purposes. While we couldn't process the full content at this time, the document appears to contain structured information that may be relevant to your needs. Please try again later for a more detailed analysis.`;
        }
        
        const history = (await this.state.storage.get<string[]>("history")) ?? [];
        history.push(fallbackSummary);
        await this.state.storage.put("history", history.slice(-10));
        
        return new Response(JSON.stringify({ summary: fallbackSummary }), {
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (request.method === "POST" && url.pathname === "/summarize-pdf-text") {
      const { text, mode } = await request.json<any>().catch(() => ({ text: "", mode: "summary" }));
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ error: "Missing text" }), { status: 400 });
      }
      if (text.length > MAX_TEXT_CHARS) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "Text too long. Please reduce input size." }), { status: 413, headers: securityHeaders(origin, { "content-type": "application/json" }) });
      }
      const model = "gemini-2.0-flash-exp";
      
      // Get prompts from environment variables
      const promptSummary = this.env.PROMPT_SUMMARY;
      const promptShortform = this.env.PROMPT_SHORTFORM;
      
      
      if (!promptSummary || !promptShortform) {
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ error: "AI prompts not configured. Please contact support." }), { 
          status: 500, 
          headers: securityHeaders(origin, { "content-type": "application/json" }) 
        });
      }
      
      try {
        // Starting PDF text processing
        
        const contents = [{
          parts: [
            { text: mode === "shortform" ? promptShortform : promptSummary },
            { text: `\n\nDocument content:\n${text}` }
          ]
        }];

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: mode === "shortform" ? {
              temperature: 0.8,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 2048,
            } : {
              temperature: 0.35,
              topP: 0.95,
              topK: 40,
              maxOutputTokens: 600,
            }
          })
        });
        
        if (geminiResponse.ok) {
          const data = await geminiResponse.json() as any;
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";
          
          // Store in history
          const history = (await this.state.storage.get<string[]>("history")) ?? [];
          history.push(content);
          if (history.length > 10) history.shift();
          await this.state.storage.put("history", history);
          
          // Parse content into cards if it's shortform mode
          if (mode === "shortform") {
            const cards = parseContentIntoCards(content);
            return new Response(JSON.stringify({ cards }), {
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }
          
          return new Response(JSON.stringify({ summary: content }), {
            headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        } else {
          // Gemini API error - return user-friendly error
          const origin = resolveAllowedOrigin(request, this.env);
          return new Response(JSON.stringify({ 
            error: "AI service temporarily unavailable. Please try again later." 
          }), {
            status: 503,
            headers: securityHeaders(origin, { "content-type": "application/json" })
          });
        }
      } catch (e) {
        // Error in summarize-pdf-text - return user-friendly error
        const origin = resolveAllowedOrigin(request, this.env);
        return new Response(JSON.stringify({ 
          error: "Unable to process document. Please try again later." 
        }), {
          status: 500,
          headers: securityHeaders(origin, { "content-type": "application/json" })
        });
      }
    }

    const origin = resolveAllowedOrigin(request, this.env);
    return new Response("Not found", { status: 404, headers: securityHeaders(origin) });
  }
}

export default {
  fetch: async (request: Request, env: Env): Promise<Response> => {
    const url = new URL(request.url);
    // Global CORS preflight for top-level routes
    if (request.method === "OPTIONS") {
      const origin = resolveAllowedOrigin(request, env);
      return new Response(null, { headers: preflightHeaders(origin) });
    }

    if (url.pathname === "/summarize-pdf-text") {
      try {
        const ct = request.headers.get("content-type") || "";
        if (!/application\/json/i.test(ct)) {
          const origin = resolveAllowedOrigin(request, env);
          return new Response(JSON.stringify({ error: "Unsupported Media Type" }), { status: 415, headers: securityHeaders(origin, { "content-type": "application/json" }) });
        }
        const body = await request.text();
        const parsed = JSON.parse(body);
        const { text, mode } = parsed;
        if (!text || typeof text !== "string") {
          const origin = resolveAllowedOrigin(request, env);
          return new Response(JSON.stringify({ error: "Missing text" }), { status: 400, headers: securityHeaders(origin, { "content-type": "application/json" }) });
        }
        if (text.length > MAX_TEXT_CHARS) {
          const origin = resolveAllowedOrigin(request, env);
          return new Response(JSON.stringify({ error: "Text too long. Please reduce input size." }), { status: 413, headers: securityHeaders(origin, { "content-type": "application/json" }) });
        }

        const model = "gemini-2.0-flash-exp";
        // Get prompts from environment variables
        const promptSummary = env.PROMPT_SUMMARY;
        const promptShortform = env.PROMPT_SHORTFORM;
        
        
        if (!promptSummary || !promptShortform) {
          const origin = resolveAllowedOrigin(request, env);
          return new Response(JSON.stringify({ error: "AI prompts not configured. Please contact support." }), { 
            status: 500, 
            headers: securityHeaders(origin, { "content-type": "application/json" }) 
          });
        }
        
        try {
          // Processing PDF text
          
          const contents = [{
            parts: [
              { text: mode === "shortform" ? promptShortform : promptSummary },
              { text: `\n\nDocument content:\n${text}` }
            ]
          }];

          const apiKey = env.GEMINI_API_KEY?.trim();
          
          const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents,
              generationConfig: mode === "shortform" ? {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 1200,
              } : {
                temperature: 0.35,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 600,
              }
            })
          });
          
          if (geminiResponse.ok) {
            const data = await geminiResponse.json() as any;
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";
            
            // Parse content into cards if it's shortform mode
            if (mode === "shortform") {
              const cards = parseContentIntoCards(content);
              return new Response(JSON.stringify({ cards }), {
                headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
              });
            }
            
            return new Response(JSON.stringify({ summary: content }), {
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          } else {
            // Gemini API error
            const errorBody = await geminiResponse.text();
            
            // Fallback summary
            const quickSummary = (() => {
              const cleaned = String(text).replace(/\s+/g, ' ').trim();
              const sentences = cleaned.split(/(?<=[.!?])\s+/).slice(0, 5);
              const out = sentences.join(' ');
              return out.length > 120 ? out : cleaned.slice(0, 600);
            })();
            
            // Parse content into cards if it's shortform mode
            if (mode === "shortform") {
              const cards = parseContentIntoCards(quickSummary);
              return new Response(JSON.stringify({ cards, fallback: true }), {
                headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
              });
            }
            
            return new Response(JSON.stringify({ summary: quickSummary, fallback: true }), {
              headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          }
        } catch (e) {
          // Error in summarize-pdf-text - return user-friendly error
          const origin = resolveAllowedOrigin(request, env);
          return new Response(JSON.stringify({ 
            error: "Unable to process document. Please try again later." 
          }), {
            status: 500,
            headers: securityHeaders(origin, { "content-type": "application/json" })
          });
        }
      } catch (parseError) {
        // JSON parse error
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { 
          status: 400,
          headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // Resilient fallback: if a POST with JSON {content, instruction} hits any path,
    // route it to the Durable Object /reformat handler.
    if (request.method === "POST" && url.pathname !== "/reformat" && url.pathname !== "/summarize-pdf-text") {
      try {
        const bodyText = await request.text();
        if (bodyText && bodyText.includes('"instruction"') && bodyText.includes('"content"')) {
          const sessionId = url.searchParams.get("sid") || "anon";
          const id = env.TRANS_SESSION.idFromName(sessionId);
          const obj = env.TRANS_SESSION.get(id);
          return obj.fetch(new Request("https://do/reformat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyText,
          }));
        }
      } catch {}
    }
    // Route POST /summarize to the Durable Object instance based on a session id
    if (url.pathname === "/summarize") {
      const sessionId = url.searchParams.get("sid") || "anon";
      const id = env.TRANS_SESSION.idFromName(sessionId);
      const obj = env.TRANS_SESSION.get(id);
      return obj.fetch(new Request("https://do/summarize", request));
    }

    if (url.pathname === "/history") {
      const sessionId = url.searchParams.get("sid") || "anon";
      const id = env.TRANS_SESSION.idFromName(sessionId);
      const obj = env.TRANS_SESSION.get(id);
      return obj.fetch(new Request("https://do/history", request));
    }

    if (url.pathname === "/test") {
      const origin = resolveAllowedOrigin(request, env);
      return new Response(JSON.stringify({ status: "ok" }), { 
        headers: securityHeaders(origin, { "content-type": "application/json" }) 
      });
    }



    if (url.pathname === "/summarize-text") {
      const sessionId = url.searchParams.get("sid") || "anon";
      const id = env.TRANS_SESSION.idFromName(sessionId);
      const obj = env.TRANS_SESSION.get(id);
      return obj.fetch(new Request("https://do/summarize-text", request));
    }

    if (url.pathname === "/reformat" || /\/reformat\/?$/.test(url.pathname)) {
      const sessionId = url.searchParams.get("sid") || "anon";
      const id = env.TRANS_SESSION.idFromName(sessionId);
      const obj = env.TRANS_SESSION.get(id);
      return obj.fetch(new Request("https://do/reformat", request));
    }

    const origin = resolveAllowedOrigin(request, env);
    return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: securityHeaders(origin, { "content-type": "application/json" }) });
  },
} satisfies ExportedHandler<Env>;


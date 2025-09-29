# Transmoda Worker Setup

## Environment Variables

The worker requires three environment variables to be set:

### 1. GEMINI_API_KEY
Your Google Gemini API key for AI processing.

### 2. PROMPT_SUMMARY
The AI prompt used for document summarization.

### 3. PROMPT_SHORTFORM
The AI prompt used for generating shortform content ideas.

## Setting Environment Variables

### For Production (Cloudflare Workers)

Set secrets using the Wrangler CLI:

```bash
# Set Gemini API key
wrangler secret put GEMINI_API_KEY

# Set summary prompt
wrangler secret put PROMPT_SUMMARY

# Set shortform prompt  
wrangler secret put PROMPT_SHORTFORM
```

### For Local Development

Create a `.env` file in the worker directory:

```bash
# .env file
GEMINI_API_KEY=your_gemini_api_key_here

CONTENT QUALITY ASSESSMENT:
First, evaluate if this document is suitable for viral content creation:
- If it appears to be a school assignment, homework, or academic paper, respond with: "This appears to be an academic document. For viral content, consider uploading business reports, industry insights, or engaging articles instead."
- If the document is too short (under 200 words) or appears corrupted, respond with: "This document seems too brief or may have formatting issues. Please upload a more substantial document for better content ideas."
- If the content is inappropriate or low-quality, respond with: "This content may not be suitable for social media. Please upload a professional or engaging document."

If the document passes quality assessment, create content ideas with these requirements:
- Focus on VIRAL POTENTIAL and audience engagement
- Each idea must be unique and tap different psychological triggers
- Use proven viral content frameworks (hooks, patterns, trends)
- Make content that creators can immediately produce
- Break apart key, cool, and potentially controversial parts of the document
- Include specific data points, quotes, or insights that would grab attention

FORMAT REQUIREMENTS:
- Use EXACTLY this format with asterisk separators for easy parsing
- Each idea must be separated by "***" on its own line
- No numbered sections

Return your answer in this EXACT format:

# Shortform Content Ideas

*Title: [Hook-driven title under 60 characters]
*Description: [2-3 sentences describing the video concept and key points]
*Voiceover: [2-4 sentences that build engagement and deliver value]
*Hashtags: [5-8 relevant hashtags]
*Key Points: [2-3 bullet points highlighting the most interesting/controversial aspects]

***

(repeat for 5 total ideas)
```

## Benefits of Environment Variables

- **Security**: Sensitive business logic (prompts) are not exposed in code
- **Flexibility**: Easy to update prompts without code changes
- **Version Control**: Prompts are not tracked in git, reducing conflicts
- **Environment-Specific**: Different prompts for dev/staging/production
- **Maintenance**: Easier to manage and update AI prompts

## Deployment

After setting up your environment variables:

```bash
# Deploy to production
wrangler deploy

# Or run locally for testing
wrangler dev
```

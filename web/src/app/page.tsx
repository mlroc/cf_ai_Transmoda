"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { extractTextFromPdf } from "@/lib/pdf";
import ShortformContent from "@/components/ShortformContent";
import { config } from "@/lib/config";

// Component to format LLM text with better styling
function FormattedSummary({ text }: { text: string }) {
  // Parse the text and format it properly
  const formatText = (text: string) => {
    // Normalize and detect headings with markdown-style prefixes
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw || !raw.trim()) continue;
      const line = raw.trim();

      // H1 / H2 / H3 support
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${i}`} className="text-2xl md:text-3xl font-bold mb-4 mt-6 first:mt-0">{line.replace(/^#\s*/, '')}</h1>);
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${i}`} className="text-xl md:text-2xl font-semibold mb-3 mt-5">{line.replace(/^##\s*/, '')}</h2>);
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3-${i}`} className="text-lg font-semibold mb-2 mt-4">{line.replace(/^###\s*/, '')}</h3>);
        continue;
      }

      // Bulleted list items (emoji-friendly)
      if (/^(\*|-|•)\s+/.test(line)) {
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="leading-relaxed">{line.replace(/^(\*|-|•)\s+/, '')}</span>
          </div>
        );
        continue;
      }

      // Numbered list items
      if (/^\d+\.\s+/.test(line)) {
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-3 mb-2">
            <span className="text-primary font-medium mt-0.5 flex-shrink-0">{line.match(/^\d+/)?.[0]}.</span>
            <span className="leading-relaxed">{line.replace(/^\d+\.\s+/, '')}</span>
          </div>
        );
        continue;
      }

      // Default paragraph
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed mb-3">{line}</p>
      );
    }
    return elements;
  };

  return (
    <div className="space-y-1">
      {formatText(text)}
    </div>
  );
}

export default function Transmoda() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [shortformContent, setShortformContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [shortformLoading, setShortformLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showShortformModal, setShowShortformModal] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState<boolean>(false);

  // Close download options when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.download-container')) {
      setShowDownloadOptions(false);
    }
  };

  // Add event listener for click outside
  React.useEffect(() => {
    if (showDownloadOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDownloadOptions]);

  // Download helpers for shortform content
  const formatContentForDownload = (content: string, forPdf = false) => {
    // Parse the content using the same logic as ShortformContent component
    const ideaSections = content.split(/\*\*\*/).filter(section => section.trim());
    
    let formattedContent = forPdf ? "VIRAL CONTENT IDEAS\n" : "🎯 VIRAL CONTENT IDEAS\n";
    formattedContent += "=" .repeat(50) + "\n\n";
    
    ideaSections.forEach((section, index) => {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      
      let title = "";
      let description = "";
      let voiceover = "";
      let hashtags: string[] = [];
      let keyPoints = "";
      
      lines.forEach(line => {
        if (line.startsWith('*Title:')) {
          title = line.replace('*Title:', '').trim();
        } else if (line.startsWith('*Description:')) {
          description = line.replace('*Description:', '').trim();
        } else if (line.startsWith('*Voiceover:')) {
          voiceover = line.replace('*Voiceover:', '').trim();
        } else if (line.startsWith('*Hashtags:')) {
          const hashtagText = line.replace('*Hashtags:', '').trim();
          hashtags = hashtagText.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (line.startsWith('*Key Points:')) {
          keyPoints = line.replace('*Key Points:', '').trim();
        }
      });
      
      if (title) {
        formattedContent += forPdf ? `IDEA #${index + 1}\n` : `📝 IDEA #${index + 1}\n`;
        formattedContent += "─".repeat(30) + "\n\n";
        formattedContent += forPdf ? `TITLE: ${title}\n\n` : `🎬 TITLE: ${title}\n\n`;
        
        if (description) {
          formattedContent += forPdf ? `DESCRIPTION:\n${description}\n\n` : `📋 DESCRIPTION:\n${description}\n\n`;
        }
        
        if (voiceover) {
          formattedContent += forPdf ? `VOICEOVER SCRIPT:\n${voiceover}\n\n` : `🎤 VOICEOVER SCRIPT:\n${voiceover}\n\n`;
        }
        
        if (keyPoints) {
          formattedContent += forPdf ? `KEY POINTS:\n${keyPoints}\n\n` : `⚡ KEY POINTS:\n${keyPoints}\n\n`;
        }
        
        if (hashtags.length > 0) {
          formattedContent += forPdf ? `HASHTAGS: ${hashtags.join(' ')}\n\n` : `🏷️  HASHTAGS: ${hashtags.join(' ')}\n\n`;
        }
        
        formattedContent += "─".repeat(50) + "\n\n";
      }
    });
    
    formattedContent += forPdf ? 
      "\nGenerated by TransModa - Transform PDFs into Viral Content\nVisit us for more AI-powered content creation tools" :
      "\n✨ Generated by TransModa - Transform PDFs into Viral Content\n🌐 Visit us for more AI-powered content creation tools";
    
    return formattedContent;
  };

  const downloadShortformTxt = () => {
    if (!shortformContent) return;
    const formattedContent = formatContentForDownload(shortformContent);
    const blob = new Blob([formattedContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transmoda-content-ideas.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to clean text for PDF (remove emojis and special characters)
  const cleanTextForPdf = (text: string): string => {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport & map symbols
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Remove regional indicator symbols
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove miscellaneous symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Remove supplemental symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Remove symbols and pictographs extended-A
      .replace(/[^\x00-\x7F]/g, '') // Remove any remaining non-ASCII characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const downloadShortformPdf = async () => {
    if (!shortformContent) return;
    try {
      // Dynamically load jsPDF UMD from CDN and access via window.jspdf
      await new Promise<void>((resolve, reject) => {
        if (typeof window === "undefined") return reject(new Error("window not available"));
        if ((window as { jspdf?: { jsPDF?: unknown } }).jspdf?.jsPDF) return resolve();
        const script = document.createElement("script");
        script.src = `${config.pdfjs.jsdelivr}/npm/jspdf@2.5.1/dist/jspdf.umd.min.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load jsPDF"));
        document.head.appendChild(script);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { jsPDF } = (window as unknown as { jspdf: { jsPDF: new (options: { unit: string; format: string }) => any } }).jspdf;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = new jsPDF({ unit: "pt", format: "a4" }) as any;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // Parse content directly for better PDF formatting
      const ideaSections = shortformContent.split(/\*\*\*/).filter(section => section.trim());
      let cursorY = margin;

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("VIRAL CONTENT IDEAS", margin, cursorY);
      cursorY += 30;

      // Add separator line
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("=".repeat(50), margin, cursorY);
      cursorY += 20;

      ideaSections.forEach((section, index) => {
        const lines = section.split('\n').map(line => line.trim()).filter(line => line);
        
        let title = "";
        let description = "";
        let voiceover = "";
        let hashtags: string[] = [];
        let keyPoints = "";
        
        lines.forEach(line => {
          if (line.startsWith('*Title:')) {
            title = cleanTextForPdf(line.replace('*Title:', '').trim());
          } else if (line.startsWith('*Description:')) {
            description = cleanTextForPdf(line.replace('*Description:', '').trim());
          } else if (line.startsWith('*Voiceover:')) {
            voiceover = cleanTextForPdf(line.replace('*Voiceover:', '').trim());
          } else if (line.startsWith('*Hashtags:')) {
            const hashtagText = cleanTextForPdf(line.replace('*Hashtags:', '').trim());
            hashtags = hashtagText.split(',').map(tag => cleanTextForPdf(tag.trim())).filter(tag => tag);
          } else if (line.startsWith('*Key Points:')) {
            keyPoints = cleanTextForPdf(line.replace('*Key Points:', '').trim());
          }
        });
        
        if (title) {
          // Check if we need a new page
          if (cursorY > pageHeight - 200) {
            doc.addPage();
            cursorY = margin;
          }

          // IDEA header
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`IDEA #${index + 1}`, margin, cursorY);
          cursorY += 20;

          // Separator line
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("-".repeat(30), margin, cursorY);
          cursorY += 15;

          // Title
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          const titleLines = doc.splitTextToSize(`TITLE: ${title}`, maxWidth);
          for (const line of titleLines) {
            if (cursorY > pageHeight - margin) {
              doc.addPage();
              cursorY = margin;
            }
            doc.text(line, margin, cursorY);
            cursorY += 15;
          }
          cursorY += 10;

          // Description
          if (description) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("DESCRIPTION:", margin, cursorY);
            cursorY += 15;
            doc.setFont("helvetica", "normal");
            const descLines = doc.splitTextToSize(description, maxWidth);
            for (const line of descLines) {
              if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
              }
              doc.text(line, margin, cursorY);
              cursorY += 15;
            }
            cursorY += 10;
          }

          // Voiceover
          if (voiceover) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("VOICEOVER SCRIPT:", margin, cursorY);
            cursorY += 15;
            doc.setFont("helvetica", "normal");
            const voiceLines = doc.splitTextToSize(voiceover, maxWidth);
            for (const line of voiceLines) {
              if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
              }
              doc.text(line, margin, cursorY);
              cursorY += 15;
            }
            cursorY += 10;
          }

          // Key Points
          if (keyPoints) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("KEY POINTS:", margin, cursorY);
            cursorY += 15;
            doc.setFont("helvetica", "normal");
            const keyLines = doc.splitTextToSize(keyPoints, maxWidth);
            for (const line of keyLines) {
              if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
              }
              doc.text(line, margin, cursorY);
              cursorY += 15;
            }
            cursorY += 10;
          }

          // Hashtags
          if (hashtags.length > 0) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("HASHTAGS:", margin, cursorY);
            cursorY += 15;
            doc.setFont("helvetica", "normal");
            const hashtagText = hashtags.join(' ');
            const hashtagLines = doc.splitTextToSize(hashtagText, maxWidth);
            for (const line of hashtagLines) {
              if (cursorY > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
              }
              doc.text(line, margin, cursorY);
              cursorY += 15;
            }
            cursorY += 15;
          }

          // Separator between ideas
          if (index < ideaSections.length - 1) {
            doc.setFontSize(10);
            doc.text("-".repeat(50), margin, cursorY);
            cursorY += 20;
          }
        }
      });

      // Add footer
      cursorY += 20;
      if (cursorY > pageHeight - 50) {
        doc.addPage();
        cursorY = margin;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Generated by TransModa - Transform PDFs into Viral Content", margin, cursorY);
      cursorY += 15;
      doc.text("Visit us for more AI-powered content creation tools", margin, cursorY);

      doc.save("transmoda-content-ideas.pdf");
    } catch {
      // Handle error silently in production
      setErrorMessage("Couldn't generate PDF. Please try TXT download.");
    }
  };


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain")) {
      setFile(selectedFile);
      setErrorMessage("");
    } else {
      setErrorMessage("Please select a valid PDF or text file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "text/plain")) {
      setFile(droppedFile);
      setErrorMessage("");
    } else {
      setErrorMessage("Please drop a valid PDF or text file.");
    }
  };


  const handleSummarize = async (selectedMode: "summary" | "shortform") => {
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setSummary("");
    setErrorMessage("");

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) {
            clearInterval(progressInterval);
            return 98;
          }
          const next = prev + Math.random() * 10;
          // round to two decimals and clamp
          const rounded = Math.min(98, Math.max(0, Math.round(next * 100) / 100));
          return rounded;
        });
      }, 200);

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
      let res: Response;
      let data: { summary?: string; error?: string };

      if (isPdf) {
        // Client-side extract PDF text then send to text endpoint
        setProgress(40);
        const text = await extractTextFromPdf(file);
        setProgress(60);

        res = await fetch(`${config.api.baseUrl}${config.api.endpoints.summarizePdfText}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode: selectedMode })
        });
        data = await res.json();
      } else {
        // Non-PDF files: send directly
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", selectedMode);
        setProgress(50);
        res = await fetch(`${config.api.baseUrl}${config.api.endpoints.summarize}`, {
          method: "POST",
          body: formData,
        });
        data = await res.json();
      }
      
      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if the response status indicates an error
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      setSummary(data.summary ?? "");
    } catch (e) {
      // Handle error silently in production
      // Handle different types of errors gracefully
      let errorMessage = "Sorry, please try again later.";
      
      if (e instanceof Error) {
        if (e.message.includes('Failed to fetch') || e.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (e.message.includes('rate limit') || e.message.includes('busy')) {
          errorMessage = "Sorry, please try again later. Our AI service is currently busy.";
        } else if (e.message.includes('valid shortform plan')) {
          errorMessage = "We couldn't create a varied shortform plan. Try another section or rerun.";
        } else if (e.message.includes('AI processing temporarily unavailable')) {
          errorMessage = "PDF processing is currently limited. Please try uploading a text file (.txt) instead, or contact us for PDF support.";
        }
      }
      
      setErrorMessage(errorMessage);
    } finally {
      // Ensure final value is exactly 100.00 and rounded
      setProgress(100);
      setLoading(false);
    }
  }

  const handleShortformGeneration = async () => {
    if (!file) return;

    setShortformLoading(true);
    setShortformContent("");
    setErrorMessage("");
    setShowShortformModal(true);

    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
      let res: Response;
      let data: { summary?: string; cards?: Array<{title: string; description?: string; voiceover?: string; hashtags?: string; keyPoints?: string}>; error?: string };

      if (isPdf) {
        const text = await extractTextFromPdf(file);
        res = await fetch(`${config.api.baseUrl}${config.api.endpoints.summarizePdfText}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode: "shortform" })
        });
        data = await res.json();
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", "shortform");
        res = await fetch(`${config.api.baseUrl}${config.api.endpoints.summarize}`, {
          method: "POST",
          body: formData,
        });
        data = await res.json();
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if the response status indicates an error
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Handle both old summary format and new cards format
      if (data.cards && Array.isArray(data.cards)) {
        // Convert cards back to text format for the existing parser
        const cardsText = data.cards.map(card => {
          let text = `*Title: ${card.title}\n`;
          if (card.description) text += `*Description: ${card.description}\n`;
          if (card.voiceover) text += `*Voiceover: ${card.voiceover}\n`;
          if (card.hashtags) text += `*Hashtags: ${card.hashtags}\n`;
          if (card.keyPoints) text += `*Key Points: ${card.keyPoints}`;
          return text;
        }).join('\n\n***\n\n');
        setShortformContent(cardsText);
      } else {
        setShortformContent(data.summary ?? "");
      }
      setShowShortformModal(true);
    } catch (e) {
      // Handle error silently in production
      let errorMessage = "Sorry, please try again later.";
      
      if (e instanceof Error) {
        if (e.message.includes('Failed to fetch') || e.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (e.message.includes('rate limit') || e.message.includes('busy')) {
          errorMessage = "Sorry, please try again later. Our AI service is currently busy.";
        } else if (e.message.includes('AI processing temporarily unavailable')) {
          errorMessage = "PDF processing is currently limited. Please try uploading a text file (.txt) instead, or contact us for PDF support.";
        }
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setShortformLoading(false);
    }
  }

  const handleBackToUpload = () => {
    setFile(null);
    setSummary("");
    setShortformContent("");
    setShowSummary(false);
    setErrorMessage("");
  }

  const handleReformat = async () => {
    if (!shortformContent || !chatInput) {
      return;
    }
    
    // Guardrails: only allow editing-related requests
    const disallowed = /(weather|stock|time in |joke|calculate|sum|code|sql|system prompt|password|apikey|api key|credit card|secret)/i;
    if (disallowed.test(chatInput)) {
      setErrorMessage("This chat only edits the content ideas. Try an instruction like 'make titles punchier'.");
      return;
    }
    
    try {
      setChatLoading(true);
      setErrorMessage(""); // Clear any previous errors
      
      const res = await fetch("/api/reformat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: shortformContent, instruction: chatInput })
      }).catch(() => {
        throw new Error("Network error. Please check your connection and try again.");
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Server error. Please try again later.`);
      }
      
      const data = await res.json().catch(() => {
        return { error: "Invalid server response" };
      });
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setShortformContent(data.content || shortformContent);
      setChatInput("");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Full-screen Modal for Shortform (Gemini Canvas-like) mounted at top for reliable overlay */}
      {showShortformModal && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-background/90 backdrop-blur" />
          <div className="relative z-50 flex-1 flex max-h-screen w-full">
            {/* Left: Chat panel */}
            <div className="hidden md:flex w-full md:w-[36%] lg:w-[32%] xl:w-[28%] border-r bg-card flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">Chat with TransModa</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-sm text-muted-foreground">
                Type instructions to reformat or tweak the ideas on the right. Examples:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Make ideas shorter and punchier</li>
                  <li>Change voice to playful and contrarian</li>
                  <li>Add platform-specific hooks for TikTok</li>
                  <li>Preserve the *** separators and fields</li>
                </ul>
              </div>
              <div className="p-4 border-t space-y-3">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Chat with TransModa — describe how to change the content..."
                  className="w-full h-28 rounded-xl border bg-background p-3 text-sm"
                />
                <Button 
                  onClick={() => {
                    // Send message button clicked
                    handleReformat();
                  }} 
                  disabled={chatLoading || !chatInput} 
                  className="w-full"
                >
                  {chatLoading ? "Thinking..." : "Send Message"}
                </Button>
              </div>
            </div>

            {/* Right: Content focus area */}
            <div className="flex-1 bg-background flex flex-col">
              <div className="p-3 flex items-center justify-between border-b">
                <div className="text-sm text-muted-foreground">Viral Content Ideas</div>
                <div className="flex items-center gap-2">
                  <div className="relative download-container">
                    <button
                      aria-label="Download"
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      className="h-8 px-2 inline-flex items-center gap-1 justify-center rounded border hover:bg-muted text-sm"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    {/* dropdown */}
                    {showDownloadOptions && (
                      <div className="absolute right-0 mt-2 bg-popover border rounded-md shadow-md min-w-[140px] z-10">
                        <button 
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50" 
                          disabled={!shortformContent} 
                          onClick={() => {
                            downloadShortformTxt();
                            setShowDownloadOptions(false);
                          }}
                        >
                          TXT
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-50" 
                          disabled={!shortformContent} 
                          onClick={() => {
                            downloadShortformPdf();
                            setShowDownloadOptions(false);
                          }}
                        >
                          PDF
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    aria-label="Close"
                    className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted"
                    onClick={() => setShowShortformModal(false)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  {shortformLoading && !shortformContent ? (
                    <div className="flex items-center justify-center py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <div className="text-sm text-muted-foreground">Generating content...</div>
                      </div>
                    </div>
                  ) : (
                    <ShortformContent content={shortformContent} />
                  )}
                </div>
              </div>
              <div className="p-3 border-t flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowShortformModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Global loading overlay while summary is generating */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="relative z-10 bg-card border rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-foreground" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-foreground">Analyzing your file...</div>
                <div className="text-xs text-muted-foreground">This typically takes a few seconds</div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <div className="mt-2 text-right text-xs text-muted-foreground">{progress}%</div>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Transform PDFs into
            <br />
            <span className="text-primary">Viral Content</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload any PDF document and instantly generate engaging shortform content ideas for TikTok, Instagram, and YouTube Shorts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">$480B</div>
              <div className="text-sm text-muted-foreground">Creator Economy by 2027</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">50M+</div>
              <div className="text-sm text-muted-foreground">Global Creators</div>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">10x</div>
              <div className="text-sm text-muted-foreground">Faster Content Creation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {!showSummary ? (
            <>
              {/* Upload Area */}
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 mb-8 ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="pdf-input"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {isDragOver ? 'Drop your file here' : 'Upload your document'}
                    </h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Drag and drop a PDF or text file here, or click the button below
                    </p>
                    <Button 
                      onClick={() => document.getElementById('pdf-input')?.click()}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg font-semibold"
                    >
                      <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center mb-8">
                <Button 
                  onClick={() => {
                    handleSummarize("summary");
                    setShowSummary(true);
                  }}
                  disabled={!file || loading}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-12 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Bar */}
              {loading && (
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Processing your document...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-sm text-destructive mb-8">
                  {errorMessage}
                </div>
              )}

              {/* File Info */}
              {file && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border mb-8">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* AI Summary Results */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <CardTitle className="text-xl">AI Summary</CardTitle>
                    </div>
                    <Button 
                      onClick={handleBackToUpload}
                      variant="outline"
                      size="sm"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Another
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    <FormattedSummary text={summary} />
                  </div>
                </CardContent>
              </Card>

              {/* Shortform Content Generation */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Create Viral Content
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Generate engaging shortform content ideas for social media platforms
                  </p>
                  <Button 
                    onClick={handleShortformGeneration}
                    disabled={shortformLoading}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 px-8 text-lg font-semibold"
                  >
                    {shortformLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating Content Ideas...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Shortform Content
                      </>
                    )}
                  </Button>
                </div>

                {/* Shortform Content Results */}
                {shortformContent && !showShortformModal && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <CardTitle className="text-xl">Viral Content Ideas</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        <ShortformContent content={shortformContent} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Message for Shortform */}
                {errorMessage && (
                  <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>


      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How <span className="text-primary">Transmoda</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform any PDF into viral content in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">1. Upload PDF</h3>
              <p className="text-muted-foreground">
                Drag and drop any PDF document or text file. Our AI processes it instantly.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Advanced AI extracts key insights and generates structured summaries.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">3. Generate Content</h3>
              <p className="text-muted-foreground">
                Get viral content ideas with titles, voiceovers, hashtags, and key points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Economy Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join the <span className="text-primary">$480B Creator Economy</span><sup className="text-sm text-muted-foreground">1</sup>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              According to Goldman Sachs Research, the creator economy is projected to reach nearly half a trillion dollars by 2027<sup className="text-sm text-muted-foreground">1</sup>. 
              Don&apos;t miss out on this massive opportunity.
            </p>
          </div>

          {/* Key Statistics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-card border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">$480B<sup className="text-sm text-muted-foreground">1</sup></div>
              <div className="text-sm text-muted-foreground">Projected Market Size by 2027</div>
            </div>
            <div className="bg-card border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">50M<sup className="text-sm text-muted-foreground">1</sup></div>
              <div className="text-sm text-muted-foreground">Global Creators</div>
            </div>
            <div className="bg-card border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">70%<sup className="text-sm text-muted-foreground">1</sup></div>
              <div className="text-sm text-muted-foreground">Revenue from Brand Deals</div>
            </div>
            <div className="bg-card border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">10-20%<sup className="text-sm text-muted-foreground">1</sup></div>
              <div className="text-sm text-muted-foreground">Annual Growth Rate</div>
            </div>
          </div>

          {/* Why Creators Need AI */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Why Creators Need AI-Powered Content</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-foreground text-lg">Scale Production</h4>
                <p className="text-muted-foreground text-sm">
                  With 50M creators competing for attention, AI helps you produce more high-quality content faster.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-foreground text-lg">Diversify Revenue</h4>
                <p className="text-muted-foreground text-sm">
                  Create multiple content formats from one source to maximize your 70% brand deal revenue.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-foreground text-lg">Beat Competition</h4>
                <p className="text-muted-foreground text-sm">
                  Only 4% of creators are professionals earning $100K+. AI gives you the edge to join them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">Transmoda</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for creators who want to scale their content production and maximize engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Process any PDF in seconds with our advanced AI technology. No waiting, no delays.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Viral Content Ideas</h3>
              <p className="text-muted-foreground">
                Get ready-to-use content ideas with titles, voiceovers, hashtags, and key points.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Interactive Editing</h3>
              <p className="text-muted-foreground">
                Chat with AI to refine and customize your content ideas in real-time.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your documents are processed securely and never stored permanently.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Easy Export</h3>
              <p className="text-muted-foreground">
                Download your content ideas as PDF or TXT files for easy sharing and editing.
              </p>
            </div>

            <div className="bg-card border rounded-xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Platform Optimized</h3>
              <p className="text-muted-foreground">
                Content ideas tailored for TikTok, Instagram Reels, YouTube Shorts, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to Transform Your PDFs into Viral Content?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already using Transmoda to scale their content production and maximize their reach in the $480B creator economy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg font-semibold"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Start Creating Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg font-semibold"
                  onClick={() => window.open(config.urls.goldmanSachs, '_blank')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Summary */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                About the <span className="text-primary">Creator</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Meet the developer behind Transmoda
              </p>
            </div>
            
            <div className="bg-card border rounded-2xl p-8 md:p-12">
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">Michael Liu</h3>
                  <p className="text-primary font-medium text-lg">Full Stack Developer</p>
                </div>
                
                <div className="space-y-4">
                  <a 
                    href="mailto:mliudev@proton.me" 
                    className="flex items-center justify-center gap-3 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors group"
                  >
                    <svg className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-foreground font-medium">mliudev@proton.me</span>
                  </a>
                  
                  <a 
                    href={config.urls.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors group"
                  >
                    <svg className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-foreground font-medium">LinkedIn Profile</span>
                  </a>
                  
                  <a 
                    href={config.urls.personalWebsite} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-muted hover:bg-muted/80 rounded-xl transition-colors group"
                  >
                    <svg className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <span className="text-foreground font-medium">Personal Website</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citations Section */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-6">Sources & Citations</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <sup className="text-xs text-primary font-medium mt-1">1</sup>
                <div>
                  <p className="font-medium text-foreground mb-1">Goldman Sachs Research (2023)</p>
                  <p className="mb-2">
                    &quot;The creator economy could approach half-a-trillion dollars by 2027.&quot; 
                    <em>Goldman Sachs Insights</em>, April 19, 2023.
                  </p>
                  <a 
                    href={config.urls.goldmanSachs} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline"
                  >
                    {config.urls.goldmanSachs}
                  </a>
                  <p className="mt-2 text-xs">
                    <strong>Key findings cited:</strong> $480B projected market size by 2027, 50M global creators, 
                    70% revenue from brand deals, 10-20% annual growth rate, 4% professional creators earning $100K+ annually.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
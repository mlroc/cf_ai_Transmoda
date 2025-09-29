"use client";
import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, TrendingUp, Users, Zap, Copy, Check } from "lucide-react";

interface ShortformIdea {
  id: string;
  title: string;
  voiceover: string;
  hashtags: string[];
  category: string;
  engagement: "high" | "medium" | "low";
  description?: string;
  keyPoints?: string;
}

interface ShortformContentProps {
  content: string;
}

const ideaIcons = {
  insights: Lightbulb,
  education: Lightbulb,
  practical: Target,
  trends: TrendingUp,
  community: Users,
  innovation: Zap,
};

const engagementColors = {
  high: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

// Removed motion variants since we're not using framer-motion

// Parse the asterisk-based content into structured ideas
function parseShortformContent(content: string): ShortformIdea[] {
  const ideas: ShortformIdea[] = [];
  
  // Split by the *** separators
  const ideaSections = content.split(/\*\*\*/).filter(section => section.trim());
  
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
      // Determine category based on content
      const category = determineCategory(title, voiceover || description);
      const engagement = determineEngagement(title, voiceover || description, hashtags);
      
      ideas.push({
        id: `idea-${index + 1}`,
        title,
        voiceover: voiceover || description, // Use voiceover if available, otherwise description
        hashtags,
        category,
        engagement,
        description, // Add description to the idea object
        keyPoints // Add key points to the idea object
      });
    }
  });
  
  return ideas;
}

function determineCategory(title: string, voiceover: string): string {
  const text = (title + " " + voiceover).toLowerCase();
  
  if (text.includes('insight') || text.includes('reveal') || text.includes('discover')) {
    return 'insights';
  } else if (text.includes('learn') || text.includes('teach') || text.includes('explain') || text.includes('understand')) {
    return 'education';
  } else if (text.includes('practical') || text.includes('apply') || text.includes('implement') || text.includes('use')) {
    return 'practical';
  } else if (text.includes('trend') || text.includes('future') || text.includes('emerging') || text.includes('new')) {
    return 'trends';
  } else if (text.includes('community') || text.includes('people') || text.includes('audience') || text.includes('social')) {
    return 'community';
  } else {
    return 'innovation';
  }
}

function determineEngagement(title: string, voiceover: string, hashtags: string[]): "high" | "medium" | "low" {
  const text = (title + " " + voiceover).toLowerCase();
  const highEngagementWords = ['viral', 'breakthrough', 'secret', 'shocking', 'amazing', 'incredible', 'revolutionary', 'hack', 'hidden', 'unknown', 'exclusive', 'insider'];
  const mediumEngagementWords = ['interesting', 'valuable', 'important', 'useful', 'effective', 'proven', 'guide', 'tips', 'strategy', 'framework'];
  
  const hasHighEngagement = highEngagementWords.some(word => text.includes(word));
  const hasMediumEngagement = mediumEngagementWords.some(word => text.includes(word));
  const hasViralHashtags = hashtags.some(tag => tag.toLowerCase().includes('viral') || tag.toLowerCase().includes('hack'));
  const hasQuestionTitle = title.includes('?') || title.includes('Why') || title.includes('How');
  
  if (hasHighEngagement || hasViralHashtags || hasQuestionTitle) {
    return 'high';
  } else if (hasMediumEngagement || title.length > 50 || hashtags.length > 5) {
    return 'medium';
  } else {
    return 'low';
  }
}

export default function ShortformContent({ content }: ShortformContentProps) {
  const [ideas, setIdeas] = useState<ShortformIdea[]>([]);
  const [visibleIdeas, setVisibleIdeas] = useState<number>(0);
  const [copiedIdeas, setCopiedIdeas] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      if (!content || typeof content !== 'string') {
        setError('Invalid content provided');
        return;
      }
      
      const parsedIdeas = parseShortformContent(content);
      setIdeas(parsedIdeas);
      setVisibleIdeas(0);
      setError(null);
      
      // Animate ideas appearing one by one
      const timer = setInterval(() => {
        setVisibleIdeas(prev => {
          if (prev < parsedIdeas.length) {
            return prev + 1;
          }
          clearInterval(timer);
          return prev;
        });
      }, 800);
      
      return () => clearInterval(timer);
    } catch {
      // Error parsing shortform content
      setError('Failed to parse content');
    }
  }, [content]);
  
  const copyIdeaToClipboard = async (idea: ShortformIdea) => {
    let ideaText = `${idea.title}\n\n`;
    
    if (idea.description) {
      ideaText += `Description: ${idea.description}\n\n`;
    }
    
    ideaText += `Voiceover: ${idea.voiceover}\n\n`;
    
    if (idea.keyPoints) {
      ideaText += `Key Points: ${idea.keyPoints}\n\n`;
    }
    
    ideaText += `Hashtags: ${idea.hashtags.join(' ')}`;
    
    try {
      await navigator.clipboard.writeText(ideaText);
      setCopiedIdeas(prev => new Set([...prev, idea.id]));
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedIdeas(prev => {
          const newSet = new Set(prev);
          newSet.delete(idea.id);
          return newSet;
        });
      }, 2000);
    } catch {
      // Failed to copy text
    }
  };
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-4">
          <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-destructive font-medium">Error loading content</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground/40 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Parsing content ideas...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          Shortform Content Ideas
        </h2>
        <p className="text-muted-foreground text-sm">
          {ideas.length} creative content ideas ready for your next viral post
        </p>
      </div>
      
      <div>
        {ideas.slice(0, visibleIdeas).map((idea, index) => {
          const IconComponent = ideaIcons[idea.category as keyof typeof ideaIcons] || Lightbulb;
          
          return (
            <div
              key={idea.id}
              className="group"
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-card-foreground text-lg group-hover:text-primary transition-colors">
                          {idea.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${engagementColors[idea.engagement]}`}
                          >
                            {idea.engagement} engagement
                          </Badge>
                          <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                            {idea.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyIdeaToClipboard(idea)}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors group/copy"
                        title="Copy idea to clipboard"
                      >
                        <div>
                          {copiedIdeas.has(idea.id) ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground group-hover/copy:text-foreground" />
                          )}
                        </div>
                      </button>
                      <div className="text-2xl font-bold text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {idea.description && (
                      <div>
                        <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Description
                        </h4>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {idea.description}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Voiceover Script
                      </h4>
                      <p className="text-muted-foreground leading-relaxed text-sm bg-muted rounded-lg p-3 border">
                        {idea.voiceover}
                      </p>
                    </div>
                    
                    {idea.keyPoints && (
                      <div>
                        <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Key Points
                        </h4>
                        <p className="text-muted-foreground leading-relaxed text-sm bg-muted/50 rounded-lg p-3 border border-dashed">
                          {idea.keyPoints}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {idea.hashtags.map((hashtag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="outline"
                            className="text-xs bg-muted text-muted-foreground border-border hover:bg-muted/80 transition-colors"
                          >
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
      
      {visibleIdeas < ideas.length && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <div className="animate-pulse w-2 h-2 bg-primary rounded-full"></div>
            <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
            <div className="animate-pulse w-2 h-2 bg-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
            <span className="ml-2">Loading more ideas...</span>
          </div>
        </div>
      )}
    </div>
  );
}

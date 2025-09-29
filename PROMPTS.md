I started chatting with Gemini 2.5 pro about project
requirements, feasibility, etc. After arriving to a 
reasonable conclusion I asked it for prompt to start building via json prompting

I started solving issues with natural langauge 
while integrating frontend/styling features as well.

To add or enhance features I continued being specific or using json prompting.

An example of what I gave is as follows:

'''
{
  "project": "Transmoda",
  "description": "An AI-powered PDF-to-content creation app using Next.js, Cloudflare Pages, shadcn/ui for a beautiful user interface, and Llama 3.3 on Workers AI. Fully utilizes Cloudflare's Durable Objects for state/memory and coordination, and supports chat-based user input.",
  "frontend": {
    "framework": "Next.js",
    "deployment": "Cloudflare Pages",
    "ui_library": "shadcn/ui",
    "user_input": [
      "PDF upload",
      "Chat interface (not voice)"
    ],
    "sample_component": "Main page features PDF upload and a chat UI for interacting with summarized content using shadcn/ui components."
  },
  "backend": {
    "api_route": "/api/summarize-pdf",
    "worker_flow": [
      "Accept PDF upload and store in R2 storage",
      "Assign Durable Object instance per user/session",
      "Extract text from PDF (using a parser compatible with Workers)",
      "Chunk and coordinate summarization using Durable Objects",
      "Send each chunk or full text to Llama 3.3 on Workers AI",
      "Aggregate summary results, store session history/state in Durable Objects",
      "Return summary to the frontend"
    ],
    "workflow_support": [
      "Durable Objects for coordination, memory, and chunk tracking",
      "Optional: Cloudflare Workflows for background/batch tasks"
    ]
  },
  "llm": {
    "provider": "Cloudflare Workers AI",
    "model": "Llama 3.3",
    "purpose": "Summarization and content generation from parsed PDF text"
  },
  "state_and_memory": {
    "management": "Cloudflare Durable Objects per session/user",
    "use_cases": [
      "Persistent session state (uploads, summaries, chat history)",
      "User memory across sessions",
      "Chunk/result coordination for large files"
    ]
  },
  "user_input_modes": [
    "PDF upload (Next.js UI)",
    "Chat (no voice input; chat interface only)"
  ],
  "meets_requirements": {
    "llm": true,
    "workflow_coordination": true,
    "chat_voice": "chat only",
    "memory_state": true
  }
}
'''
# 🤖 Chat Agent Starter Kit

![npm i agents command](./npm-agents-banner.svg)

A starter template for building AI-powered chat agents using the AI SDK, powered by [`agents`](https://www.npmjs.com/package/agents). This project provides a foundation for creating interactive chat experiences with AI, complete with a modern UI and tool integration capabilities.

## Features

- 💬 Interactive chat interface with AI
- 🛠️ Built-in tool system with human-in-the-loop confirmation
- 📅 Advanced task scheduling (one-time, delayed, and recurring via cron)
- 🌓 Dark/Light theme support
- ⚡️ Real-time streaming responses
- 🔄 State management and chat history
- 🎨 Modern, responsive UI

## Prerequisites

- OpenAI API key

## Quick Start

1. Create a new project:

```bash
npx create-vite@latest my-ai-agent --template react-ts
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment:

Create a `.dev.vars` file:

```env
OPENAI_API_KEY=your_openai_api_key
```

4. Run locally:

```bash
npm start
```

5. Deploy:

```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── app.tsx        # Chat UI implementation
│   ├── server.ts      # Chat agent logic
│   ├── tools.ts       # Tool definitions
│   ├── utils.ts       # Helper functions
│   └── styles.css     # UI styling
```

## Customization Guide

### Adding New Tools

Add new tools in `tools.ts` using the tool builder:

```ts
// Example of a tool that requires confirmation
const searchDatabase = tool({
  description: "Search the database for user records",
  parameters: z.object({
    query: z.string(),
    limit: z.number().optional()
  })
  // No execute function = requires confirmation
});

// Example of an auto-executing tool
const getCurrentTime = tool({
  description: "Get current server time",
  parameters: z.object({}),
  execute: async () => new Date().toISOString()
});

// Scheduling tool implementation
const scheduleTask = tool({
  description:
    "schedule a task to be executed at a later time. 'when' can be a date, a delay in seconds, or a cron pattern.",
  parameters: z.object({
    type: z.enum(["scheduled", "delayed", "cron"]),
    when: z.union([z.number(), z.string()]),
    payload: z.string()
  }),
  execute: async ({ type, when, payload }) => {
    // ... see the implementation in tools.ts
  }
});
```

To handle tool confirmations, add execution functions to the `executions` object:

```typescript
export const executions = {
  searchDatabase: async ({
    query,
    limit
  }: {
    query: string;
    limit?: number;
  }) => {
    // Implementation for when the tool is confirmed
    const results = await db.search(query, limit);
    return results;
  }
  // Add more execution handlers for other tools that require confirmation
};
```

Tools can be configured in two ways:

1. With an `execute` function for automatic execution
2. Without an `execute` function, requiring confirmation and using the `executions` object to handle the confirmed action. NOTE: The keys in `executions` should match `toolsRequiringConfirmation` in `app.tsx`.

### Use a different AI model provider

The starting [`server.ts`](https://github.com/ai-sdk/agents-starter/blob/main/src/server.ts) implementation uses the [`ai-sdk`](https://sdk.vercel.ai/docs/introduction) and the [OpenAI provider](https://sdk.vercel.ai/providers/ai-sdk-providers/openai), but you can use any AI model provider by:

1. Installing an alternative AI provider for the `ai-sdk`, such as the [`anthropic`](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic) or [`google`](https://sdk.vercel.ai/providers/ai-sdk-providers/google) provider:
2. Replacing the AI SDK with the [OpenAI SDK](https://github.com/openai/openai-node)

For example, to use the [`anthropic`](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic) provider, install the package:

```sh
npm install @ai-sdk/anthropic
```

Replace the `@ai-sdk/openai` import and usage with the `anthropic` provider:

```diff
// server.ts
// Change the imports
- import { openai } from "@ai-sdk/openai";
+ import { anthropic } from "@ai-sdk/anthropic";

// Use it when calling the streamText method (or other methods)
// from the ai-sdk
- const model = openai("gpt-4o-2024-11-20");
+ const model = anthropic("claude-3-5-sonnet-20241022");
```

Commit your changes and then run the `agents-starter` as per the rest of this README.

### Modifying the UI

The chat interface is built with React and can be customized in `app.tsx`:

- Modify the theme colors in `styles.css`
- Add new UI components in the chat container
- Customize message rendering and tool confirmation dialogs
- Add new controls to the header

### Example Use Cases

1. **Customer Support Agent**
   - Add tools for:
     - Ticket creation/lookup
     - Order status checking
     - Product recommendations
     - FAQ database search

2. **Development Assistant**
   - Integrate tools for:
     - Code linting
     - Git operations
     - Documentation search
     - Dependency checking

3. **Data Analysis Assistant**
   - Build tools for:
     - Database querying
     - Data visualization
     - Statistical analysis
     - Report generation

4. **Personal Productivity Assistant**
   - Implement tools for:
     - Task scheduling with flexible timing options
     - One-time, delayed, and recurring task management
     - Task tracking with reminders
     - Email drafting
     - Note taking

5. **Scheduling Assistant**
   - Build tools for:
     - One-time event scheduling using specific dates
     - Delayed task execution (e.g., "remind me in 30 minutes")
     - Recurring tasks using cron patterns
     - Task payload management
     - Flexible scheduling patterns

Each use case can be implemented by:

1. Adding relevant tools in `tools.ts`
2. Customizing the UI for specific interactions
3. Extending the agent's capabilities in `server.ts`
4. Adding any necessary external API integrations

## Learn More

- [`agents`](https://github.com/ai-sdk/agents/blob/main/packages/agents/README.md)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Vercel AI Documentation](https://vercel.com/docs/ai)

## License

MIT

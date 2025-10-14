// Configuration for the application
import { env } from './env';

export const config = {
  // API endpoints
  api: {
    baseUrl: env.api.baseUrl,
    endpoints: {
      summarize: '/summarize',
      summarizePdfText: '/summarize-pdf-text',
      reformat: '/reformat',
    }
  },
  
  // External URLs
  urls: {
    goldmanSachs: env.urls.goldmanSachs,
    linkedin: env.urls.linkedin,
    github: env.urls.github,
    personalWebsite: env.urls.personalWebsite,
  },
  
  // PDF.js configuration
  pdfjs: {
    version: '5.4.149',
    cdn: 'https://unpkg.com',
    jsdelivr: 'https://cdn.jsdelivr.net',
  },
  
  // Application settings
  app: {
    name: 'Transmoda',
    description: 'Transform your PDFs into viral content',
    url: env.app.url,
  }
} as const;

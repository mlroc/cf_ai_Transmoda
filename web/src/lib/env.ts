// Environment variable configuration
export const env = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://transmoda-worker.uravgpcuser.workers.dev',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://transmoda.com',
  },
  urls: {
    goldmanSachs: process.env.NEXT_PUBLIC_GOLDMAN_SACHS_URL || 'https://www.goldmansachs.com/insights/articles/the-creator-economy-could-approach-half-a-trillion-dollars-by-2027',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/in/liumichael04/',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/mlroc',
    personalWebsite: process.env.NEXT_PUBLIC_PERSONAL_WEBSITE_URL || 'https://mlroc.github.io/',
  }
} as const;

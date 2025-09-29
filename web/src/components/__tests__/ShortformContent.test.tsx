import { render, screen } from '@testing-library/react';
import ShortformContent from '../ShortformContent';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ShortformContent', () => {
  const mockContent = `# Shortform Content Ideas

*Title: The Secret to Viral Content
*Voiceover: This is the one thing that separates viral content from everything else. Most creators don't know this, but it's actually simpler than you think.
*Hashtags: #ViralContent, #CreatorTips, #SocialMedia, #ContentStrategy, #GrowthHacking

***

*Title: Why Your Content Isn't Performing
*Voiceover: If your content isn't getting the engagement you want, it's probably because you're missing this crucial element that all successful creators use.
*Hashtags: #ContentMarketing, #Engagement, #SocialMediaTips, #CreatorLife, #DigitalMarketing

***

*Title: The Psychology Behind Scroll-Stopping Hooks
*Voiceover: Understanding the psychology of what makes people stop scrolling is the key to creating content that actually gets seen and shared.
*Hashtags: #Psychology, #ContentCreation, #SocialMedia, #Marketing, #BehavioralScience

***

*Title: How to Turn Any Topic Into Viral Content
*Voiceover: The framework that transforms boring topics into engaging content that people can't stop watching and sharing.
*Hashtags: #ContentFramework, #ViralTips, #ContentCreation, #SocialMedia, #Strategy

***

*Title: The Hidden Algorithm Hack That Works
*Voiceover: This little-known algorithm trick has helped creators go from 0 to millions of views, and it's completely legal and ethical.
*Hashtags: #AlgorithmHack, #GrowthHacking, #SocialMedia, #CreatorTips, #ViralContent`;

  it('renders shortform content ideas correctly', () => {
    render(<ShortformContent content={mockContent} />);
    
    // Check if the main heading is rendered
    expect(screen.getByText('Shortform Content Ideas')).toBeInTheDocument();
    
    // Check if ideas are parsed and displayed
    expect(screen.getByText('The Secret to Viral Content')).toBeInTheDocument();
    expect(screen.getByText('Why Your Content Isn\'t Performing')).toBeInTheDocument();
    expect(screen.getByText('The Psychology Behind Scroll-Stopping Hooks')).toBeInTheDocument();
  });

  it('displays engagement levels and categories', () => {
    render(<ShortformContent content={mockContent} />);
    
    // Check if engagement badges are displayed
    expect(screen.getByText('high engagement')).toBeInTheDocument();
    expect(screen.getByText('insights')).toBeInTheDocument();
  });

  it('shows hashtags correctly', () => {
    render(<ShortformContent content={mockContent} />);
    
    // Check if hashtags are displayed
    expect(screen.getByText('#ViralContent')).toBeInTheDocument();
    expect(screen.getByText('#CreatorTips')).toBeInTheDocument();
  });
});

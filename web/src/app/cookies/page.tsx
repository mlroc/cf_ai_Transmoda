import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - Transmoda",
  description: "Cookie Policy for Transmoda - A Student Project",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Student Project Disclaimer
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              <strong>Transmoda is a student project created for educational purposes.</strong> 
              Our cookie usage is minimal and primarily for basic functionality. 
              This is not a commercial product and our cookie practices reflect educational project standards.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files that are stored on your device when you visit a website. 
            They help websites remember information about your visit, such as your preferences and settings.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p className="mb-4">
            As a student project, Transmoda uses cookies minimally for:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Essential Functionality:</strong> Basic website operation and user experience</li>
            <li><strong>Analytics:</strong> Understanding how users interact with our student project</li>
            <li><strong>Preferences:</strong> Remembering basic user settings (if any)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Essential Cookies</h3>
          <p className="mb-4">
            These cookies are necessary for the website to function properly. They cannot be disabled.
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Session management cookies</li>
            <li>Security cookies</li>
            <li>Load balancing cookies</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Analytics Cookies</h3>
          <p className="mb-4">
            These cookies help us understand how our student project is being used (educational purposes only).
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Page view tracking</li>
            <li>User interaction analytics</li>
            <li>Error logging and debugging</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
          <p className="mb-4">
            Our student project may use third-party services that set their own cookies:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Cloudflare:</strong> For website hosting, security, and performance</li>
            <li><strong>Google Analytics:</strong> For understanding usage patterns (if enabled)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p className="mb-4">
            You can control cookies through your browser settings:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
            <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Cookie Retention</h2>
          <p className="mb-4">
            As a student project, we keep cookies for minimal periods:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Deleted within 30 days maximum</li>
            <li><strong>Analytics Data:</strong> Aggregated and anonymized within 24 hours</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Student Project Limitations</h2>
          <p className="mb-4">
            <strong>Important:</strong> As this is a student project, we cannot provide:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Advanced cookie management tools</li>
            <li>Detailed cookie preference settings</li>
            <li>Enterprise-level cookie compliance</li>
            <li>24/7 support for cookie-related issues</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Updates to This Policy</h2>
          <p className="mb-4">
            This cookie policy may be updated as our student project evolves. 
            We will attempt to notify users of significant changes, but cannot guarantee consistent updates.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p className="mb-4">
            For questions about our cookie usage, contact:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> mliudev@proton.me<br />
            <strong>Project Creator:</strong> Michael Liu<br />
            <strong>Institution:</strong> University of Rochester
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Project Status:</strong> Student Project - Not for Commercial Use
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

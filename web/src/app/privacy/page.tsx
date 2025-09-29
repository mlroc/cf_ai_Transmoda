import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Transmoda",
  description: "Privacy Policy for Transmoda - A Student Project",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Student Project Disclaimer
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              <strong>Transmoda is a student project created for educational purposes.</strong> 
              This is not a commercial product and should not be used for production purposes. 
              While we strive to protect your privacy, this project is primarily for learning and demonstration purposes.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">
            When you use Transmoda, we may collect the following information:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>PDF Files:</strong> Files you upload for processing are temporarily stored and processed by our AI systems</li>
            <li><strong>Usage Data:</strong> Basic usage statistics and error logs to improve the service</li>
            <li><strong>Technical Information:</strong> Browser type, device information, and IP address for basic analytics</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            As a student project, we use your information for:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Processing your PDF files to generate summaries and content ideas</li>
            <li>Improving the AI models and algorithms (educational purposes)</li>
            <li>Understanding usage patterns for academic research</li>
            <li>Debugging and fixing technical issues</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Storage and Security</h2>
          <p className="mb-4">
            <strong>Important:</strong> As this is a student project, we cannot guarantee enterprise-level security. 
            Your uploaded files are processed and then deleted from our systems within 24 hours. 
            We use basic security measures appropriate for educational projects.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
          <p className="mb-4">
            Transmoda uses the following services:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Cloudflare Workers:</strong> For hosting and processing</li>
            <li><strong>Google Gemini AI:</strong> For content analysis and generation</li>
            <li><strong>Cloudflare:</strong> For website hosting and CDN</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
          <p className="mb-4">
            Since this is a student project, we have limited resources to handle data requests. 
            However, you have the right to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Request information about what data we have collected</li>
            <li>Request deletion of your data (though it&apos;s automatically deleted within 24 hours)</li>
            <li>Opt out of data collection by not using the service</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p className="mb-4">
            For privacy-related questions about this student project, contact:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> mliudev@proton.me<br />
            <strong>Project Creator:</strong> Michael Liu<br />
            <strong>Institution:</strong> University of Rochester
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
          <p className="mb-6">
            As this is a student project, this privacy policy may change frequently. 
            We will attempt to notify users of significant changes, but cannot guarantee consistent updates.
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

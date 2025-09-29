import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Transmoda",
  description: "Terms of Service for Transmoda - A Student Project",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Student Project Disclaimer
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              <strong>Transmoda is a student project created for educational purposes.</strong> 
              This service is provided &quot;as is&quot; without any warranties or guarantees. 
              It is not intended for commercial use and should not be relied upon for production purposes.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By using Transmoda, you acknowledge that this is a student project and agree to these terms. 
            If you do not agree with these terms, please do not use the service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Description of Service</h2>
          <p className="mb-4">
            Transmoda is an AI-powered tool that analyzes PDF documents and generates summaries and content ideas. 
            This service is provided for educational and demonstration purposes only.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">User Responsibilities</h2>
          <p className="mb-4">As a user of this student project, you agree to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Use the service only for lawful and educational purposes</li>
            <li>Not upload malicious files or attempt to harm the system</li>
            <li>Not use the service for commercial purposes without permission</li>
            <li>Respect the limitations of a student project</li>
            <li>Not hold the creators liable for any issues or data loss</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Limitations and Disclaimers</h2>
          <p className="mb-4">
            <strong>Important Limitations:</strong>
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>This is a student project with no commercial support</li>
            <li>No uptime guarantees or service level agreements</li>
            <li>Data may be lost or corrupted without notice</li>
            <li>AI-generated content may be inaccurate or inappropriate</li>
            <li>No warranty of any kind, express or implied</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
          <p className="mb-4">
            The Transmoda service and its underlying technology are the intellectual property of the student creator. 
            You retain ownership of any content you upload, but grant us permission to process it for the service.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Privacy and Data</h2>
          <p className="mb-4">
            Your privacy is important to us, but as a student project, we cannot provide enterprise-level privacy guarantees. 
            Please review our Privacy Policy for more details. Data is automatically deleted within 24 hours.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Prohibited Uses</h2>
          <p className="mb-4">You may not use Transmoda to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Violate any laws or regulations</li>
            <li>Upload copyrighted material without permission</li>
            <li>Attempt to reverse engineer or hack the system</li>
            <li>Use for commercial purposes without explicit permission</li>
            <li>Upload malicious or harmful content</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
          <p className="mb-4">
            As a student project, this service may be discontinued at any time without notice. 
            We reserve the right to terminate access for any user who violates these terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            <strong>To the maximum extent permitted by law, the creators of this student project shall not be liable for any damages, 
            including but not limited to direct, indirect, incidental, or consequential damages arising from the use of this service.</strong>
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
          <p className="mb-4">
            These terms may be updated at any time as this is an active student project. 
            Continued use of the service constitutes acceptance of any changes.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p className="mb-4">
            For questions about these terms, contact:
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

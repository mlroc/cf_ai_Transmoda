import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR Compliance - Transmoda",
  description: "GDPR Compliance Information for Transmoda - A Student Project",
};

export default function GDPRCompliance() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">GDPR Compliance</h1>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Student Project Disclaimer
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              <strong>Transmoda is a student project created for educational purposes.</strong> 
              While we strive to follow GDPR principles, this is not a commercial product and our compliance 
              measures are appropriate for educational projects, not enterprise-level operations.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What is GDPR?</h2>
          <p className="mb-4">
            The General Data Protection Regulation (GDPR) is a European Union law that governs data protection and privacy. 
            It gives individuals control over their personal data and requires organizations to be transparent about data collection and usage.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Data Processing Principles</h2>
          <p className="mb-4">
            As a student project, we follow these GDPR principles to the best of our ability:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Lawfulness:</strong> We process data only for educational and research purposes</li>
            <li><strong>Fairness:</strong> We are transparent about our data practices</li>
            <li><strong>Transparency:</strong> We clearly explain what data we collect and why</li>
            <li><strong>Purpose Limitation:</strong> We only use data for stated educational purposes</li>
            <li><strong>Data Minimization:</strong> We collect only the minimum data necessary</li>
            <li><strong>Accuracy:</strong> We strive to keep data accurate and up-to-date</li>
            <li><strong>Storage Limitation:</strong> We delete data within 24 hours</li>
            <li><strong>Security:</strong> We implement basic security measures appropriate for student projects</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights Under GDPR</h2>
          <p className="mb-4">
            As a student project, we have limited resources to handle all GDPR requests, but you have the right to:
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Right to Information</h3>
          <p className="mb-4">
            You have the right to know what personal data we process about you and why.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Right of Access</h3>
          <p className="mb-4">
            You can request a copy of the personal data we hold about you. 
            <strong>Note:</strong> As a student project, response times may be longer than commercial services.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Right to Rectification</h3>
          <p className="mb-4">
            You can request correction of inaccurate personal data. 
            However, since we automatically delete data within 24 hours, this may not be applicable.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Right to Erasure</h3>
          <p className="mb-4">
            You can request deletion of your personal data. 
            <strong>Note:</strong> Data is automatically deleted within 24 hours of processing.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Right to Restrict Processing</h3>
          <p className="mb-4">
            You can request that we limit how we process your data. 
            This may affect the functionality of our student project.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Right to Data Portability</h3>
          <p className="mb-4">
            You can request your data in a structured, machine-readable format. 
            <strong>Note:</strong> As a student project, we may not have advanced data export capabilities.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Right to Object</h3>
          <p className="mb-4">
            You can object to processing of your personal data for research purposes. 
            This may limit your ability to use our student project.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data We Process</h2>
          <p className="mb-4">
            As a student project, we process minimal personal data:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>PDF Files:</strong> Temporarily processed for AI analysis</li>
            <li><strong>Usage Data:</strong> Basic analytics for educational research</li>
            <li><strong>Technical Data:</strong> IP addresses and browser information</li>
            <li><strong>Error Logs:</strong> For debugging and improvement purposes</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Legal Basis for Processing</h2>
          <p className="mb-4">
            We process data based on:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Legitimate Interest:</strong> Educational research and project development</li>
            <li><strong>Consent:</strong> Implied consent through use of our student project</li>
            <li><strong>Research Purposes:</strong> Academic research and learning</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
          <p className="mb-4">
            <strong>Important:</strong> As a student project, we automatically delete all personal data within 24 hours of processing. 
            This exceeds GDPR requirements for data minimization.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
          <p className="mb-4">
            We implement basic security measures appropriate for student projects:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>HTTPS encryption for data transmission</li>
            <li>Basic access controls</li>
            <li>Automatic data deletion</li>
            <li>Secure hosting through Cloudflare</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">International Transfers</h2>
          <p className="mb-4">
            Our student project uses services that may transfer data internationally:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Cloudflare:</strong> Global hosting and CDN service with appropriate safeguards</li>
            <li><strong>Google Gemini:</strong> AI processing with data protection measures</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Student Project Limitations</h2>
          <p className="mb-4">
            <strong>Important:</strong> As a student project, we cannot provide:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>24/7 support for GDPR requests</li>
            <li>Enterprise-level data protection measures</li>
            <li>Guaranteed response times for data requests</li>
            <li>Advanced data management tools</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How to Exercise Your Rights</h2>
          <p className="mb-4">
            To exercise your GDPR rights, contact us at:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> mliudev@proton.me<br />
            <strong>Subject Line:</strong> &quot;GDPR Request - [Your Request Type]&quot;<br />
            <strong>Response Time:</strong> We will respond within 30 days (student project limitations may apply)
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Complaints</h2>
          <p className="mb-4">
            If you have concerns about our data processing, you can:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Contact us directly at mliudev@proton.me</li>
            <li>Contact your local data protection authority</li>
            <li>Note that this is a student project with limited resources</li>
          </ul>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Project Status:</strong> Student Project - Not for Commercial Use<br />
              <strong>GDPR Compliance Level:</strong> Educational Project Standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

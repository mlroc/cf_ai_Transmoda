import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security - Transmoda",
  description: "Security Information for Transmoda - A Student Project",
};

export default function Security() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Security</h1>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Student Project Disclaimer
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              <strong>Transmoda is a student project created for educational purposes.</strong> 
              While we implement basic security measures, this is not an enterprise-grade product. 
              Do not use this service for sensitive or confidential information.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Security Approach</h2>
          <p className="mb-4">
            As a student project, we implement security measures appropriate for educational purposes. 
            Our security approach focuses on basic protection while maintaining the educational nature of the project.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Protection Measures</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Encryption</h3>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>In Transit:</strong> All data transmission uses HTTPS/TLS encryption</li>
            <li><strong>At Rest:</strong> Basic encryption for stored data (limited scope)</li>
            <li><strong>File Processing:</strong> Temporary encryption during AI processing</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Access Controls</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>Basic authentication for service access</li>
            <li>Limited access to processing systems</li>
            <li>Student-level access controls (not enterprise-grade)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Data Retention</h3>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Automatic Deletion:</strong> All uploaded files deleted within 24 hours</li>
            <li><strong>Processing Data:</strong> Temporary storage only during analysis</li>
            <li><strong>Logs:</strong> Basic error logs retained for debugging (anonymized)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Infrastructure Security</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Hosting Security</h3>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Cloudflare:</strong> Secure hosting with DDoS protection, global CDN, and rate limiting</li>
            <li><strong>SSL Certificates:</strong> Valid SSL certificates for all connections</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Network Security</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>HTTPS-only connections</li>
            <li>Basic firewall protection</li>
            <li>Rate limiting to prevent abuse</li>
            <li>No direct database access from public internet</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">AI Processing Security</h2>
          <p className="mb-4">
            Our AI processing includes basic security measures:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Google Gemini API:</strong> Secure API communication with authentication</li>
            <li><strong>Data Isolation:</strong> Each request processed independently</li>
            <li><strong>No Data Persistence:</strong> AI models don&apos;t retain your data</li>
            <li><strong>Basic Validation:</strong> File type and size validation</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Security Limitations</h2>
          <p className="mb-4">
            <strong>Important:</strong> As a student project, we have limitations:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>No enterprise-grade security audits</li>
            <li>Limited security monitoring and alerting</li>
            <li>Basic incident response capabilities</li>
            <li>No dedicated security team</li>
            <li>Limited penetration testing</li>
            <li>No SOC 2 or similar certifications</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Privacy</h2>
          <p className="mb-4">
            We take privacy seriously within our student project constraints:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>No Data Selling:</strong> We never sell or share your data</li>
            <li><strong>Minimal Collection:</strong> We collect only necessary data</li>
            <li><strong>Automatic Deletion:</strong> Data deleted within 24 hours</li>
            <li><strong>No Tracking:</strong> Basic analytics only, no personal tracking</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Security Best Practices for Users</h2>
          <p className="mb-4">
            To help maintain security, please:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Only upload non-sensitive documents</li>
            <li>Don&apos;t upload confidential or personal information</li>
            <li>Use strong, unique passwords for any accounts</li>
            <li>Keep your browser and devices updated</li>
            <li>Report any security concerns immediately</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Incident Response</h2>
          <p className="mb-4">
            In case of a security incident:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>We will investigate and respond as quickly as possible</li>
            <li>We will notify affected users if necessary</li>
            <li>We will take appropriate remedial action</li>
            <li><strong>Note:</strong> Response times may be longer than commercial services</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Vulnerability Reporting</h2>
          <p className="mb-4">
            If you discover a security vulnerability, please report it to:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> mliudev@proton.me<br />
            <strong>Subject:</strong> &quot;Security Vulnerability Report&quot;<br />
            <strong>Response Time:</strong> We will acknowledge within 48 hours and investigate promptly
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Security</h2>
          <p className="mb-4">
            We rely on these third-party services for security:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Cloudflare:</strong> Secure hosting, deployment, and DDoS protection</li>
            <li><strong>Google Gemini:</strong> Secure AI processing</li>
            <li><strong>Next.js:</strong> Secure web framework</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Regular Updates</h2>
          <p className="mb-4">
            We regularly update our student project to address security issues:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Dependency updates for security patches</li>
            <li>Framework updates for latest security features</li>
            <li>Code improvements based on security best practices</li>
            <li>Regular review of security measures</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
          <p className="mb-4">
            For security-related questions or concerns:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> mliudev@proton.me<br />
            <strong>Project Creator:</strong> Michael Liu<br />
            <strong>Institution:</strong> University of Rochester<br />
            <strong>Response Time:</strong> Within 48 hours (student project limitations apply)
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Project Status:</strong> Student Project - Not for Commercial Use<br />
              <strong>Security Level:</strong> Educational Project Standards<br />
              <strong>Next Security Review:</strong> As needed for student project maintenance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

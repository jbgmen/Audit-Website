import React from 'react';
import { View } from '../types';

type LegalType = 'privacy' | 'terms' | 'cookies';

interface LegalSection {
  h: string;
  p: string | React.ReactNode;
}

interface LegalViewProps {
  type: LegalType;
  onBack: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, onBack }) => {
  const content = {
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "30/January/2026",
      intro: "VelaCore Analytics (“we”, “our”, “us”) respects your privacy and is committed to protecting the personal and business information of all users who access or use our platform. This Privacy Policy explains how we collect, use, store, and protect your information when you use VelaCore Analytics. By accessing or using our website or services, you agree to the terms of this Privacy Policy.",
      sections: [
        {
          h: "1. Information We Collect",
          p: (
            <div className="space-y-4">
              <p>We collect information only when it is necessary to provide, improve, and secure our services.</p>
              <div className="pl-4 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest mb-1">1.1 Information You Provide Directly</h4>
                  <p>When you use VelaCore Analytics, we may collect: Email address, Name or username, Payment-related information (handled securely by third-party providers), and Communication data (messages, support requests, feedback).</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest mb-1">1.2 Website Audit Data</h4>
                  <p>When you submit a website for analysis, we may process: Website URL, Publicly accessible website content, and Technical signals such as performance, structure, and metadata.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest mb-1">1.3 Automatically Collected Information</h4>
                  <p>We may automatically collect technical info such as: IP address, Browser type, Device information, and Usage activity. This helps us prevent abuse and maintain security.</p>
                </div>
              </div>
            </div>
          )
        },
        {
          h: "2. How We Use Your Information",
          p: "We use collected information strictly for legitimate purposes, including: Providing audit and analytics services, generating reports and certificates, managing user accounts, improving platform performance, communicating updates, and preventing fraud or misuse. We do not sell or rent user data to third parties."
        },
        {
          h: "3. Audit Reports & Certificates",
          p: "Audit results and certificates generated through VelaCore Analytics are tied to the user account that requested them, intended for professional and client-use purposes, and reflect data available at the time of analysis. Users are responsible for how they share results with third parties."
        },
        {
          h: "4. Data Storage & Retention",
          p: "We retain data only as long as necessary to provide services, maintain audit history, and meet legal requirements. Users may request deletion of their account and associated data, subject to legal obligations."
        },
        {
          h: "5. Cookies & Tracking Technologies",
          p: "VelaCore Analytics may use cookies to maintain login sessions, improve user experience, and analyze usage trends. You may control cookies through your browser settings, though some features may not function without them."
        },
        {
          h: "6. Third-Party Services",
          p: "We use trusted third-party services for payment processing, analytics, and infrastructure. These providers only receive information necessary to perform their services and must maintain confidentiality and security."
        },
        {
          h: "7. Data Security",
          p: "We implement reasonable technical and organizational measures to protect data against unauthorized access, loss, or misuse. However, no system is completely secure, and users use the platform at their own risk."
        },
        {
          h: "8. User Responsibilities",
          p: "Users agree not to submit websites they lack permission to analyze, not to misuse results for deceptive purposes, and to keep credentials secure. VelaCore is not responsible for misuse of reports."
        },
        {
          h: "9. Accuracy & Disclaimer",
          p: "Audit results are based on automated analytical systems evaluating publicly available data. Results are informational, not legal advice; we do not guarantee specific outcomes; and users should verify critical decisions independently."
        },
        {
          h: "10. Children’s Privacy",
          p: "VelaCore Analytics is not intended for individuals under the age of 13. We do not knowingly collect personal data from children."
        },
        {
          h: "11. International Users",
          p: "If you access VelaCore Analytics from outside your country, you acknowledge that your data may be processed and stored in jurisdictions with different data protection laws."
        },
        {
          h: "12. Changes to This Privacy Policy",
          p: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes acceptance."
        },
        {
          h: "13. Contact Information",
          p: (
            <div className="space-y-1">
              <p>Email: support@velacoreanalytics.com</p>
              <p>Platform: VelaCore Analytics</p>
            </div>
          )
        }
      ] as LegalSection[]
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "30/January/2026",
      intro: "These Terms of Service (“Terms”) govern your access to and use of the VelaCore Analytics platform (“Service”, “Platform”, “we”, “our”, “us”). By accessing or using VelaCore Analytics, you agree to be bound by these Terms. If you do not agree with these Terms, you must not use the platform.",
      sections: [
        {
          h: "1. Description of Service",
          p: "VelaCore Analytics provides automated website audit, analysis, reporting, and verification services based on publicly available website data and analytical systems. The platform is designed for informational, professional, and decision-support purposes only."
        },
        {
          h: "2. Eligibility",
          p: "To use VelaCore Analytics, you must: Be at least 18 years old, or have legal authority to enter into a binding agreement. By using the platform, you confirm that you meet these requirements."
        },
        {
          h: "3. User Accounts",
          p: "Some features require account creation. You agree to provide accurate information, keep credentials secure, and accept responsibility for all activities under your account. VelaCore Analytics is not responsible for unauthorized access caused by user negligence."
        },
        {
          h: "4. Acceptable Use",
          p: "You agree NOT to: Analyze websites you do not own or have permission to audit, use the platform for illegal or deceptive purposes, attempt to reverse engineer the platform, or abuse free usage limits. Violation may result in termination without notice."
        },
        {
          h: "5. Website Audits & Results",
          p: "Audit results are generated based on automated analysis of publicly accessible data, reflecting the condition of a website at the time of analysis. VelaCore Analytics does not guarantee accuracy, rankings, or specific business outcomes."
        },
        {
          h: "6. Certificates & Reports",
          p: "Audit certificates and reports are issued based on completed audits and are linked to the user account that generated them. Certificates do not represent legal, regulatory, or governmental approval."
        },
        {
          h: "7. Payments & Subscriptions",
          p: "Paid features require payment of applicable fees. By purchasing a plan, you authorize recurring charges (if applicable) and agree to maintain valid payment information. Prices and plans may change with reasonable notice."
        },
        {
          h: "8. Refund Policy (IMPORTANT)",
          p: (
            <div className="space-y-4">
              <p className="font-bold text-slate-900">Due to the nature of digital and analytical services, all payments are generally non-refundable.</p>
              <p>Refunds will only be considered under the following conditions: Duplicate charges, technical failure that prevented service delivery, or billing errors caused by the platform. Requests must be submitted within 7 days of the transaction.</p>
              <p className="text-slate-400 italic">We do not provide refunds for: Change of mind, partial usage, dissatisfaction with results, or misunderstanding of features. All refund decisions are final.</p>
            </div>
          )
        },
        {
          h: "9. Free Plans & Limitations",
          p: "Free plans are provided on an “as-is” basis and may be limited in features or frequency. Abuse of free access may result in restriction or termination of your account."
        },
        {
          h: "10. Intellectual Property",
          p: "All content, branding, reports, certificates, and platform components are the intellectual property of VelaCore Analytics. Users may not copy, resell, redistribute, or modify platform content without permission."
        },
        {
          h: "11. Disclaimer of Warranties",
          p: "The platform is provided “as is” and “as available”. We make no warranties regarding accuracy, reliability, availability, or suitability for a specific purpose. Use of the platform is at your own risk."
        },
        {
          h: "12. Limitation of Liability",
          p: "VelaCore Analytics shall not be liable for business losses, revenue loss, SEO ranking changes, client disputes, or indirect damages. Our total liability shall not exceed the amount paid by the user in the most recent billing period."
        },
        {
          h: "13. Termination",
          p: "We reserve the right to suspend or terminate accounts and restrict access if these Terms are violated or if misuse is detected."
        },
        {
          h: "14. Changes to Terms",
          p: "We may update these Terms from time to time. Updated Terms will be posted on this page with a revised date. Continued use of the platform constitutes acceptance of the updated Terms."
        },
        {
          h: "15. Governing Law",
          p: "These Terms shall be governed and interpreted in accordance with applicable laws of the operating jurisdiction of VelaCore Analytics."
        },
        {
          h: "16. Contact Information",
          p: "For questions related to these Terms or refunds, contact: support@velacoreanalytics.com"
        }
      ] as LegalSection[]
    },
    cookies: {
      title: "Cookie Policy",
      lastUpdated: "January 24, 2024",
      intro: "This policy describes how VelaCore Analytics uses cookies to improve your experience on our platform.",
      sections: [
        {
          h: "Strictly Necessary",
          p: "We use essential cookies to maintain session states and ensure the stability of the AI audit engine during processing."
        },
        {
          h: "Analytics",
          p: "Minimal, anonymized analytics are used to improve the speed and performance of our auditing algorithms."
        }
      ] as LegalSection[]
    }
  }[type];

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-16">
        <button 
          onClick={onBack} 
          className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-primary mb-8 block transition-all"
        >
          ← Return to Command
        </button>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-950 uppercase tracking-tighter mb-4">{content.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Last updated: {content.lastUpdated}</p>
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Official Release</p>
        </div>
        {content.intro && (
          <p className="mt-10 text-lg text-slate-600 font-medium leading-relaxed italic">
            {content.intro}
          </p>
        )}
      </div>
      
      <div className="space-y-16">
        {content.sections.map((section, i) => (
          <div key={i} className="space-y-6 group">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:translate-x-2 transition-transform duration-300">
              {section.h}
            </h2>
            <div className="text-slate-600 leading-relaxed font-medium text-base md:text-lg border-l-2 border-slate-50 pl-6 group-hover:border-slate-200 transition-colors">
              {section.p}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 pt-12 border-t border-slate-100 space-y-8">
        <p className="text-sm text-slate-400 font-medium italic max-w-2xl">
          By using VelaCore Analytics, you acknowledge that you have read, understood, and agreed to these {content.title}.
        </p>
        <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Compliance Desk</p>
            <p className="text-lg font-bold">Need legal clarification?</p>
          </div>
          <a href="mailto:support@velacoreanalytics.com" className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default LegalView;
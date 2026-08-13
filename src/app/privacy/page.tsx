import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data governance for the ARC.BD free subdomain platform.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-slate-400 text-sm mt-1">Last updated: August 13, 2026</p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>
              When you register an account on ARC.BD to claim a subdomain, we collect minimal operational information required to manage your account:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Email address (for authentication and security alerts).</li>
              <li>Authentication provider ID (via Supabase Auth).</li>
              <li>Subdomain configuration and DNS target records.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. How We Use Your Data</h2>
            <p>Your data is strictly used to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Provide and maintain free DNS resolution for your subdomains.</li>
              <li>Verify ownership and prevent unauthorized subdomain claims.</li>
              <li>Send critical platform announcements or abuse resolution notices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Data Sharing & Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal data. Infrastructure data (DNS target records) is synced to our DNS infrastructure providers (such as Cloudflare) solely for the purpose of global DNS resolution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Data Retention & Deletion</h2>
            <p>
              You may delete your claimed subdomains or request account deletion at any time from your account dashboard. Deleting a subdomain removes its DNS routing configuration from our active database.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              For privacy inquiries, email support at <a href="mailto:admin@arc.bd" className="text-cyan-400 underline hover:text-cyan-300">admin@arc.bd</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

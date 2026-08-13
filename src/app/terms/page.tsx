import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and conditions for using the ARC.BD free subdomain platform.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
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
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ARC.BD (&quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform or claim subdomains under arc.bd.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Subdomain Usage Policy</h2>
            <p>
              ARC.BD provides free subdomains (e.g. yourname.arc.bd) for personal, educational, developer, and open-source projects. Subdomains remain the property of ARC.BD and are granted as a revocable license to the registered user.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Prohibited Activities</h2>
            <p>You agree not to use any ARC.BD subdomain for:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Phishing, malware distribution, command-and-control servers, or malicious activities.</li>
              <li>Spamming, SEO manipulation, or illegal content hosting.</li>
              <li>Impersonating trademarked brands, registered entities, or official services without authorization.</li>
              <li>Selling, auctioning, or squatting on subdomains.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Subdomain Suspension & Removal</h2>
            <p>
              ARC.BD reserves the right to suspend, terminate, or transfer any subdomain at any time without prior notice if a violation of these terms or an abuse report is received.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Disclaimer of Warranties</h2>
            <p>
              The Platform and free subdomains are provided &quot;AS IS&quot; without warranties of any kind. ARC.BD does not guarantee 100% uptime, un-interrupted DNS resolution, or permanent availability.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Questions regarding these terms? Contact support or file an abuse report at{' '}
              <Link href="/report" className="text-cyan-400 underline hover:text-cyan-300">
                arc.bd/report
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

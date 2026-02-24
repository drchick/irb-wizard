/**
 * contact.jsx — Public contact form
 * Saves submission to Supabase + emails admin via Resend
 */
import { useState } from 'react';
import Link from 'next/link';
import HomeNav from '../components/layout/HomeNav';
import Footer from '../components/layout/Footer';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const SUBJECTS = [
  'General Question',
  'Technical Support',
  'Pricing & Plans',
  'Partnership / Enterprise',
  'Bug Report',
  'Other',
];

const inputCls =
  'w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2.5 text-sm text-white ' +
  'placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', subject: 'General Question', message: '',
  });
  const [status, setStatus]   = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <HomeNav />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {status === 'success' ? (
            /* ── Success state ── */
            <div className="bg-navy-800 rounded-2xl border border-navy-700 p-10 text-center space-y-4">
              <CheckCircle size={52} className="text-emerald-400 mx-auto" />
              <h1 className="text-2xl font-bold text-white">Message Sent!</h1>
              <p className="text-slate-400 leading-relaxed">
                Thanks for reaching out. We&apos;ll get back to you within 1–2 business days.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <div className="bg-navy-800 rounded-2xl border border-navy-700 p-8">
              <h1 className="text-2xl font-bold text-white mb-1">Contact Us</h1>
              <p className="text-slate-400 text-sm mb-6">
                Have a question or need help? We respond within 1–2 business days.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" required value={form.name} onChange={set('name')}
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email" required value={form.email} onChange={set('email')}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select value={form.subject} onChange={set('subject')} className={inputCls}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required value={form.message} onChange={set('message')}
                    rows={5} placeholder="Tell us how we can help…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Error */}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit" disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-bold py-3 rounded-lg transition-colors"
                >
                  {status === 'sending' ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Send size={15} />
                  )}
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

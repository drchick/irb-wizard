/**
 * admin.jsx — Admin dashboard (Next.js)
 *
 * Tabs: Overview | Users | Usage | Purchases
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link          from 'next/link';
import { useAuth }     from '../context/AuthContext';
import { supabase }    from '../supabase';
import IRBWizLogo      from '../components/layout/IRBWizLogo';
import AdminRoute      from '../components/auth/AdminRoute';
import {
  LayoutDashboard, Users, Activity, ShoppingBag,
  RefreshCw, LogOut, TrendingUp, Zap, AlertCircle,
  Code2, Mail, MailOpen, Circle,
} from 'lucide-react';

// ── Shared fetch helper (sends Supabase session token) ─────────────────────────
async function adminFetch(path) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json();
}

// ── Tabs config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',   Icon: LayoutDashboard },
  { id: 'users',     label: 'Users',      Icon: Users           },
  { id: 'usage',     label: 'Usage',      Icon: Activity        },
  { id: 'purchases', label: 'Purchases',  Icon: ShoppingBag     },
  { id: 'messages',  label: 'Messages',   Icon: Mail            },
];

// ── Shared UI ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color = 'text-gold-400' }) {
  return (
    <div className="bg-navy-800 rounded-xl p-5 flex items-start gap-4 border border-navy-700">
      <div className={`mt-0.5 ${color}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <svg className="animate-spin h-8 w-8 text-gold-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="flex items-center gap-2 text-red-400 py-10 justify-center text-sm">
      <AlertCircle size={16} /> {msg}
    </div>
  );
}

function RefreshBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
      <RefreshCw size={14} /> Refresh
    </button>
  );
}

function SectionHeader({ title, sub, onRefresh }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {onRefresh && <RefreshBtn onClick={onRefresh} />}
    </div>
  );
}

// ── Date formatter ─────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Users table ────────────────────────────────────────────────────────────────
function UserTable({ users, compact = false }) {
  if (!users.length) {
    return <p className="text-slate-500 text-sm py-6 text-center">No users found.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-700">
      <table className="w-full text-sm">
        <thead className="bg-navy-800 text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Email</th>
            {!compact && <th className="text-left px-4 py-3">Name</th>}
            <th className="text-left px-4 py-3">Provider</th>
            <th className="text-left px-4 py-3">Signed Up</th>
            {!compact && <th className="text-left px-4 py-3">Last Sign In</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700">
          {users.map((u, i) => {
            const provider = u.app_metadata?.provider ?? 'email';
            return (
              <tr key={u.id ?? i} className="hover:bg-navy-800/50 transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{u.email}</td>
                {!compact && (
                  <td className="px-4 py-3 text-slate-400">
                    {u.user_metadata?.full_name ?? '—'}
                  </td>
                )}
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    provider === 'google'
                      ? 'bg-blue-900/60 text-blue-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {provider}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{fmtDate(u.created_at)}</td>
                {!compact && (
                  <td className="px-4 py-3 text-slate-400">{fmtDate(u.last_sign_in_at)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Usage table ────────────────────────────────────────────────────────────────
function UsageTable({ rows, compact = false }) {
  if (!rows.length) {
    return (
      <div className="text-slate-500 text-sm py-10 text-center space-y-1">
        <p>No usage logs yet.</p>
        <p className="text-xs">AI calls will appear here once the <code className="bg-navy-800 px-1 rounded">usage_logs</code> table is created.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-700">
      <table className="w-full text-sm">
        <thead className="bg-navy-800 text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">User</th>
            <th className="text-left px-4 py-3">Type</th>
            {!compact && <th className="text-left px-4 py-3">Section</th>}
            <th className="text-left px-4 py-3">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700">
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className="hover:bg-navy-800/50 transition-colors">
              <td className="px-4 py-3 text-slate-300">{r.user_email ?? 'Anonymous'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  r.endpoint === 'ai-comprehensive'
                    ? 'bg-purple-900/60 text-purple-300'
                    : 'bg-yellow-900/40 text-gold-400'
                }`}>
                  {r.endpoint === 'ai-comprehensive' ? 'Full Review' : 'Section Review'}
                </span>
              </td>
              {!compact && <td className="px-4 py-3 text-slate-400">{r.section ?? '—'}</td>}
              <td className="px-4 py-3 text-slate-400">{fmtDate(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── SQL setup note (Usage tab) ─────────────────────────────────────────────────
const USAGE_SQL = `CREATE TABLE usage_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_email TEXT,
  endpoint   TEXT NOT NULL,
  section    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;`;

function SqlSetupNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 text-sm">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
        <Code2 size={14} />
        <span className="font-medium">Set up usage logging</span>
        <span className="text-slate-500 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-slate-400 text-xs">
            Run this SQL in your Supabase project → SQL Editor to enable usage tracking:
          </p>
          <pre className="bg-navy-900 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto">
            {USAGE_SQL}
          </pre>
          <p className="text-slate-500 text-xs">
            Also add <code className="bg-navy-900 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your
            Vercel environment variables (Settings → Environment Variables).
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');

  const load = useCallback(async () => {
    setLoad(true); setError('');
    try   { setData(await adminFetch('/api/admin/stats')); }
    catch (e) { setError(e.message); }
    finally   { setLoad(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMsg msg={error} />;

  return (
    <div className="space-y-8">
      <SectionHeader title="Overview" onRefresh={load} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"       value={data.totalUsers}       icon={Users}      color="text-blue-400" />
        <StatCard label="New This Week"     value={data.newUsersThisWeek} icon={TrendingUp}  color="text-emerald-400" />
        <StatCard label="Total AI Reviews"  value={data.totalAiCalls}     icon={Zap}         color="text-gold-400" />
        <StatCard label="Reviews This Week" value={data.aiCallsThisWeek}  icon={Activity}    color="text-purple-400" />
      </div>

      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Recent Sign-Ups
        </h2>
        <UserTable users={data.recentUsers ?? []} compact />
      </section>

      {(data.recentUsage ?? []).length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recent AI Activity
          </h2>
          <UsageTable rows={data.recentUsage} compact />
        </section>
      )}
    </div>
  );
}

// ── Tab: Users ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoad(true); setError('');
    try   { setUsers((await adminFetch('/api/admin/users')).users ?? []); }
    catch (e) { setError(e.message); }
    finally   { setLoad(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (u.email ?? '').toLowerCase().includes(q) ||
           (u.user_metadata?.full_name ?? '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Users"
        sub={`${users.length} total account${users.length !== 1 ? 's' : ''}`}
        onRefresh={load}
      />
      <input
        type="search" value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by email or name…"
        className="w-full max-w-sm bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
      />
      {loading ? <Spinner /> : error ? <ErrorMsg msg={error} /> : <UserTable users={filtered} />}
    </div>
  );
}

// ── Tab: Usage ─────────────────────────────────────────────────────────────────
function UsageTab() {
  const [rows, setRows]    = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setError]  = useState('');

  const load = useCallback(async () => {
    setLoad(true); setError('');
    try   { setRows((await adminFetch('/api/admin/usage')).usage ?? []); }
    catch (e) { setError(e.message); }
    finally   { setLoad(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="AI Usage"
        sub={rows.length ? `${rows.length} recent log entries` : undefined}
        onRefresh={load}
      />
      <SqlSetupNote />
      {loading ? <Spinner /> : error ? <ErrorMsg msg={error} /> : <UsageTable rows={rows} />}
    </div>
  );
}

// ── Tab: Purchases ─────────────────────────────────────────────────────────────
function PurchasesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <ShoppingBag size={52} className="text-slate-700" />
      <h2 className="text-xl font-semibold text-white">Purchases</h2>
      <p className="text-sm text-slate-400 text-center max-w-sm leading-relaxed">
        Purchase tracking will be available once Stripe is integrated.
        All transactions will appear here with user, plan, amount, and date.
      </p>
      <a
        href="mailto:hello@irbwiz.help"
        className="mt-2 text-sm text-gold-400 hover:text-gold-300 underline"
      >
        Contact for enterprise / department pricing
      </a>
    </div>
  );
}

// ── SQL setup note (Messages tab) ─────────────────────────────────────────────
const MESSAGES_SQL = `CREATE TABLE contact_submissions (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;`;

function MessagesSqlNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-xl p-4 text-sm">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
        <Code2 size={14} />
        <span className="font-medium">Set up contact_submissions table</span>
        <span className="text-slate-500 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-slate-400 text-xs">
            Run this SQL in your Supabase project → SQL Editor to store contact form submissions:
          </p>
          <pre className="bg-navy-900 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto">
            {MESSAGES_SQL}
          </pre>
          <p className="text-slate-500 text-xs">
            Also add <code className="bg-navy-900 px-1 rounded">RESEND_API_KEY</code> and{' '}
            <code className="bg-navy-900 px-1 rounded">ADMIN_EMAIL</code> to Vercel env vars to
            receive email notifications for new submissions.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tab: Messages ──────────────────────────────────────────────────────────────
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoad]      = useState(true);
  const [error, setError]       = useState('');
  const [note, setNote]         = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoad(true); setError(''); setNote('');
    try {
      const data = await adminFetch('/api/admin/messages');
      setMessages(data.messages ?? []);
      if (data.note) setNote(data.note);
    } catch (e) { setError(e.message); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRead = async (msg) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: msg.id, read: !msg.read }),
    });
    setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, read: !m.read } : m));
  };

  const unread = messages.filter(m => !m.read).length;

  function fmtDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Contact Messages"
        sub={messages.length
          ? `${messages.length} total · ${unread} unread`
          : undefined}
        onRefresh={load}
      />

      <MessagesSqlNote />

      {note && (
        <div className="text-slate-500 text-xs bg-navy-800 border border-navy-700 rounded-lg px-3 py-2">
          {note}
        </div>
      )}

      {loading ? <Spinner /> : error ? <ErrorMsg msg={error} /> : (
        messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Mail size={40} className="text-slate-700" />
            <p className="text-sm">No contact submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id}
                className={`rounded-xl border p-4 transition-colors ${
                  msg.read
                    ? 'bg-navy-900 border-navy-700'
                    : 'bg-navy-800 border-navy-600'
                }`}>
                <div className="flex items-start gap-3">
                  {/* Read indicator */}
                  <button onClick={() => toggleRead(msg)} title={msg.read ? 'Mark unread' : 'Mark read'}
                    className="mt-0.5 shrink-0 text-slate-500 hover:text-gold-400 transition-colors">
                    {msg.read
                      ? <MailOpen size={16} className="text-slate-600" />
                      : <Circle size={10} className="text-gold-400 fill-gold-400 mt-1" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-sm font-semibold ${msg.read ? 'text-slate-400' : 'text-white'}`}>
                        {msg.name}
                      </span>
                      <a href={`mailto:${msg.email}`}
                        className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
                        {msg.email}
                      </a>
                      {msg.subject && (
                        <span className="text-xs text-slate-500 bg-navy-700 px-2 py-0.5 rounded">
                          {msg.subject}
                        </span>
                      )}
                      <span className="text-xs text-slate-600 ml-auto">{fmtDateTime(msg.created_at)}</span>
                    </div>

                    {/* Message preview / expand */}
                    <button
                      className="mt-1.5 text-left w-full"
                      onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                    >
                      {expanded === msg.id ? (
                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 truncate">
                          {msg.message}
                        </p>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Root Admin component ───────────────────────────────────────────────────────
function AdminDashboard() {
  const { signOut }     = useAuth();
  const router          = useRouter();
  const [tab, setTab]   = useState('overview');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white">

      {/* ── Top header ── */}
      <header className="bg-navy-800 border-b border-navy-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/"><IRBWizLogo size={32} variant="full" theme="dark" /></Link>
          <span className="text-xs bg-gold-500 text-navy-900 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            Admin
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </header>

      {/* ── Tab bar ── */}
      <div className="bg-navy-800 border-b border-navy-700 px-6">
        <div className="flex gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'overview'  && <OverviewTab  />}
        {tab === 'users'     && <UsersTab     />}
        {tab === 'usage'     && <UsageTab     />}
        {tab === 'purchases' && <PurchasesTab />}
        {tab === 'messages'  && <MessagesTab  />}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}

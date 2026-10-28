import { useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import Bookings from './Bookings';
import { Logo } from '../components/Picture';
import Calendar from './Calendar';
import NewBooking from './NewBooking';
import Rates from './Rates';
import BookingDetail from './BookingDetail';

type Tab = 'bookings' | 'calendar' | 'new' | 'rates';
const tabs: { id: Tab; label: string }[] = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'new', label: 'New booking' },
  { id: 'rates', label: 'Rates & seasons' },
];

const tabFromHash = (): Tab => {
  const h = window.location.hash.replace('#', '') as Tab;
  return tabs.some((t) => t.id === h) ? h : 'bookings';
};

function Shell({ children, onSignOut, email }: { children: React.ReactNode; onSignOut?: () => void; email?: string }) {
  return (
    <div className="portal">
      <header className="pt-header">
        <div className="pt-brand">
          <Logo sizes="120px" alt="" />
          <span>Staff portal</span>
        </div>
        {onSignOut && (
          <div className="pt-user">
            <span>{email}</span>
            <button className="pt-btn pt-btn-ghost" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}

function Login({ onDone }: { onDone?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMessage({ ok: false, text: error.message });
    else onDone?.();
  };

  const reset = async () => {
    if (!email) {
      setMessage({ ok: false, text: 'Enter your email address first.' });
      return;
    }
    setBusy(true);
    const { error } = await supabase!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dssa-portals/` });
    setBusy(false);
    setMessage(error ? { ok: false, text: error.message } : { ok: true, text: 'Check your email for a link to set a new password.' });
  };

  return (
    <form className="pt-card pt-auth" onSubmit={signIn}>
      <h1>Sign in</h1>
      <label className="pt-field">
        <span>Email</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="pt-field">
        <span>Password</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {message && <p className={message.ok ? 'pt-ok' : 'pt-error'}>{message.text}</p>}
      <button className="pt-btn pt-btn-primary" disabled={busy}>
        {busy ? 'Please wait…' : 'Sign in'}
      </button>
      <button type="button" className="pt-link" onClick={reset} disabled={busy}>
        Forgot password?
      </button>
    </form>
  );
}

function SetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase!.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(err.message);
    else onDone();
  };
  return (
    <form className="pt-card pt-auth" onSubmit={save}>
      <h1>Set a new password</h1>
      <label className="pt-field">
        <span>New password</span>
        <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="pt-error">{error}</p>}
      <button className="pt-btn pt-btn-primary" disabled={busy}>
        Save password
      </button>
    </form>
  );
}

export default function Portal() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [openId, setOpenId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setIsStaff(null);
      return;
    }
    supabase.rpc('is_staff').then(({ data }) => setIsStaff(Boolean(data)));
  }, [session]);

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <Shell>
        <div className="pt-card pt-auth">
          <h1>Not connected yet</h1>
          <p>
            The staff portal needs the Supabase project. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see
            README.md) and reload.
          </p>
        </div>
      </Shell>
    );
  }

  if (session === undefined) return <Shell>{null}</Shell>;
  if (!session) return <Shell><Login /></Shell>;

  const signOut = () => supabase!.auth.signOut();

  if (recovering) {
    return (
      <Shell onSignOut={signOut} email={session.user.email}>
        <SetPassword onDone={() => setRecovering(false)} />
      </Shell>
    );
  }

  if (isStaff === null) return <Shell onSignOut={signOut} email={session.user.email}>{null}</Shell>;
  if (!isStaff) {
    return (
      <Shell onSignOut={signOut} email={session.user.email}>
        <div className="pt-card pt-auth">
          <h1>No staff access</h1>
          <p>This account isn’t set up as staff yet. Ask the site administrator to add you (see README.md).</p>
        </div>
      </Shell>
    );
  }

  const go = (t: Tab) => {
    window.location.hash = t;
    setTab(t);
  };
  const changed = () => setVersion((v) => v + 1);

  return (
    <Shell onSignOut={signOut} email={session.user.email}>
      <nav className="pt-tabs" aria-label="Portal">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => go(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="pt-main">
        {tab === 'bookings' && <Bookings key={version} onOpen={setOpenId} />}
        {tab === 'calendar' && <Calendar key={version} onOpen={setOpenId} />}
        {tab === 'new' && (
          <NewBooking
            onCreated={(id) => {
              changed();
              setOpenId(id);
              go('bookings');
            }}
          />
        )}
        {tab === 'rates' && <Rates />}
      </main>
      {openId && <BookingDetail id={openId} onClose={() => setOpenId(null)} onChanged={changed} />}
    </Shell>
  );
}

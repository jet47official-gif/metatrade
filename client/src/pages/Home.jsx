import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Gift,
  ArrowUpRight,
  Headphones,
  BarChart3,
  Wallet,
  UserPlus,
  Timer,
  Users,
  CheckCircle2,
  Menu,
  X,
  Send,
} from 'lucide-react';
import MTLogo from '../components/MTLogo';
import api from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';

const COIN_META = {
  BTC: { name: 'Bitcoin', color: 'from-orange-400 to-amber-600' },
  ETH: { name: 'Ethereum', color: 'from-gold-400 to-gold-600' },
  BNB: { name: 'BNB', color: 'from-yellow-400 to-amber-600' },
  SOL: { name: 'Solana', color: 'from-gold-400 to-gold-600' },
  XRP: { name: 'XRP', color: 'from-gold-400 to-gold-600' },
  DOGE: { name: 'Dogecoin', color: 'from-amber-400 to-yellow-600' },
  ADA: { name: 'Cardano', color: 'from-gold-400 to-gold-600' },
  DOT: { name: 'Polkadot', color: 'from-red-400 to-gold-600' },
};

const FEATURES = [
  { icon: BarChart3, title: 'Crypto Trading', desc: 'Trade Bitcoin, Ethereum and 6+ assets with lightning-fast execution and a simple buy/sell interface.' },
  { icon: Wallet, title: 'Crypto Deposits', desc: 'Deposit USDT, Bitcoin or Ethereum directly to your account. Funds are credited after quick admin review.' },
  { icon: ArrowUpRight, title: 'Crypto Withdrawals', desc: 'Withdraw your balance to any external wallet address. Save your address and request payouts in seconds.' },
  { icon: Gift, title: 'Referral Rewards', desc: 'Earn a $5 bonus for every friend you refer. Share your code and grow your earnings.' },
  { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'Protected accounts, identity verification and manual review of every transaction for your safety.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Our support team is always online to help you with deposits, withdrawals and trading questions.' },
];

const STEPS = [
  { icon: UserPlus, step: '01', title: 'Create Account', desc: 'Sign up in under a minute with just your name, email and phone number. Referral codes welcome.' },
  { icon: Wallet, step: '02', title: 'Deposit Crypto', desc: 'Send USDT, Bitcoin or Ethereum to your deposit address. Your balance is credited after admin approval.' },
  { icon: BarChart3, step: '03', title: 'Start Trading', desc: 'Predict the market on BTC, ETH and more. Win up to your profit percentage on every trade.' },
];

const NAV_LINKS = [
  { href: '#markets', label: 'Markets' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#support', label: 'Support' },
];

export default function Home() {
  const [prices, setPrices] = useState({});
  const [pricesOk, setPricesOk] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportTelegram, setSupportTelegram] = useState('MetaTradeSupportBot');

  useEffect(() => {
    let alive = true;
    api.get('/settings/public')
      .then(({ data }) => { if (alive && data?.support_telegram) setSupportTelegram(data.support_telegram); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    const fetchPrices = async () => {
      try {
        const { data } = await api.get('/prices/public');
        if (alive && data && Object.keys(data).length > 0) {
          setPrices(data);
          setPricesOk(true);
        }
      } catch {
        setPricesOk(false);
      }
    };
    fetchPrices();
    const timer = setInterval(fetchPrices, 20000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  const coins = Object.keys(COIN_META);
  const totalVolume = coins.reduce((sum, c) => sum + (prices[c]?.volume_24h || 0), 0);

  const CoinIcon = ({ symbol, className = 'w-10 h-10' }) => {
    const meta = COIN_META[symbol] || { name: symbol, color: 'from-gold-400 to-gold-600' };
    const initial = (meta.name || symbol)[0];
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {initial}
      </div>
    );
  };

  const Change = ({ value, className = '' }) => {
    if (value === undefined || value === null || isNaN(value)) {
      return <span className={`text-zinc-400 ${className}`}>--</span>;
    }
    const up = value >= 0;
    return (
      <span className={`${up ? 'text-emerald-600' : 'text-red-500'} ${className}`}>
        {up ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50">
      <header className="fixed top-10 inset-x-0 z-50 bg-zinc-900/85 backdrop-blur-md border-b border-gold-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-black ring-1 ring-gold-500/30 flex items-center justify-center">
              <MTLogo className="w-11 h-11 text-white" />
            </div>
            <span className="font-heading text-lg font-bold text-gold-600">Meta Trade</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-zinc-400 hover:text-gold-500 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-200 hover:text-gold-500 hover:bg-gold-500/10 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gold-600 hover:bg-gold-700 text-white transition-colors">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-gold-500 hover:bg-gold-500/10 transition-colors">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gold-500/30 bg-zinc-900 px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-zinc-300 py-2">
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-gold-500/30">
              <Link to="/login" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                Log In
              </Link>
              <Link to="/register" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-gold-600 hover:bg-gold-700 text-white transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-10 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-500 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Secure crypto trading — instant crypto deposits
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-zinc-50 leading-tight max-w-4xl mx-auto">
              Trade Crypto with <span className="text-gold-500">Confidence</span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg mt-5 max-w-2xl mx-auto">
              Deposit crypto instantly, then trade Bitcoin &amp; Ethereum on a secure, verified platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold transition-colors">
                Start Trading
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-gold-500/40 hover:bg-gold-500/10 text-gold-500 font-semibold transition-colors">
                Log In
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm text-zinc-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Identity verified users</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Manual admin review</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant crypto deposits</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {coins.slice(0, 4).map((c) => (
              <div key={c} className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-gold-500/30 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <CoinIcon symbol={c} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-50 truncate">{COIN_META[c].name} <span className="text-zinc-400 font-medium">{c}</span></p>
                  <p className="text-zinc-100 font-bold mt-1">{formatCurrency(prices[c]?.price || 0)}</p>
                  <Change value={prices[c]?.change_24h} className="text-xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 gap-6 lg:gap-0">
            <div className="text-center lg:text-left lg:pr-6">
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">24h Volume</p>
              <p className="font-heading text-2xl font-bold">
                {pricesOk ? `$${formatNumber(totalVolume)}` : '$1.2B+'}
              </p>
            </div>
            <div className="text-center lg:text-left lg:px-6">
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Supported Assets</p>
              <p className="font-heading text-2xl font-bold">8</p>
            </div>
            <div className="text-center lg:text-left lg:px-6">
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Deposit Method</p>
              <p className="font-heading text-2xl font-bold flex items-center justify-center lg:justify-start gap-2"><Wallet className="w-6 h-6 text-gold-400" /> Crypto</p>
            </div>
            <div className="text-center lg:text-left lg:pl-6">
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Customer Support</p>
              <p className="font-heading text-2xl font-bold flex items-center justify-center lg:justify-start gap-2"><Timer className="w-6 h-6 text-gold-400" /> 24/7</p>
            </div>
          </div>
        </div>
      </section>

      <section id="markets" className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-2">Live Markets</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-zinc-50">Top cryptocurrencies</h2>
          </div>
          <Link to="/register" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gold-500 hover:text-gold-600">
            Start trading <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coins.map((c) => (
            <div key={c} className="bg-zinc-900 border border-gold-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CoinIcon symbol={c} className="w-9 h-9" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-50">{COIN_META[c].name}</p>
                    <p className="text-zinc-400 text-xs">{c}/USDT</p>
                  </div>
                </div>
                <Change value={prices[c]?.change_24h} className="text-xs" />
              </div>
              <p className="font-heading text-xl font-bold text-zinc-50">{formatCurrency(prices[c]?.price || 0)}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
                <span className="text-zinc-400 text-xs">24h Vol</span>
                <span className="text-zinc-300 text-xs font-medium">{pricesOk ? `$${formatNumber(prices[c]?.volume_24h || 0)}` : '--'}</span>
              </div>
            </div>
          ))}
        </div>

        {!pricesOk && (
          <p className="text-center text-zinc-400 text-xs mt-4">
            Live prices unavailable at the moment — showing placeholder values.
          </p>
        )}
      </section>

      <section id="features" className="bg-zinc-900 border-y border-gold-500/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-2">Features</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-zinc-50">Everything you need to trade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-zinc-900 border border-gold-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-gold-500" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-zinc-50 mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-xs font-semibold uppercase tracking-wider mb-2">How it works</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-zinc-50">Start in three simple steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative bg-gradient-to-br from-zinc-950 to-gold-100/40 border border-gold-500/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-heading text-4xl font-bold text-gold-200">{s.step}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-zinc-50 mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="support" className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-20">
        <div className="bg-gradient-to-br from-gold-500 to-gold-600 rounded-3xl px-6 md:px-12 py-12 md:py-16 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-black ring-1 ring-gold-500/30 flex items-center justify-center mx-auto mb-4"><MTLogo className="w-24 h-24" /></div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">Ready to start trading?</h2>
            <p className="text-gold-200 text-base mt-3 max-w-xl mx-auto">
              Create your free account and make your first INR deposit today. Support is available 24/7.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-900 text-gold-500 font-bold mt-8 hover:bg-gold-500/10 transition-colors">
              Create Free Account
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="mt-6">
              <a
                href={`https://t.me/${String(supportTelegram).replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold mt-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Chat on Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gold-500/30 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-11 h-11 rounded-lg bg-black ring-1 ring-gold-500/30 flex items-center justify-center">
                  <MTLogo className="w-10 h-10 text-white" />
                </div>
                <span className="font-heading text-base font-bold text-gold-500">Meta Trade</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                A secure crypto trading platform with crypto deposits and withdrawals.
              </p>
            </div>
            <div>
              <h4 className="text-zinc-50 text-sm font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li><a href="#markets" className="hover:text-gold-500 transition-colors">Markets</a></li>
                <li><a href="#features" className="hover:text-gold-500 transition-colors">Features</a></li>
                <li><Link to="/dashboard/trade" className="hover:text-gold-500 transition-colors">Trade</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-zinc-50 text-sm font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li><Link to="/register" className="hover:text-gold-500 transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-gold-500 transition-colors">Log In</Link></li>
                <li><Link to="/dashboard/profile" className="hover:text-gold-500 transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-zinc-50 text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Referral Program</li>
                <li><a href={`https://t.me/${String(supportTelegram).replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gold-500 transition-colors"><Headphones className="w-3.5 h-3.5" /> Chat Support</a></li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gold-500/30 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-zinc-400 text-xs">© {new Date().getFullYear()} Meta Trade. All rights reserved.</p>
            <p className="text-zinc-400 text-xs flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Deposits &amp; withdrawals in crypto</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
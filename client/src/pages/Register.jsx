import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Loader2, Gift, Phone } from 'lucide-react';
import MTLogo from '../components/MTLogo';
import api from '../lib/api';

const COUNTRY_CODES = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const prefilledRef = (searchParams.get('ref') || '').toUpperCase();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [mobile, setMobile] = useState('');
  const [referralCode, setReferralCode] = useState(prefilledRef);
  const [masterCode, setMasterCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const phoneValid = /^[0-9]{7,15}$/.test(mobile.trim());

useEffect(() => {
  let alive = true;
  api.get('/referrals/code')
    .then(({ data }) => { if (alive && data?.code) setMasterCode(data.code); })
    .catch(() => {});
  return () => { alive = false; };
}, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (!phoneValid) {
      return setError('Please enter a valid phone number');
    }

    if (!referralCode.trim()) {
      return setError('Referral code is required');
    }

    setLoading(true);
    try {
      await register(
        fullName,
        email,
        password,
        {
          mobile: mobile.trim(),
          country_code: countryCode,
          referral_code: referralCode.trim().toUpperCase(),
        }
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-2.5rem)] flex items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MTLogo className="w-16 h-16 text-gold-500" />
            <span className="text-3xl font-bold text-gold-600">Meta Trade</span>
          </div>
          <p className="text-zinc-400 text-sm">Secure cryptocurrency trading platform</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl shadow-lg border border-gold-500/30 p-8">
          <h2 className="text-xl font-semibold text-zinc-50 mb-6 text-center">Create Account</h2>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {prefilledRef && (
            <div className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 text-gold-600 text-xs px-4 py-3 rounded-lg mb-6">
              <Gift className="w-4 h-4 shrink-0" />
              You were referred by code <span className="font-semibold">{prefilledRef}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-zinc-200 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-zinc-200 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-zinc-200 text-sm font-medium mb-2">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-36 px-3 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                  placeholder="Phone number"
                />
{masterCode && (
                <p className="text-zinc-400 text-xs mt-1.5">
                  Use referral code: <span className="font-semibold text-gold-500">{masterCode}</span>
                </p>
              )}
            </div>
            </div>

            <div>
              <label className="block text-zinc-200 text-sm font-medium mb-2">
                <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" /> Referral Code <span className="text-red-500 font-normal">*</span></span>
              </label>
              <input
                type="text"
                required
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors uppercase"
                placeholder="Enter referral code"
              />
            </div>

            <div>
              <label className="block text-zinc-200 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-zinc-200 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-gold-500 hover:text-gold-500 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentAxios from '../../api/studentAxios';
import fbsLogo from '../../assets/fbs-logo.png';

// ── Helpers ───────────────────────────────────────────────────────────────────
function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  back:  'M19 12H5m7-7-7 7 7 7',
};

export default function StudentLogin() {
  const navigate = useNavigate();

  // steps: 'frn' | 'otp' | 'success'
  const [step, setStep]               = useState('frn');
  const [frn, setFrn]                 = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [countdown, setCountdown]     = useState(0);
  const otpRefs                       = useRef([]);
  const timerRef                      = useRef(null);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // ── Step 1: FRN submit ─────────────────────────────────────────────────────
  async function handleFrnSubmit(e) {
    e.preventDefault();
    setError('');
    if (!frn.trim()) { setError('Please enter your FRN'); return; }

    setLoading(true);
    try {
      await studentAxios.post(`/public/otp/send?frn=${encodeURIComponent(frn.trim())}`);
      setStep('otp');
      setCountdown(300); // 5 min
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handlers ─────────────────────────────────────────────────────
  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  }

  // ── Step 2: OTP verify ─────────────────────────────────────────────────────
  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError('');
    const otpStr = otp.join('');
    if (otpStr.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }

    setLoading(true);
    try {
      const res = await studentAxios.post('/public/otp/verify', {
        frn: frn.trim(),
        otp: otpStr,
      });
      // Store student token separately
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentFrn', frn.trim());
      navigate('/student/portal');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    if (countdown > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      await studentAxios.post(`/public/otp/send?frn=${encodeURIComponent(frn.trim())}`);
      setCountdown(300);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }

  function formatCountdown(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-fbs-dark flex">

      {/* Left Panel */}
      <div className="hidden md:flex w-2/5 bg-fbs-darker flex-col items-center justify-center px-8 relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 left-0 w-2 h-full bg-fbs-yellow" />
        <div className="absolute top-0 left-2 w-1.5 h-full bg-fbs-green" />
        <div className="absolute top-0 right-0 w-28 h-full opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #8DC63F 1.5px, transparent 1.5px)', backgroundSize: '13px 13px' }} />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-fbs-card rounded-2xl flex items-center justify-center mb-5 shadow-lg border border-fbs-border">
            <img src={fbsLogo} alt="FBS Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white text-base font-semibold text-center mb-1">FirstBit Solutions</h1>
          <p className="text-fbs-green text-xs text-center mb-5 tracking-wide">... Learn IT, Bit by Bit ...</p>
          <div className="bg-fbs-card border border-fbs-border rounded-md px-4 py-2 mb-6">
            <p className="text-gray-400 text-xs text-center">Training &nbsp;|&nbsp; Placement &nbsp;|&nbsp; Internship</p>
          </div>
          <div className="w-10 h-0.5 bg-fbs-yellow mb-5" />
          <p className="text-fbs-green text-xs font-medium text-center mb-1">Student Attendance Portal</p>
          <p className="text-gray-500 text-xs text-center leading-relaxed">
            View your attendance records<br />using your FRN and registered phone
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex md:hidden justify-center mb-8">
            <img src={fbsLogo} alt="FBS Logo" className="w-16 h-16 object-contain" />
          </div>

          <div className="bg-fbs-card border border-fbs-border rounded-2xl px-8 py-9">

            {/* ── Step 1: FRN ── */}
            {step === 'frn' && (
              <>
                <h2 className="text-white text-xl font-semibold mb-1">Student Login</h2>
                <p className="text-gray-400 text-sm mb-7">Enter your FRN to receive an OTP</p>

                <form onSubmit={handleFrnSubmit} noValidate>
                  <div className="mb-5">
                    <label className="block text-fbs-green text-xs font-semibold uppercase tracking-widest mb-2">
                      FRN Number
                    </label>
                    <input
                      type="text"
                      value={frn}
                      onChange={e => setFrn(e.target.value)}
                      placeholder="FRN-23J1224/001"
                      autoFocus
                      className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-fbs-green transition-colors font-mono"
                    />
                  </div>

                  {error && (
                    <div className="mb-4 px-4 py-2.5 bg-red-900/30 border border-red-700/40 rounded-lg">
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP…' : 'Get OTP'}
                  </button>
                </form>

                
              </>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <>
                <button
                  onClick={() => { setStep('frn'); setError(''); setOtp(['','','','','','']); }}
                  className="flex items-center gap-2 text-gray-500 hover:text-white text-xs mb-5 transition-colors"
                >
                  <Icon d={ICONS.back} size={14} /> Back
                </button>

                <h2 className="text-white text-xl font-semibold mb-1">Enter OTP</h2>
                <p className="text-gray-400 text-sm mb-6">
                  If this FRN is registered, an OTP was sent to the registered phone.
                </p>

                <form onSubmit={handleOtpSubmit} noValidate>
                  {/* OTP boxes */}
                  <div className="flex gap-2 justify-between mb-5" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-white text-lg font-bold bg-fbs-dark border border-fbs-border rounded-lg outline-none focus:border-fbs-green transition-colors"
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="mb-4 px-4 py-2.5 bg-red-900/30 border border-red-700/40 rounded-lg">
                      <p className="text-red-400 text-xs">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full bg-fbs-green hover:bg-fbs-yellow text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 mb-4"
                  >
                    {loading ? 'Verifying…' : 'Verify OTP'}
                  </button>

                  {/* Resend + countdown */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-gray-500 text-xs">
                        Resend OTP in <span className="text-fbs-green font-medium">{formatCountdown(countdown)}</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-fbs-green hover:text-fbs-yellow text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

          </div>

          <p className="text-gray-600 text-xs text-center mt-6">
            FBS Attendance System &nbsp;•&nbsp; v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
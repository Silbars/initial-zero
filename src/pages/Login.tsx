import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Apple, Mail, Lock } from 'lucide-react';
import googleLogo from '../assets/google-logo.svg';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (isSignUp && !confirmPassword.trim()) {
      setErrorMessage('Please confirm your password.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoadingEmail(true);
    setErrorMessage('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (error: any) {
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password.');
      } else if (error?.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already in use. Please sign in instead.');
      } else if (error?.code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Use at least 6 characters.');
      } else if (error?.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(isSignUp ? 'Sign-up failed. Please try again.' : 'Sign-in failed. Please try again.');
      }
      console.error('Email auth failed:', error);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoadingGoogle(true);
    setErrorMessage('');

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setErrorMessage('Google sign-in failed. Please try again.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <Apple className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">NutriFlow</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Master your macros and manage your kitchen inventory in one place.
        </p>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-5">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {isSignUp && (
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {errorMessage && (
            <p className="text-sm text-red-500 font-semibold text-left">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loadingEmail || loadingGoogle}
            className="w-full bg-orange-600 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-orange-500 transition-all active:scale-95 disabled:bg-orange-300"
          >
            {loadingEmail ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create account' : 'Sign in with Email')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp((prev) => !prev);
              setErrorMessage('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="w-full text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs uppercase tracking-widest font-bold text-slate-400">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loadingEmail || loadingGoogle}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 disabled:bg-slate-400"
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
          {loadingGoogle ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default Login;
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Apple } from 'lucide-react'; // A nice logo icon

const Login = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // This triggers the popup window
      await signInWithPopup(auth, provider);
      // Notice: We don't need a navigate() here! 
      // Our App.tsx will see the user change and redirect for us.
    } catch (error) {
      console.error("Sign-in failed:", error);
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

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="G" className="w-5 h-5 bg-white rounded-full p-0.5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
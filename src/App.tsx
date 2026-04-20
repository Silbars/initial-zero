import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css'
import { MainLayout } from './components/MainLayout';
import { Pantry } from './pages/Pantry';

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-black text-orange-600 animate-pulse">NutriFlow...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* All Private Routes go inside the Layout */}
        <Route path="/" element={
          user ? (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/pantry" element={
          user ? (
            <MainLayout>
              <Pantry />
            </MainLayout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
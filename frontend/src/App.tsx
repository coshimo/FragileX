import { Routes, Route, useNavigate } from 'react-router-dom';
import EstilosGlobais from './components/Shared/EstilosGlobais';
import Navbar from './components/LandingPage/Navbar/Navbar';
import Hero from './components/LandingPage/Hero/Hero';
import QuemSomos from './components/LandingPage/QuemSomos/QuemSomos';
import Footer from './components/LandingPage/Footer/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import PatientCardPage from './components/Dashboard/PatientCardPage';
import RegistroPaciente from './components/Checklist/RegistroPaciente';
import PreencherChecklist from './components/Checklist/PreencherChecklist';
import Login from './components/LandingPage/Login/Login';
import AplicacaoMedico from './components/LandingPage/AplicacaoMedico/AplicacaoMedico';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
const LandingPageLayout = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#fff' }}>
      <Navbar
        onLoginClick={() => usuario ? navigate('/dashboard') : navigate('/login')}
        usuarioLogado={usuario || undefined}
        onLogout={logout}
      />
      <main>
        <Hero />
        <QuemSomos />
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <EstilosGlobais />
      <Routes>
        <Route path="/" element={<LandingPageLayout />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/registro" element={
          <ProtectedRoute>
            <RegistroPaciente />
          </ProtectedRoute>
        } />
        
        <Route path="/preencher-checklist" element={
          <ProtectedRoute>
            <PreencherChecklist />
          </ProtectedRoute>
        } />
        
        <Route path="/checklist-rapido" element={
          <ProtectedRoute>
            <PreencherChecklist isRapido />
          </ProtectedRoute>
        } />

        <Route path="/aplicacao-medico" element={
          <ProtectedRoute>
            <AplicacaoMedico />
          </ProtectedRoute>
        } />

        <Route path="/patient/:id" element={
          <ProtectedRoute>
            <PatientCardPage />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
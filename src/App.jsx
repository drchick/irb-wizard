import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { WizardShell }   from './components/layout/WizardShell';
import Home              from './pages/Home';
import Login             from './pages/Login';
import ProtectedRoute    from './components/auth/ProtectedRoute';

/** Thin wrapper so WizardProvider only mounts on the /wizard route */
function WizardPage() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route
          path="/wizard"
          element={
            <ProtectedRoute>
              <WizardPage />
            </ProtectedRoute>
          }
        />
        {/* Fallback: send anything else to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

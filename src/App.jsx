import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import { WizardShell }   from './components/layout/WizardShell';
import Home              from './pages/Home';
import Login             from './pages/Login';
import Admin             from './pages/Admin';
import ProtectedRoute    from './components/auth/ProtectedRoute';
import AdminRoute        from './components/auth/AdminRoute';

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
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        {/* Fallback: send anything else to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * pages/wizard.jsx — Protected IRB wizard page
 */
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { WizardProvider } from '../context/WizardContext';
import { WizardShell }   from '../components/layout/WizardShell';

export default function WizardPage() {
  return (
    <ProtectedRoute>
      <WizardProvider>
        <WizardShell />
      </WizardProvider>
    </ProtectedRoute>
  );
}

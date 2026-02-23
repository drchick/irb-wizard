import { WizardProvider } from './context/WizardContext';
import { WizardShell } from './components/layout/WizardShell';

export default function App() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}

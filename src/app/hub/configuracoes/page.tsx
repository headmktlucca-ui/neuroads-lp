import { Suspense } from 'react';
import SettingsHubPage from '../../../components/hub/SettingsHubPage';

export default function HubSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsHubPage />
    </Suspense>
  );
}

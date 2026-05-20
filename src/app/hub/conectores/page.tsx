import { Suspense } from 'react';
import ConnectorsHubPage from '../../../components/hub/ConnectorsHubPage';

export default function HubConnectorsPage() {
  return (
    <Suspense fallback={null}>
      <ConnectorsHubPage />
    </Suspense>
  );
}

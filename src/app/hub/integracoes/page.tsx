import { Suspense } from 'react';
import ConnectorsHubPage from '../../../components/hub/ConnectorsHubPage';

export default function HubIntegracoesPage() {
  return (
    <Suspense>
      <ConnectorsHubPage />
    </Suspense>
  );
}

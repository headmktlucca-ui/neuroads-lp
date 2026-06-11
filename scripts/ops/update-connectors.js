const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../src/components/hub/ConnectorsHubPage.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add Types
if (!content.includes('LinkedinAdsAccountOption')) {
  content = content.replace(
    /type MetaAdsAccountOption = {[\s\S]*?};/,
    `type MetaAdsAccountOption = {
  id: string;
  name: string;
  accountId: string;
  currency: string;
  status: string;
};

type LinkedinAdsAccountOption = {
  id: string;
  name: string;
  currency: string;
  status: string;
};

type LinkedinPageOption = {
  id: string;
  name: string;
};`
  );
}

// 2. Add State Variables
if (!content.includes('linkedinAdsAccounts')) {
  content = content.replace(
    /const \[instagramAccounts, setInstagramAccounts\] = useState<InstagramAccountOption\[\]>\(\[\]\);\n  const \[selectedInstagramAccountId, setSelectedInstagramAccountId\] = useState\(''\);\n  const \[instagramSelectionSaving, setInstagramSelectionSaving\] = useState\(false\);/,
    `const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountOption[]>([]);
  const [selectedInstagramAccountId, setSelectedInstagramAccountId] = useState('');
  const [instagramSelectionSaving, setInstagramSelectionSaving] = useState(false);

  const [pendingLinkedinAdsConnection, setPendingLinkedinAdsConnection] = useState<PendingOAuthConnection | null>(null);
  const [linkedinAdsAccounts, setLinkedinAdsAccounts] = useState<LinkedinAdsAccountOption[]>([]);
  const [selectedLinkedinAdsAccountId, setSelectedLinkedinAdsAccountId] = useState('');
  const [linkedinAdsSelectionSaving, setLinkedinAdsSelectionSaving] = useState(false);

  const [pendingLinkedinPageConnection, setPendingLinkedinPageConnection] = useState<PendingOAuthConnection | null>(null);
  const [linkedinPageAccounts, setLinkedinPageAccounts] = useState<LinkedinPageOption[]>([]);
  const [selectedLinkedinPageAccountId, setSelectedLinkedinPageAccountId] = useState('');
  const [linkedinPageSelectionSaving, setLinkedinPageSelectionSaving] = useState(false);`
  );
}

// 3. Clear states on modal close
if (!content.includes('clearPendingLinkedinAdsSelection')) {
  content = content.replace(
    /const clearPendingInstagramSelection = \(\) => {[\s\S]*?};/,
    `const clearPendingInstagramSelection = () => {
    setPendingInstagramConnection(null);
    setInstagramAccounts([]);
    setSelectedInstagramAccountId('');
    setInstagramSelectionSaving(false);
  };

  const clearPendingLinkedinAdsSelection = () => {
    setPendingLinkedinAdsConnection(null);
    setLinkedinAdsAccounts([]);
    setSelectedLinkedinAdsAccountId('');
    setLinkedinAdsSelectionSaving(false);
  };

  const clearPendingLinkedinPageSelection = () => {
    setPendingLinkedinPageConnection(null);
    setLinkedinPageAccounts([]);
    setSelectedLinkedinPageAccountId('');
    setLinkedinPageSelectionSaving(false);
  };`
  );
  
  content = content.replace(
    /clearPendingInstagramSelection\(\);/g,
    `clearPendingInstagramSelection();\n      clearPendingLinkedinAdsSelection();\n      clearPendingLinkedinPageSelection();`
  );
}

// 4. Update the effect that hydrates accounts
if (!content.includes('hydrateLinkedinAdsAccounts')) {
  const metaAdsHydrateStr = `if (normalizedConnectorParam === 'metaAds' && !pendingPayload.accountId) {`;
  content = content.replace(
    metaAdsHydrateStr,
    `if (normalizedConnectorParam === 'linkedinAds' && !pendingPayload.accountId) {
      const hydrateLinkedinAdsAccounts = async () => {
        try {
          setConnectorBusyKey('linkedinAds');
          const response = await fetch('/api/auth/connectors/linkedinAds/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: normalizedAccessToken }),
          });
          const payload = (await response.json()) as { accounts?: LinkedinAdsAccountOption[]; error?: string };

          if (!response.ok) {
            throw new Error(payload.error || 'Não foi possível listar as contas do LinkedIn Ads.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingLinkedinAdsSelection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma conta disponível foi encontrada no LinkedIn Ads.');
            return;
          }

          setPendingLinkedinAdsConnection(pendingPayload);
          setLinkedinAdsAccounts(accounts);
          setSelectedLinkedinAdsAccountId(accounts[0]?.id || '');
          setShowSettings(true);
        } catch (error) {
          clearPendingLinkedinAdsSelection();
          setConnectorFeedback(null);
          setConnectorError(error instanceof Error ? error.message : 'Erro ao carregar contas do LinkedIn Ads.');
        } finally {
          setConnectorBusyKey(null);
          replaceUrlWithoutParams();
        }
      };
      void hydrateLinkedinAdsAccounts();
      return;
    }

    if (normalizedConnectorParam === 'linkedinPage' && !pendingPayload.accountId) {
      const hydrateLinkedinPageAccounts = async () => {
        try {
          setConnectorBusyKey('linkedinPage');
          const response = await fetch('/api/auth/connectors/linkedinPage/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: normalizedAccessToken }),
          });
          const payload = (await response.json()) as { accounts?: LinkedinPageOption[]; error?: string };

          if (!response.ok) {
            throw new Error(payload.error || 'Não foi possível listar as páginas do LinkedIn.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingLinkedinPageSelection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma página disponível foi encontrada no LinkedIn.');
            return;
          }

          setPendingLinkedinPageConnection(pendingPayload);
          setLinkedinPageAccounts(accounts);
          setSelectedLinkedinPageAccountId(accounts[0]?.id || '');
          setShowSettings(true);
        } catch (error) {
          clearPendingLinkedinPageSelection();
          setConnectorFeedback(null);
          setConnectorError(error instanceof Error ? error.message : 'Erro ao carregar páginas do LinkedIn.');
        } finally {
          setConnectorBusyKey(null);
          replaceUrlWithoutParams();
        }
      };
      void hydrateLinkedinPageAccounts();
      return;
    }

    if (normalizedConnectorParam === 'metaAds' && !pendingPayload.accountId) {`
  );
}

// 5. Update UI states variables
if (!content.includes('showLinkedinAdsSelectionModal')) {
  content = content.replace(
    /const showInstagramSelectionModal = Boolean\(pendingInstagramConnection && instagramAccounts\.length > 0\);/,
    `const showInstagramSelectionModal = Boolean(pendingInstagramConnection && instagramAccounts.length > 0);
  const showLinkedinAdsSelectionModal = Boolean(pendingLinkedinAdsConnection && linkedinAdsAccounts.length > 0);
  const showLinkedinPageSelectionModal = Boolean(pendingLinkedinPageConnection && linkedinPageAccounts.length > 0);`
  );
}

// 6. Check what modal to show
if (!content.includes('!showLinkedinAdsSelectionModal && !showLinkedinPageSelectionModal')) {
  content = content.replace(
    /!showMetaAdsSelectionModal &&\s*!showGoogleAdsSelectionModal &&\s*!showInstagramSelectionModal/,
    `!showMetaAdsSelectionModal &&
        !showGoogleAdsSelectionModal &&
        !showInstagramSelectionModal &&
        !showLinkedinAdsSelectionModal &&
        !showLinkedinPageSelectionModal`
  );
}

// 7. Add account selection handlers
if (!content.includes('handleLinkedinAdsAccountSelection')) {
  content = content.replace(
    /const handleInstagramAccountSelection = async \(\) => {[\s\S]*?};/,
    `const handleInstagramAccountSelection = async () => {
    if (!pendingInstagramConnection || !selectedInstagramAccountId) return;
    try {
      setInstagramSelectionSaving(true);
      setConnectorError(null);
      setConnectorFeedback(null);

      const selectedAccount = instagramAccounts.find((account) => account.id === selectedInstagramAccountId);

      await confirmConnectorConnection(pendingInstagramConnection, {
        accountId: selectedInstagramAccountId,
        accountName: selectedAccount?.name || '',
        pageId: selectedAccount?.pageId || '',
        pageName: selectedAccount?.pageName || '',
        username: selectedAccount?.username || '',
      });

      clearPendingInstagramSelection();
      setShowSettings(false);
      setConnectorFeedback('Instagram conectado com sucesso!');
    } catch (error) {
      setConnectorError(error instanceof Error ? error.message : 'Falha ao conectar Instagram.');
    } finally {
      setInstagramSelectionSaving(false);
    }
  };

  const handleLinkedinAdsAccountSelection = async () => {
    if (!pendingLinkedinAdsConnection || !selectedLinkedinAdsAccountId) return;
    try {
      setLinkedinAdsSelectionSaving(true);
      setConnectorError(null);
      setConnectorFeedback(null);

      const selectedAccount = linkedinAdsAccounts.find((account) => account.id === selectedLinkedinAdsAccountId);

      await confirmConnectorConnection(pendingLinkedinAdsConnection, {
        accountId: selectedLinkedinAdsAccountId,
        accountName: selectedAccount?.name || '',
        currency: selectedAccount?.currency || '',
        status: selectedAccount?.status || '',
      });

      clearPendingLinkedinAdsSelection();
      setShowSettings(false);
      setConnectorFeedback('LinkedIn Ads conectado com sucesso!');
    } catch (error) {
      setConnectorError(error instanceof Error ? error.message : 'Falha ao conectar LinkedIn Ads.');
    } finally {
      setLinkedinAdsSelectionSaving(false);
    }
  };

  const handleLinkedinPageAccountSelection = async () => {
    if (!pendingLinkedinPageConnection || !selectedLinkedinPageAccountId) return;
    try {
      setLinkedinPageSelectionSaving(true);
      setConnectorError(null);
      setConnectorFeedback(null);

      const selectedAccount = linkedinPageAccounts.find((account) => account.id === selectedLinkedinPageAccountId);

      await confirmConnectorConnection(pendingLinkedinPageConnection, {
        accountId: selectedLinkedinPageAccountId,
        accountName: selectedAccount?.name || '',
      });

      clearPendingLinkedinPageSelection();
      setShowSettings(false);
      setConnectorFeedback('LinkedIn Page conectada com sucesso!');
    } catch (error) {
      setConnectorError(error instanceof Error ? error.message : 'Falha ao conectar LinkedIn Page.');
    } finally {
      setLinkedinPageSelectionSaving(false);
    }
  };`
  );
}

// 8. Update Account Selection render logic
if (!content.includes('showLinkedinAdsSelectionModal ? (')) {
  // We need to inject after Instagram Selection Modal
  content = content.replace(
    /showInstagramSelectionModal \? \([\s\S]*?\)\s*:\s*null/g,
    `showInstagramSelectionModal ? (
            <div className="flex h-full flex-col">
              <header className={PREMIUM_MODAL_HEADER}>
                <button
                  onClick={() => {
                    clearPendingInstagramSelection();
                    setShowSettings(false);
                  }}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E1306C] to-[#833AB4] shadow-inner">
                    <PlugZap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black tracking-tight text-white">Instagram</h2>
                    <p className="text-[13px] font-medium text-[#c5d3e9]">Selecione a conta do Instagram</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                <div className={SETTINGS_PANEL}>
                  <p className="mb-4 text-[13px] font-medium leading-relaxed text-slate-600">
                    O aplicativo encontrou <strong>{instagramAccounts.length}</strong> conta(s) do Instagram associadas
                    ao seu login. Selecione qual conta você deseja vincular ao NeuroAds:
                  </p>

                  <div className="space-y-3">
                    {instagramAccounts.map((account) => {
                      const isSelected = selectedInstagramAccountId === account.id;
                      return (
                        <button
                          key={account.id}
                          onClick={() => setSelectedInstagramAccountId(account.id)}
                          className={\`w-full text-left flex items-center justify-between rounded-xl border p-4 transition-all \${
                            isSelected
                              ? 'border-[#E1306C] bg-[#E1306C]/5 ring-1 ring-[#E1306C]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }\`}
                        >
                          <div>
                            <p className={\`text-[15px] font-bold \${isSelected ? 'text-[#E1306C]' : 'text-slate-800'}\`}>
                              {account.name}
                            </p>
                            <p className="mt-1 text-[12px] font-semibold text-slate-500">
                              @{account.username} • Página associada: {account.pageName || 'N/A'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">ID: {account.id}</p>
                          </div>
                          <div
                            className={\`flex h-6 w-6 items-center justify-center rounded-full border \${
                              isSelected ? 'border-[#E1306C] bg-[#E1306C]' : 'border-slate-300 bg-white'
                            }\`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <footer className="border-t border-slate-100 bg-white p-5 shadow-[0_-4px_20px_-10px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      clearPendingInstagramSelection();
                      setShowSettings(false);
                    }}
                    className={SETTINGS_SECONDARY_BUTTON}
                    disabled={instagramSelectionSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void handleInstagramAccountSelection()}
                    disabled={!selectedInstagramAccountId || instagramSelectionSaving}
                    className={\`\${SETTINGS_PRIMARY_BUTTON} flex items-center gap-2\`}
                  >
                    {instagramSelectionSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Confirmar Conta
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </footer>
            </div>
          ) : showLinkedinAdsSelectionModal ? (
            <div className="flex h-full flex-col">
              <header className={PREMIUM_MODAL_HEADER}>
                <button
                  onClick={() => {
                    clearPendingLinkedinAdsSelection();
                    setShowSettings(false);
                  }}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a66c2] shadow-inner">
                    <PlugZap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black tracking-tight text-white">LinkedIn Ads</h2>
                    <p className="text-[13px] font-medium text-[#c5d3e9]">Selecione a conta de anúncios</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                <div className={SETTINGS_PANEL}>
                  <p className="mb-4 text-[13px] font-medium leading-relaxed text-slate-600">
                    O aplicativo encontrou <strong>{linkedinAdsAccounts.length}</strong> conta(s) do LinkedIn Ads associadas
                    ao seu login. Selecione qual conta você deseja vincular:
                  </p>

                  <div className="space-y-3">
                    {linkedinAdsAccounts.map((account) => {
                      const isSelected = selectedLinkedinAdsAccountId === account.id;
                      return (
                        <button
                          key={account.id}
                          onClick={() => setSelectedLinkedinAdsAccountId(account.id)}
                          className={\`w-full text-left flex items-center justify-between rounded-xl border p-4 transition-all \${
                            isSelected
                              ? 'border-[#0a66c2] bg-[#0a66c2]/5 ring-1 ring-[#0a66c2]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }\`}
                        >
                          <div>
                            <p className={\`text-[15px] font-bold \${isSelected ? 'text-[#0a66c2]' : 'text-slate-800'}\`}>
                              {account.name}
                            </p>
                            <p className="mt-1 text-[12px] font-semibold text-slate-500">
                              Moeda: {account.currency || 'N/A'} • Status: {account.status || 'N/A'}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">ID: {account.id}</p>
                          </div>
                          <div
                            className={\`flex h-6 w-6 items-center justify-center rounded-full border \${
                              isSelected ? 'border-[#0a66c2] bg-[#0a66c2]' : 'border-slate-300 bg-white'
                            }\`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <footer className="border-t border-slate-100 bg-white p-5 shadow-[0_-4px_20px_-10px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      clearPendingLinkedinAdsSelection();
                      setShowSettings(false);
                    }}
                    className={SETTINGS_SECONDARY_BUTTON}
                    disabled={linkedinAdsSelectionSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void handleLinkedinAdsAccountSelection()}
                    disabled={!selectedLinkedinAdsAccountId || linkedinAdsSelectionSaving}
                    className={\`\${SETTINGS_PRIMARY_BUTTON} flex items-center gap-2\`}
                  >
                    {linkedinAdsSelectionSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Confirmar Conta
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </footer>
            </div>
          ) : showLinkedinPageSelectionModal ? (
            <div className="flex h-full flex-col">
              <header className={PREMIUM_MODAL_HEADER}>
                <button
                  onClick={() => {
                    clearPendingLinkedinPageSelection();
                    setShowSettings(false);
                  }}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a66c2] shadow-inner">
                    <PlugZap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black tracking-tight text-white">LinkedIn Page</h2>
                    <p className="text-[13px] font-medium text-[#c5d3e9]">Selecione a página (Company)</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                <div className={SETTINGS_PANEL}>
                  <p className="mb-4 text-[13px] font-medium leading-relaxed text-slate-600">
                    O aplicativo encontrou <strong>{linkedinPageAccounts.length}</strong> página(s) do LinkedIn associadas
                    ao seu login nas quais você tem papel de administrador. Selecione qual deseja vincular:
                  </p>

                  <div className="space-y-3">
                    {linkedinPageAccounts.map((account) => {
                      const isSelected = selectedLinkedinPageAccountId === account.id;
                      return (
                        <button
                          key={account.id}
                          onClick={() => setSelectedLinkedinPageAccountId(account.id)}
                          className={\`w-full text-left flex items-center justify-between rounded-xl border p-4 transition-all \${
                            isSelected
                              ? 'border-[#0a66c2] bg-[#0a66c2]/5 ring-1 ring-[#0a66c2]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }\`}
                        >
                          <div>
                            <p className={\`text-[15px] font-bold \${isSelected ? 'text-[#0a66c2]' : 'text-slate-800'}\`}>
                              {account.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">ID da Organização: {account.id}</p>
                          </div>
                          <div
                            className={\`flex h-6 w-6 items-center justify-center rounded-full border \${
                              isSelected ? 'border-[#0a66c2] bg-[#0a66c2]' : 'border-slate-300 bg-white'
                            }\`}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <footer className="border-t border-slate-100 bg-white p-5 shadow-[0_-4px_20px_-10px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      clearPendingLinkedinPageSelection();
                      setShowSettings(false);
                    }}
                    className={SETTINGS_SECONDARY_BUTTON}
                    disabled={linkedinPageSelectionSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => void handleLinkedinPageAccountSelection()}
                    disabled={!selectedLinkedinPageAccountId || linkedinPageSelectionSaving}
                    className={\`\${SETTINGS_PRIMARY_BUTTON} flex items-center gap-2\`}
                  >
                    {linkedinPageSelectionSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Confirmar Página
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </footer>
            </div>
          ) : null`
  );
}


fs.writeFileSync(filePath, content, 'utf-8');
console.log('ConnectorsHubPage.tsx updated successfully.');

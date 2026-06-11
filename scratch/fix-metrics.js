const fs = require('fs');
const path = 'src/components/hub/ConnectorsHubPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace InteractiveHealthMetrics mock data
content = content.replace(/function InteractiveHealthMetrics\(.*?\];/s, `function InteractiveHealthMetrics({ active, total, errorsCount = 0 }: { active: number, total: number, errorsCount?: number }) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const metrics = [
    {
      id: 'active',
      label: 'Ativas',
      value: \`\${active}/\${total}\`,
      percentage: total > 0 ? (active / total) * 100 : 0,
      bg: 'bg-gradient-to-r from-[#08B760] to-[#0A9D57]',
      icon: <PlugZap className="w-3.5 h-3.5" />,
      detail: 'Conexões monitoradas em tempo real.',
      statusColor: 'text-[#0A9D57]'
    },
    {
      id: 'latency',
      label: 'Latência',
      value: active === 0 ? '-' : 'Estável',
      percentage: active === 0 ? 0 : 100,
      bg: active === 0 ? 'bg-slate-200' : 'bg-gradient-to-r from-[#08B760] to-[#0A9D57]',
      icon: <Activity className="w-3.5 h-3.5" />,
      detail: active === 0 ? 'Conecte integrações para medir a latência.' : 'Tempo de resposta médio das APIs.',
      statusColor: active === 0 ? 'text-slate-400' : 'text-[#0A9D57]'
    },
    {
      id: 'errors',
      label: 'Falhas',
      value: String(errorsCount),
      percentage: errorsCount > 0 ? Math.min(100, errorsCount * 25) : 100,
      bg: errorsCount > 0 ? 'bg-gradient-to-r from-[#F87171] to-[#EF4444]' : 'bg-gradient-to-r from-[#08B760] to-[#0A9D57]',
      icon: <TriangleAlert className="w-3.5 h-3.5" />,
      detail: errorsCount > 0 ? \`\${errorsCount} problema(s) detectado(s) nas conexões.\` : 'Nenhuma falha de requisição detectada.',
      statusColor: errorsCount > 0 ? 'text-[#EF4444]' : 'text-[#0A9D57]'
    }
  ];`);

// Replace DEFAULT_ALERTS mock data with []
content = content.replace(/const DEFAULT_ALERTS: AlertItem\[\] = \[.*?\];/s, 'const DEFAULT_ALERTS: AlertItem[] = [];');

// Pass errorsCount to InteractiveHealthMetrics
content = content.replace(/<InteractiveHealthMetrics active={activeTrackedConnectorCount} total={trackedConnectorCount} \/>/g, '<InteractiveHealthMetrics active={activeTrackedConnectorCount} total={trackedConnectorCount} errorsCount={activeAlerts.length} />');

fs.writeFileSync(path, content, 'utf8');
console.log('Replacements applied successfully.');

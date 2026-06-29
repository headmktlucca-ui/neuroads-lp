'use client';

/**
 * SobreClient — Renderiza a página /a-neuroads/sobre usando o StrategicContentPageShell
 * completo, que inclui: Hero → Highlights → Sections → Process → Comparison
 * → Mini Cases → Resources → FAQ + Form → Final CTA Banner.
 *
 * O arquivo sobre/page.tsx passa todos esses dados; aqui só delegamos ao shell.
 */

import StrategicContentPageShell, {
  type StrategicContentPageData,
} from '@/components/neuroads/StrategicContentPageShell';

export default function SobreClient({ data }: { data: StrategicContentPageData }) {
  return <StrategicContentPageShell data={data} />;
}

const fs = require('fs');
const path = require('path');

// Utility to convert "Meu Novo Agente" to "MeuNovoAgente"
function toPascalCase(str) {
  return str
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('\x1b[31mErro: Por favor, informe o nome do agente.\x1b[0m');
  console.log('Uso: npm run create-agent "Nome do Agente"');
  process.exit(1);
}

const agentName = args[0];
const componentName = `${toPascalCase(agentName)}Workspace`;

const paths = {
  workspace: path.join(__dirname, '..', 'src', 'components', 'agents', `${componentName}.tsx`),
  registry: path.join(__dirname, '..', 'src', 'lib', 'agent-workspace-registry.ts'),
  agentsData: path.join(__dirname, '..', 'src', 'data', 'agents.ts')
};

console.log(`\x1b[36m🚀 Criando agente: ${agentName}...\x1b[0m`);

// 1. Generate Workspace Component
if (fs.existsSync(paths.workspace)) {
  console.warn(`\x1b[33m⚠️ Workspace já existe em ${paths.workspace}\x1b[0m`);
} else {
  const template = `'use client';

import React from 'react';
import type { WorkspaceProps } from '../../lib/agent-workspace-registry';

export default function ${componentName}({ userId, agentSlug, agentTitle }: WorkspaceProps) {
  return (
    <div className="w-full flex items-center justify-center py-20 text-white/50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{agentTitle} Workspace</h2>
        <p>A interface funcional deste agente será construída aqui.</p>
        <p className="text-sm mt-4 opacity-50">src/components/agents/${componentName}.tsx</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(paths.workspace, template);
  console.log(`\x1b[32m✅ Workspace criado:\x1b[0m src/components/agents/${componentName}.tsx`);
}

// 2. Update agent-workspace-registry.ts
let registryContent = fs.readFileSync(paths.registry, 'utf8');

// Check if already registered
if (registryContent.includes(componentName)) {
  console.warn(`\x1b[33m⚠️ Agente já está registrado no agent-workspace-registry.ts\x1b[0m`);
} else {
  // Add Import
  const importStatement = `import ${componentName} from '../components/agents/${componentName}';\n`;
  const importsEndIndex = registryContent.indexOf('// ─── Tipagem');
  if (importsEndIndex !== -1) {
    registryContent = registryContent.slice(0, importsEndIndex) + importStatement + '\n' + registryContent.slice(importsEndIndex);
  }

  // Add to map
  const mapIndex = registryContent.lastIndexOf('};');
  if (mapIndex !== -1) {
    const mapEntry = `  '${agentName}': ${componentName},\n`;
    registryContent = registryContent.slice(0, mapIndex) + mapEntry + registryContent.slice(mapIndex);
  }

  fs.writeFileSync(paths.registry, registryContent);
  console.log(`\x1b[32m✅ Registry atualizado:\x1b[0m src/lib/agent-workspace-registry.ts`);
}

// 3. Update agents.ts
let agentsContent = fs.readFileSync(paths.agentsData, 'utf8');

if (agentsContent.includes(`title: '${agentName}'`)) {
  console.warn(`\x1b[33m⚠️ Agente já existe no data/agents.ts\x1b[0m`);
} else {
  // Append to agents array
  const agentTemplate = `  {
    title: '${agentName}',
    description: 'Breve descrição do agente (1 a 2 linhas).',
    longDescription: 'Descrição completa sobre o funcionamento e promessa do agente.',
    icon: '/images/tools/default.png',
    color: 'var(--color-brand-orange)',
    category: 'Inteligência',
    heroDescription: 'texto introdutório para exibir na home page do agente.',
    requiredConnectors: ['ga4', 'crm']
  }`;

  const arrayEndIndex = agentsContent.lastIndexOf('];');
  if (arrayEndIndex !== -1) {
    // Check if there is a trailing comma before ];
    const beforeEnd = agentsContent.slice(0, arrayEndIndex).trimRight();
    const needsComma = beforeEnd.length > 0 && beforeEnd[beforeEnd.length - 1] !== ',';
    
    agentsContent = beforeEnd + (needsComma ? ',\n' : '\n') + agentTemplate + '\n];\n';
    fs.writeFileSync(paths.agentsData, agentsContent);
    console.log(`\x1b[32m✅ Dados do Agente inseridos:\x1b[0m src/data/agents.ts`);
  }
}

console.log(`\n\x1b[32m🎉 Tudo pronto! O agente '${agentName}' foi automatizado.\x1b[0m`);
console.log(`\x1b[36m👉 Próximos passos:\x1b[0m`);
console.log(`1. Edite os textos, cor e ícone em \x1b[33msrc/data/agents.ts\x1b[0m`);
console.log(`2. Construa a UI interativa em \x1b[33msrc/components/agents/${componentName}.tsx\x1b[0m`);

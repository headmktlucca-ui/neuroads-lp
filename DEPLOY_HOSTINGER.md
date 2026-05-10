# Guia Definitivo: Deploy da NeuroAds LP na Hostinger

Este documento fornece as instruções arquiteturais e práticas para hospedar o frontend emissor (Next.js) da NeuroAds na Hostinger, bem como as integrações de banco de dados (Firebase) essenciais para a operação.

---

## 1. Topologia da Arquitetura

A arquitetura da NeuroAds está configurada no modelo moderno **Frontend Desacoplado + Serverless Backend**. Isso significa que:

- **Hostinger:** Será responsável _apenas_ por hospedar o servidor Node.js que renderiza as páginas do Next.js e injeta os arquivos estáticos.
- **Firebase (Google):** Atuará como o cérebro/banco de dados real do sistema. Toda a lógica transacional, sessões de usuário e "limites de plano" (Freemium/Premium) são gerenciados logicamente por lá.

Não será necessário provisionar um banco MySQL/PostgreSQL nativo na Hostinger.

---

## 2. Configurações Prévias: Firebase (Banco de Dados e Auth)

Antes de mover arquivos para a Hostinger, o backend precisa estar no ar.

1. **Criação do Projeto:**
   - Acesse o [Firebase Console](https://console.firebase.google.com/).
   - Crie um novo projeto "NeuroAds Production".
   - Desative o Google Analytics (se não for usar agora) para acelerar a criação.

2. **Ativação da Autenticação (AuthOverlay):**
   - No menu lateral do Firebase, vá em **Build > Authentication**.
   - Clique em **Get Started** e ative dois provedores:
     - **Google:** Configure os domínios de suporte. Adicione o seu domínio final da Hostinger (ex: `neuroads.com.br`) na lista de "Domínios Autorizados" na aba _Settings_.
     - **Email e Senha:** (Para login corporativo, ative a opção "Email/Password").

3. **Banco de Dados (Firestore):**
   - Vá em **Build > Firestore Database** e crie o banco ("Start in production mode").
   - Selecione um data center da região Américas para menor latência com o servidor.

4. **Gerenciamento das Chaves API:**
   - Vá nas "Configurações do Projeto" (ícone de engrenagem) > Guia "Geral" > Role até a aba de **Apps**.
   - Crie um Web App (`</>`).
   - Copie o bloco das variáveis (apiKey, authDomain, projectId...). Elas irão para o arquivo `.env.local` e `.env.production` da Hostinger.

---

## 3. Preparando o Projeto na Máquina Local

Para enviar as coisas para a Hostinger, evite empurrar o diretório bruto. Vamos prepará-lo.

1. No terminal do projeto local, configure suas variáveis de ambiente apontando para o Firebase novo criando um arquivo `.env.production`:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="neuroads-prod.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="neuroads-prod"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="neuroads-prod.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcde"
   ```

2. Realize o teste de Build de produção da aplicação localmente, assim evitamos surpresas lá no servidor:
   ```bash
   npm run build
   ```
   _Certifique-se de que não haja erros de TypeScript ou linting "quebrando" o build._

---

## 4. O Deploy na Hostinger (Ambiente Node.js / VPS)

_Obs: Projetos Next.js modernos exigem um motor Node.js. O cenário ideal na Hostinger é um VPS básico ou o plano de "Hospedagem Cloud" que possua integração avançada via painel._

### Via Hostinger hPanel (Hospedagem Compartilhada com Node.js)

Caso você tenha um plano premium recente, a Hostinger permite injetar Node.js diretamente pelo painel:

1. Vá ao **hPanel da Hostinger**.
2. Na aba lateral, entre em **Avançado > Node.js** (ou via seletor de "App").
3. Via o painel do gerenciador de arquivos (File Manager), faça upload dos arquivos do projeto local **(Não faça upload da pasta `/node_modules` e da pasta `/.next`)**.
4. Compacte seu `.env.production` local com os dados do projeto e faça o deploy também.
5. Pelo terminal web interno do painel (ou acessando via SSH se habilitado), acesse a raiz:
   ```bash
   npm install
   npm run build
   ```
6. No painel Node.js da Hostinger, indique o "Startup Command" (ou gerencie pelo painel visual deles dependendo da versão do painel hpanel) para:
   ```bash
   npm run start
   ```
7. Depois de cada deploy, limpe o cache de CDN da Hostinger/hPanel antes da validação final para evitar HTML antigo apontando para chunks que já não existem.
8. Execute uma checagem objetiva de integridade dos assets:
   ```bash
   npm run ops:check-prod-assets -- https://neuroads.com.br
   ```
   Se retornar qualquer `404` em `/_next/static/*`, o cache do HTML precisa ser renovado e a aplicação reiniciada.

### Via VPS Hostinger (O Protocolo Mais Profissional e Estável)

É disparado o formato mais recomendado para aplicações Next.js de alta performance:

1. **Acesso SSH:** Entre no terminal da sua VPS Ubuntu fornecida pela Hostinger.

   ```bash
   ssh root@seu_ip_da_vps
   ```

2. **Instalação do PM2 (Gerenciador de Processos):**

   ```bash
   npm install -g pm2
   ```

3. **Subindo Arquivos:** Usando o `git clone` (conectando ao seu repositório de código privado, como o GitHub ou GitLab) para buscar sua aplicação para dentro do diretório `/var/www/neuroads`.

4. **Iniciando a Operação Neural:**
   Uma vez clonado, com o `.env` montado com as variáveis do Firebase ativas:

   ```bash
   cd /var/www/neuroads
   npm install
   npm run build
   ```

5. **Ligar e Blindar com PM2:**
   Para garantir que o painel ressuscite sozinho se a VPS reiniciar e sempre fique no ar aproveitando toda a capacidade de processamento:
   ```bash
   pm2 start npm --name "NeuroAds-Frontend" -- start
   pm2 startup
   pm2 save
   ```
6. **Passo Reverso / NGINX Proxy Reverse** - Configure seu `nginx` no VPS da Hostinger apontando para o seu IP Interno (geralmente `http://localhost:3000`).

---

## 5. Passos Finais e Validação

1. **Domínio:** No painel da Hostinger, vá a seção de **Zonas de DNS**. Aponte um registro do tipo **"A"** vinculando seu IP do servidor à raiz (`@`) e `www`.
2. **Segurança (SSL):** É inegociável possuir encriptação de ponta (`https://`), caso contrário a autenticação robusta do Google do Firebase no front-end será bloqueada pelos navegadores nativamente.
   Na VPS, instale o certificado gratuito e auto-renovável nativo:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d seudominio.com.br
   ```
3. Teste realizar o login na sua versão online. Se todas as chaves baterem perfeitamente com as criadas no Firestore, o modal de Acesso Estratégico sumirá fluídamente liberando a UX bloqueada.

---

> Caso o plano de hostinger suportado no momento seja apenas o tradicional e não o VPS ou Cloud, temos a opção B de compilar todos os arquivos do Next.js via "SSG" (`next export`/output="export" no `next.config.js`) e transferir os documentos ultra-leves dentro de uma velha pasta 'public_html'. Avisar se esta for a arquitetura alvo.

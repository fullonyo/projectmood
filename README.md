# MoodSpace 🌌✨🛡️

O MoodSpace é um **Studio de Murais Estéticos** imersivos, permitindo que usuários criem e compartilhem identidades visuais dinâmicas através de um canvas artístico.

## 🚀 Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (NextAuth v5) com suporte a Google One Tap
- **Styling**: Vanilla CSS + Framer Motion para animações
- **Container**: Docker & Docker Compose

---

## 🛠️ Setup Local

### 1. Requisitos
- Node.js 20+
- Docker & Docker Compose

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz seguindo o modelo abaixo:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mood_db?schema=public"
AUTH_SECRET="seu-secret-aqui"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"

# APIs Externas
GIPHY_API_KEY="sua-chave-giphy"
SPOTIFY_CLIENT_ID="seu-id-spotify"
SPOTIFY_CLIENT_SECRET="seu-secret-spotify"

# Google Auth (Importante para o One Tap)
GOOGLE_CLIENT_ID="seu-id-google"
GOOGLE_CLIENT_SECRET="seu-secret-google"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="seu-id-google"

# Config Docker
POSTGRES_USER="user"
POSTGRES_PASSWORD="password"
POSTGRES_DB="mood_db"
```

### 3. Rodando com Docker
O projeto está configurado para subir o banco de dados e a aplicação em containers:

```bash
# Subir ambiente
docker-compose up -d

# Sincronizar schema do Prisma
npx prisma db push
```

### 4. Rodando para Desenvolvimento
Se preferir rodar apenas o banco no Docker e o app localmente:

```bash
npm install
npm run dev
```

---

## 🏗️ Fluxos do Projeto

### Prisma & Database
- **Schema**: Localizado em `prisma/schema.prisma`.
- **Relações**: `User` -> `Room` -> `MoodBlock`.
- **Analytics**: Cada `Room` possui um `RoomAnalytics` para contagem de visualizações e métricas.

### Autenticação Google One Tap
- Integrado via `google-one-tap.tsx`.
- Requer `NEXT_PUBLIC_GOOGLE_CLIENT_ID` e o domínio devidamente autorizado no Console do Google Cloud.

### Studio (Mural Editor)
- Localizado em `src/app/studio/[slug]`.
- Utiliza **Framer Motion** para o drag-and-drop e reordenação de camadas (Layers).
- **Publicação**: As alterações no Studio são rascunhos. Use a ação de "Publicar" para gerar uma nova `RoomVersion` ativa.

### Admin Panel
- Acesso restrito a usuários com `role: ADMIN`.
- Rotas em `/admin`: monitoramento de usuários, auditoria de blocos e estatísticas globais.

---

## 🚢 Deploy & Produção

O projeto inclui um `docker-compose.prod.yml` otimizado para produção.

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**Monitoramento de Erros**:
- Use `npm run lint` para checar padrões de código.
- Use `npx tsc --noEmit` para validação de tipos.

---

## 🛡️ Protocolos de Segurança
- **Rate Limit**: Implementado no Guestbook para evitar spam de mensagens.
- **Auditoria**: Todas as ações administrativas (ban, delete) são registradas em `AuditLog`.
- **Moderação**: Blocos deletados são marcados com `deletedAt` (soft-delete) para auditoria.

---

Developed with 🤍 by [Maikon].

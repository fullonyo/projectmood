# Ajuda da IA - MOOD Project

Este arquivo centraliza a documentação de funcionalidades e componentes para facilitar o contexto da IA.

## Padronização Visual
- **Ícones**: NUNCA usar emojis para ícones de interface (labels, botões, seletores). Use sempre `lucide-react` ou SVGs customizados. Isso se aplica a labels, botões e seletores.
- **Consistência**: Todos os editores da sidebar devem seguir o padrão de espaçamento, tipografia e iconografia estabelecido.

## Telas Analisadas

### Tela Principal (Landing Page)
- **Caminho**: `src/app/page.tsx`
- **Descrição**: Página de entrada do projeto.
- **Estilo**: Minimalista, alto contraste, uso extensivo de `zinc` e `black`.
- **Componentes**: Botões Shadcn/UI, Link do Next.js.
- **Destaque**: Layout responsivo com cards rotacionados e animações de pulse.

### Dashboard & Sidebar
- **Estrutura**: O Dashboard é composto por um Header fixo e um Layout com Sidebar colapsável.
- **Sidebar (`src/components/dashboard/dashboard-sidebar.tsx`)**:
  - Organizada em 4 abas: `Estilo`, `Escrita`, `Mídia` e `Criativo`.
  - **Aba Estilo**: Gerencia temas, cores (com extrator) e efeitos visuais mágicos. Possui a "Danger Zone" para resetar o mural.
  - **Aba Escrita**: Ferramentas para Textos, Tickers, Subtítulos e Citações.
  - **Aba Mídia**: Integrações com YouTube, Spotify, GIFs, Fotos e Guestbook.
  - **Aba Criativo**: Ferramentas de Scrapbook (Doodles, Tapes), Links Sociais, Status Visual e Countdowns.
  - **Comportamento Contextual**: A sidebar detecta o bloco selecionado no mural e alterna automaticamente para a aba e editor correspondente.
- **Header (`src/app/dashboard/page.tsx`)**:
  - Contém o botão de Logout, Share Profile e botão para ver o espaço público.

### Auth & Middleware
- **Autenticação**: Provedor de `credentials` configurado em `src/auth.ts`.
- **Middleware (`src/middleware.ts`)**:
  - Protege rotas de `/dashboard`.
  - Redireciona usuários logados das rotas de `/auth` e da raiz `/` diretamente para `/dashboard`.
  - Garante que a Landing Page só seja vista por usuários não autenticados.

### Padronização Visual
- **Ícones**: NUNCA usar emojis para ícones de interface. Use ícones Lucide.
- **Tipografia**: Suporte a Google Fonts dinâmico via `FontLoader`. O perfil armazena a fonte em `customFont`.
- **Efeitos de Fundo (`src/components/effects/background-effect.tsx`)**:
    - Renderizados via WebGL (Canvas) para garantir fluidez total (60 FPS).
    - **Interatividade**: Suporte a uniformes de mouse (`uMouse`) e sincronização com a cor primária do tema (`uColor`).
    - **Efeitos Disponíveis**: `aurora`, `noise`, `liquid`, `mesh-gradient` (fluido), `metaballs` (interativo), `hyperspeed` (viagem espacial), `stars`, `grid-move`.

### Melhorias de Performance
- **Otimização de Imagens**: Todas as fotos e doodles são comprimidos no cliente (`browser-image-compression`) antes do upload para reduzir latência e consumo de banda.
- **WebGL Rendering**: O componente `BackgroundEffect` utiliza shaders matemáticos para evitar custos de renderização do DOM/CSS em efeitos complexos.

- **Efeitos de Fundo (`src/components/effects/background-effect.tsx`)**:
    - Renderizados via WebGL (Canvas) para garantir fluidez total.
    - Utilizam biblioteca utilitária `src/lib/shaders.ts`.

---
*Documentação atualizada por Antigravity em 18/02/2026.*

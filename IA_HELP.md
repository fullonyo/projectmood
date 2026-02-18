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

- **Efeitos de Fundo (`src/components/effects/background-effect.tsx`)**:
  - Renderizados internamente pelo `MoodCanvas` para evitar sobreposição por cores sólidas de tema.
  - Utilizam `absolute inset-0` e `mix-blend-mode` para interagir com o fundo do mural.

---
*Documentação atualizada por Antigravity em 18/02/2026.*

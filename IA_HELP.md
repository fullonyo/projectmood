# Ajuda da IA - MoodSpace Studio 🌌✨🛡️

Este arquivo centraliza a documentação de funcionalidades e componentes do **MoodSpace** para facilitar o contexto da IA e manter a consistência do ecossistema.

## Padronização Visual & Marca
- **Marca**: O projeto chama-se oficialmente **MoodSpace**. Evite referências a "MOOD Project" ou "Project Mood".
- **Ícones**: NUNCA usar emojis para ícones de interface. Use sempre `lucide-react`.
- **Estética**: Design "Studio" premium, minimalista, com alto uso de Glassmorphism (backdrop-blur) e tipografia fluida.
- **Tipografia Padronizada**:
  - **Fonte Inter**: O sistema é padronizado com a fonte **Inter** globalmente para garantir clareza e consistência.
  - **Estilos Específicos de Bloco**: Alguns estilos do `SmartText` (como `vhs`, `typewriter` e `quote`) utilizam fontes específicas (`font-mono`, `font-serif`) para preservar sua identidade artística.

## Arquitetura de Telas

### Landing Page & Auth
- **Landing Page (`src/app/page.tsx`)**: Entrada imersiva com slogan dinâmico. Redireciona usuários logados diretamente para o Dashboard via Middleware.
- **Autenticação**: NextAuth com provedor de credenciais. Formulários em `src/components/auth/`.

### Dashboard Studio
- **Layout Simétrico**: O dashboard não possui mais header superior. Agora utiliza duas sidebars flutuantes:
  - **Sidebar Esquerda (Ferramentas)**: Criar e editar blocos (Estilo, Escrita, Mídia, Criativo).
  - **Actions Sidebar (Direita)**: Gestão de perfil, visualização pública, Share e Logout. Contém o **User Card** com saudações dinâmicas.
- **Avatar Personalizado**: Sistema de upload no cliente com compressão automática (`browser-image-compression`) e armazenamento em Base64 no banco de dados. Clique no avatar na sidebar direita para trocar.

## Core Tecnológico

### Mood Canvas & WYSIWYG
- **Mural (`src/components/dashboard/mood-canvas.tsx`)**: Sistema de Drag & Drop estabilizado com `framer-motion`. 
- **Sincronia Total**: O editor e a página pública são visualmente idênticos, respeitando uma **Safe Area de 40px** nas bordas para evitar cortes de conteúdo.
- **WebGL Backgrounds**: Efeitos de fundo (Aurora, Liquid, Universe, etc.) renderizados via Shaders para máxima performance (60 FPS).

### Sistema de Redimensionamento (Figma-like)
- **Módulo de cálculos**: `src/lib/canvas-transforms.ts` — funções puras para resize, separadas da UI.
- **8 Handles**: 4 cantos (BR, BL, TR, TL) + 4 bordas (top, bottom, left, right) para resize em 1 ou 2 eixos.
- **Canto oposto fixo**: Ao arrastar TL, o canto BR permanece fixo (e vice-versa). Padrão Figma.
- **Aspect Ratio Lock**: Segurar **Shift** durante resize mantém a proporção original.
- **Limites**: Mínimo 40×40px, máximo 2000×2000px. Blindado no Zod, no backend e no frontend.
- **Modularização de Itens**: `src/components/dashboard/canvas-item.tsx` — componente isolado que gerencia transformações, physics de mola (spring) e toolbar dedicada.
- **Smart Snapping 2.0**: Alinhamento magnético inteligente que inclui **Edge-to-Edge** (alinhar bordas opostas) e **Distance Guides** (réguas visuais que mostram o gap em % entre blocos vizinhos).
- **Adaptive Toolbar**: Ferramenta de ação que inverte sua posição (top/bottom) automaticamente se o bloco estiver muito próximo da borda superior, garantindo visibilidade total.
- **WYSIWYG Garantido**: `page-client.tsx` aplica `width`/`height` nos blocos públicos, espelhando o editor.
- **Persistência**: Hook `useCanvasManager` com epoch system + debounce 800ms. Sync bidirecional server ↔ local com feedback de erro resiliente.

### Arquitetura Universal de Blocos 🏛️💎
- **Universal Architecture**: O sistema foi consolidado para eliminar redundâncias.
  - **FrameContainer (`src/components/dashboard/FrameContainer.tsx`)**: Motor de molduras (Polaroid, Glass, Round, Minimal) que pode envolver qualquer conteúdo.
  - **SmartText (`src/components/dashboard/SmartText.tsx`)**: Motor unificado para 6 tipos de comportamentos: Estático, Letreiro (Ticker), Legenda (Typewriter), Flutuante, Citação (Quote) e Status de Humor.
  - **UniversalTextEditor (`src/components/dashboard/UniversalTextEditor.tsx`)**: Painel único de edição premium que gerencia toda a tipografia e o motor de migração ghost.
- **Migração Ghost**: Blocos legados (`ticker`, `subtitle`, `floating`, `phrase`, `quote`, `moodStatus`) são automaticamente convertidos para o tipo `text` com comportamento (`behavior`) específico ao serem editados, garantindo retrocompatibilidade sem arquivos duplicados.
- **Limpeza de Base**: 10 arquivos obsoletos (editores e blocos públicos individuais) foram removidos em favor desta arquitetura modular.

- **Mídia Ultra-Universal 📺🎵**:
  - **SmartMedia (`src/components/dashboard/SmartMedia.tsx`)**: Renderizador único que processa iframes de YouTube e Spotify com lógica de escala responsiva e parâmetros de mute/autoplay.
  - **UniversalMediaEditor (`src/components/dashboard/UniversalMediaEditor.tsx`)**: Interface modular que substitui os antigos buscadores individuais. Inclui suporte a todas as molduras (`FrameContainer`).
  - **Unificação de Catálogo**: Botões individuais de YouTube/Spotify foram consolidados no componente `media` unificado no `BlockLibrary`.
- **Limpeza de Base**: 14 arquivos obsoletos (editores e blocos públicos individuais) foram removidos em favor desta arquitetura modular de texto e mídia.

### Infraestrutura & Deploy
- **Docker Standalone**: Configuração otimizada para baixo consumo de recursos em instâncias AWS EC2.
- **CI/CD (GitHub Actions)**: Deploy automático via SSH. O pipeline realiza `git pull`, rebuild de containers e migrações Prisma (`db push`) automaticamente ao dar push na branch `main`.
- **Reverse Proxy**: Recomendado uso de Nginx no host da EC2 para SSL (Certbot) e encaminhamento para a porta 3000.

### Blindagem Técnica & Hardening (React 19 / Next.js 15)
- **Geometria Desacoplada**: A renderização de réguas e guias no Canvas deve usar **coordenadas 100% baseadas em porcentagem**. NUNCA acesse `.getBoundingClientRect()` ou propriedades de Refs durante o ciclo de renderização (React Ref Anti-pattern).
- **Derivação de Estado (maxZ)**: O índice `maxZ` para ordenação de blocos deve ser derivado via `useMemo` a partir da lista de blocos, evitando estados sincronizados em `useEffect` que causam renderizações em cascata.
- **Tipagem de Estilos Customizados**: Use a interface `CustomTextureStyle` (estendendo `React.CSSProperties`) para gerenciar variáveis CSS dinâmicas (ex.: `--room-texture-*`) sem recorrer ao tipo `any`.
- **Sanitização de Actions**: Server Actions devem receber dados limpos (substituindo `null` por `undefined` onde necessário) para evitar conflitos entre as tipagens do Prisma e os schemas de validação Zod.

---
*Documentação atualizada por Antigravity em 22/02/2026. Canvas blindado e pronto para escala.*

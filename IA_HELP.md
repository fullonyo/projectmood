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
21.   - **Sidebar Esquerda (Ferramentas)**: Criar e editar blocos (Estilo, Escrita, Mídia, Criativo).
22.   - **Actions Sidebar (Direita)**: Gestão de perfil, visualização pública, Share e Logout. Contém o **User Card** com saudações dinâmicas.
- **Command Sidebar HUD 🕹️💎**: A sidebar evoluiu para um sistema HUD dinâmico:
    - **Contextual Intelligence**: O cabeçalho alterna entre "Diorama Title" e "Multi-Selection Actions" (Alinhamento, Delete e métricas HUD de precisão) ao selecionar múltiplos blocos.
    - **Room Insight**: Quando ociosos, exibe estatísticas atmosféricas como Dominância Cromática (Luminance Spectrum) e tempo desde a última publicação (Release Stats).
    - **Estética HUD (Studio 2.0)**: Uso de grades ultra-finas (0.5px), tipografia mono-espaçada para metadados e animações de layout fluido (`layoutId`).
    - **Standardization**: Todos os seletores nativos (`select`) foram removidos em favor de grades técnicas HUD com marcadores de canto e estados reativos de alta precisão.
27. - **Avatar Personalizado**: Sistema de upload no cliente com compressão automática (`browser-image-compression`) e armazenamento em Base64 no banco de dados. Clique no avatar na sidebar direita para trocar.

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
- **Coreografia Studio 3.1 🎭✨**:
  - **Orquestração Blindada**: O `MoodCanvas` utiliza a chave `profile.theme` para disparar o `stagger` apenas em momentos críticos (troca de vibe/carregamento).
  - **Staggered Blur (Fast)**: Entrada sequencial (stagger: 0.03s) com foco dinâmico (blur: 10px -> 0px) e escala (0.96 -> 1).
  - **AnimatePresence & Layout**: Uso de `popLayout` e prop `layout` no `CanvasItem` para garantir que adições/remoções e mudanças de posição sejam fluidas e não re-trigguem a animação de entrada.
  - **GPU Optimized**: Uso de `will-change: transform, opacity, filter` para preparar a GPU e manter 60fps estáveis.
- **Histórico & State Machine (Studio 4.0) ⏪🚀**:
  - **Undo/Redo**: Sistema de stack centralizado em `src/lib/canvas-history.ts`. Suporta Ctrl+Z/Ctrl+Y e sincroniza automaticamente com o backend em lote.
  - **State Machine**: O hook `useCanvasManager` expõe `canvasState` (`IDLE`, `DRAGGING`, `RESIZING`, `SELECTING`), permitindo que a UI reaja dinamicamente às interações.
  - **Persistência Debounced**: Sincronização automática com debounce de 800ms e sistema de Epoch para evitar race-conditions entre o cliente e o servidor. Blindagem contra `NaN` e mesclagem profunda de `content` implementada em `use-canvas-manager.ts`.
- **Command Center (Central de Atalhos)**: Componente flutuante (`CommandCenter.tsx`) que serve como cheatsheet viva. Acessível via `?` ou `Ctrl+K`.

### Comandos & Atalhos de Teclado (Precision Engine) ⌨️🚀
O MoodSpace utiliza um motor de precisão para manipulação de blocos:
- **Navegação**: 
    - `Space + Drag`: Pan (mover câmera).
    - `Ctrl + / - / 0`: Zoom in, out e reset (100%).
- **Criação Ágil**:
    - `Alt + Drag`: Duplica o bloco instantaneamente na nova posição.
    - `Ctrl+C / Ctrl+V`: Copia e cola o conteúdo via `localStorage` (suporta múltiplos blocos).
- **Precisão (Shift Held)**:
    - **Drag**: Snap de eixo (trava horizontal/vertical).
    - **Resize**: Mantém proporção (Aspect Ratio).
    - **Rotation**: Snap incremental de 15°.
- **Seleção Inteligente**: 
    - `Shift + Click`: Toggle de seleção individual.
    - `Smart Groups`: Selecionar qualquer membro de um grupo seleciona o grupo inteiro automaticamente.

### Arquitetura Universal de Blocos 🏛️💎
- **Universal Architecture**: O sistema foi consolidado para eliminar redundâncias.
  - **FrameContainer (`src/components/dashboard/FrameContainer.tsx`)**: Motor de molduras (Polaroid, Glass, Round, Minimal) que pode envolver qualquer conteúdo.
  - **SmartText (`src/components/dashboard/SmartText.tsx`)**: Motor unificado para 6 tipos de comportamentos: Estático, Letreiro (Ticker), Legenda (Typewriter), Flutuante, Citação (Quote) e Status de Humor.
  - **UniversalTextEditor (`src/components/dashboard/UniversalTextEditor.tsx`)**: Painel único de edição premium que gerencia toda a tipografia e o motor de migração ghost.
- **Migração Ghost**: Blocos legados (`ticker`, `subtitle`, `floating`, `phrase`, `quote`, `moodStatus`) são automaticamente convertidos para o tipo `text` com comportamento (`behavior`) específico ao serem editados, garantindo retrocompatibilidade sem arquivos duplicados.
- **Limpeza de Base**: 10 arquivos obsoletos (editores e blocos públicos individuais) foram removidos em favor desta arquitetura modular.

  - **Mídia Ultra-Universal 📺🎵**:
    - **SmartMedia (`src/components/dashboard/SmartMedia.tsx`)**: Renderizador único que processa YouTube, Spotify e **Upload de Áudio Local**.
      - **Legendas Inteligentes (Smart Lyrics)**: Suporta dois modos de exibição:
        - **Integrated**: Legendas dentro do bloco (estilo cinema no vídeo ou HUD no áudio).
        - **Fullscreen (Global)**: Envia a legenda para o `GlobalLyricsOverlay`, exibindo-a na base da tela sem moldura, consumindo o estado centralizado via `AudioContext`.
      - **Autoplay Inteligente**: Depende do estado global `hasInteracted` (capturado pelo `ExperienceOverlay.tsx`) para iniciar com áudio (em loop).
      - **YouTube Loop**: Utiliza o parâmetro `playlist` do iFrame para forçar o loop infinito.
    - **UniversalMediaEditor (`src/components/dashboard/UniversalMediaEditor.tsx`)**: Interface modular com abas.
      - **Upload Local**: Suporta arquivos MP3/WAV até **5MB** via Base64.
      - **Metadados Manuais**: Permite editar Título e Artista para áudios locais.
      - **Ghost Migration**: Blocos legados são convertidos para o tipo `media` ao serem editados.
    - **Unificação de Catálogo**: Botões individuais consolidados no componente `media` unificado.
    - **Distinção Crítica**: Não confundir `Mídia Universal` com `Coleção de Mídia`.
- **Limpeza de Base**: 14 arquivos obsoletos (editores e blocos públicos individuais) foram removidos em favor desta arquitetura modular de texto e mídia.

### Experiência Pública & Autoplay
- O `ExperienceOverlay.tsx` captura a interação inicial do usuário para desbloquear o som.
- Players de YouTube e Spotify reagem ao estado `hasInteracted` para iniciar com áudio.

### 🎨 Ferramentas Artísticas (SmartShapes 2.0 Plus)
O sistema **SmartShapes** permite a composição de murais complexos e estéticos com alta performance.

### Componentes Chave:
- **`SmartShape.tsx`**: Renderiza geometrias via SVG (Círculo, Retângulo, Polígono, Blob, Estrela, Linha, Grade, Flor, Teia, Onda, Espiral).
- **`UniversalShapeEditor.tsx`**: Interface de controle dividida em abas (**Geometria**, **Estética**, **Efeitos FX**).
- **`UniversalWeatherEditor.tsx`**: Sistema dinâmico que integra clima em tempo real via Server Actions (`getWeatherAction`) e possui interface de abas (**Conexão** | **Estética**) simétrica ao SmartShapes.
- **Sinergia Studio 2.2**: O sistema Weather agora suporta `opacity` e `blendMode` nativos através do `CanvasItem`, permitindo composições atmosféricas complexas.
- **Variações Determinísticas**: O sistema de sementes (`seed`) permite até 100 variações únicas para Mood Elements, garantindo que o design seja persistente e idêntico em todas as visualizações.
- **Blindagem Geométrica**: O motor de SVG possui fallbacks matemáticos para garantir que `sides`, `points` e `gradientColors` nunca causem crash ou renderizações inválidas.
- **Mix Blend Modes**: Suporte a modos de mesclagem universais no `CanvasItem` para interação visual entre qualquer tipo de bloco sobreposto (Weather, Shape, Text, Media).
- **Sincronização Atmosférica**: O ambiente (`RoomEnvironment`) reage ao clima detectado nos blocos, ativando efeitos visuais síncronos (ex: chuva sutil) automaticamente se nenhum fundo estiver ativo.

### Melhores Práticas Artísticas:
1. **Z-Index**: Use polígonos com baixa opacidade e `mix-blend-mode: multiply` atrás de fotos para criar profundidade.
### 🌪️ Motor Generativo: Smart Rorschach
O bloco **Rorschach** (`SmartRorschach.tsx`) é um motor de arte abstrata procedural:
- **Simetria Dinâmica**: Suporta eixos `Vertical`, `Horizontal` e `Quad` (espelhamento quádruplo).
- **Ink Bleeding Effect**: Usa filtros SVG combinados (`feGaussianBlur` + `feColorMatrix`) para simular a capilaridade da tinta no papel.
- **Micro-animações**: Os caminhos SVG possuem transições de escala e opacidade via `framer-motion` para um efeito de "respiração".
- **Seed Determinística**: A mesma semente gera exatamente a mesma mancha artística, permitindo persistência total no mural público.

### Infraestrutura & Deploy
- **Docker Standalone**: Configuração otimizada para baixo consumo de recursos em instâncias AWS EC2.
- **CI/CD (GitHub Actions)**: Deploy automático via SSH. O pipeline realiza `git pull`, rebuild de containers e migrações Prisma (`db push`) automaticamente ao dar push na branch `main`.
- **Reverse Proxy**: Recomendado uso de Nginx no host da EC2 para SSL (Certbot) e encaminhamento para a porta 3000.

### Blindagem Técnica & Hardening (React 19 / Next.js 15)
- **Geometria Desacoplada**: A renderização de réguas e guias no Canvas deve usar **coordenadas 100% baseadas em porcentagem**. NUNCA acesse `.getBoundingClientRect()` ou propriedades de Refs durante o ciclo de renderização (React Ref Anti-pattern).
- **Derivação de Estado (maxZ)**: O índice `maxZ` para ordenação de blocos deve ser derivado via `useMemo` a partir da lista de blocos, evitando estados sincronizados em `useEffect` que causam renderizações em cascata.
- **Tipagem de Estilos Customizados**: Use a interface `CustomTextureStyle` (estendendo `React.CSSProperties`) para gerenciar variáveis CSS dinâmicas (ex.: `--room-texture-*`) sem recorrer ao tipo `any`.
- **Sanitização de Actions**: Server Actions devem receber dados limpos (substituindo `null` por `undefined` onde necessário) para evitar conflitos entre as tipagens do Prisma e os schemas de validação Zod.
- **Central de Cache (Performance & Consistência) ⚡**:
  - **Tags Centralizadas**: `src/lib/cache-tags.ts` define todas as chaves de revalidação. NUNCA use strings soltas para `revalidateTag`.
  - **Prisão de Tipos**: Use o perfil `'default'` em `revalidateTag(tag, 'default')` conforme exigido pelo Next.js 16.
  - **Detecção de Mudanças (Draft vs. Published)**: Algoritmo de normalização recursiva em `publish.ts` garante que a detecção de "mudanças não publicadas" seja determinística (ordena chaves de objetos e arrays) para evitar falsos positivos.

### Design System Admin (Command Center) 🛡️⚡
As interfaces administrativas seguem o padrão **Premium Hacker UI**, focado em alta densidade de informação e estética técnica de baixo ruído.

- **Filosofia**: O admin deve parecer um "Command Center" ou console de monitoramento de infraestrutura.
- **Tipografia**:
    - **Headers**: `text-4xl font-black uppercase tracking-tighter` para títulos principais.
    - **Subtitles**: `text-sm text-zinc-500 font-mono` para descrições técnicas.
    - **Labels**: `text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500` para identificadores de categoria.
    - **Dados**: Use sempre `font-mono` e `tabular-nums` para IDs, timestamps e métricas.
- **Paleta & UI**:
    - **Cores de Status**: `Emerald` (Ativo), `Red` (Banido/Risco), `Blue` (Verificado), `Amber` (Ação Necessária).
    - **Bordas**: Substitua sombras por bordas de `1px` em `zinc-900`. 
    - **Backdrops**: Use `zinc-950/50` com leve transparência para containers.
- **UX**:
    - **Hover-Active**: Ações perigosas ou secundárias devem ter `opacity-0` e transicionar para `opacity-100` apenas no hover da linha ou card.
    - **Largura**: Telas de admin devem utilizar a largura total disponível (remova `max-w` desnecessários) para permitir monitoramento multitarefa.
    - **Paginação**: Padrão "Archive Log" usando links `MANIFEST_PREV` / `MANIFEST_NEXT` em mono.

### Studio 2.1 / HUD Core Design Standards 🕹️✨
Para manter a blindagem estética e técnica:
1. **HUD Headers**: Use sempre o ícone `Activity` com `opacity-30`. Tipografia: `text-[7.5px] font-black uppercase tracking-[0.4em]`. Margem: `mb-2`.
2. **Corner Markers**: Usar `absolute top-0 right-0 w-2 h-2 border-t border-r border-current` para indicar foco ou interatividade técnica.
3. **Abas & Grades**: Devem usar `grid` técnico com `gap-[1px]` e marcadores de canto quando ativos.
4. **Glassmorphism**: Fundos `bg-white/95` ou `bg-black/95` com `backdrop-blur-2xl`.
5. **Comandos HUD**: Modais devem usar `rounded-none`.

### Guestbook Studio 3.0 (Evolução Criativa) 💎🌪️✨
O Mural de Recados foi elevado para além do container tradicional, permitindo composições orgânicas.
- **Layout Modes**:
  - **Classic**: Container padrão com escala FUS otimizada.
  - **Scattered (Post-it)**: Remove as bordas do bloco. As mensagens são renderizadas como fragmentos independentes com rotação randômica e efeito de **Sticky Tape** (fita adesiva) automático.
  - **Cloud (Floating)**: Mensagens sem bordas, apenas texto com glow sutil, flutuando organicamente.
- **Micro-Aesthetics Engine**: O escalonamento FUS foi recalibrado em 15% para uma estética mais minimalista e arquitetural ("Small-tech"). Densidade e escala podem ser ajustadas via slider no editor.

### Mood Templates 2.0 (Harmonic Vibes) 🎨🌪️✨
Sistema para reduzir a paralisia do canvas vazio e inspirar novos usuários através de curadorias detalhadas.
- **DNA Visual 2.0**: Templates agora são composições avançadas que incluem:
    - **Base Atmosférica**: Combinações de `backgroundEffect`, `backgroundColor` e `theme`.
    - **Textura & Grão**: Uso de `staticTexture` (`museum_paper`, `noise`, `fine_sand`) para profundidade tátil.
    - **Auras Decorativas**: Uso de `SmartShapes` em camadas inferiores (opacidade baixa e blur alto) agindo como decoração de fundo.
    - **Persistência Estendida**: Persiste não apenas blocos, mas também `customCursor` e `mouseTrails` específicos para cada vibe.
- **Vibes Atuais**:
    - **Deep Work**: Mono, Aurora, Timer Pomodoro.
    - **Scrapbook**: Sépia, Textura de Papel, Formas Orgânicas (Blobs/Flowers).
    - **Cyber Station**: Tech-Noir, Grid-Move, VHS, Pixel Trails.
    - **Atmospheric Zen**: Lavanda, Liquid, Clima de Kyoto, Movimento Ethereal.
- **Template Chooser**: UI automática renderizada no `MoodCanvas` quando `blocks.length === 0`. Inclui opção de "Start Fresh" para pular o onboarding.

---
*Documentação atualizada por Antigravity em 27/02/2026. Command Center e Precision Engine integrados.*

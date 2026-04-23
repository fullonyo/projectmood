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

## Smart Architecture & Universal Editors 🏗️✨

O sistema de componentes é dividido em dois pilares fundamentais para garantir escalabilidade e performance:

### 🎮 Smart Blocks (Public/Renderer Mode)
Localizados em `src/components/dashboard/`, estes componentes são responsáveis pela renderização ultra-otimizada no Mural e na Página Pública:
- **Padrão de Nome**: `Smart[Type].tsx` (ex: `SmartPhoto.tsx`, `SmartText.tsx`).
- **Escala Inteligente**: Consomem o `ScaleProvider` centralizado via `useViewportScale` para garantir que o aspect-ratio seja perfeito em qualquer dispositivo sem redundância de listeners.
- **Isolamento**: Não contêm lógica de edição ou mutations, focando apenas em visual e interatividade fluida.

### 🛠️ Universal Editors (Admin/Edit Mode)
Localizados em `src/components/dashboard/`, os editores centralizam toda a lógica de configuração e persistência:
- **Padrão de Nome**: `Universal[Type]Editor.tsx` (ex: `UniversalPhotoEditor.tsx`, `UniversalRorschachEditor.tsx`).
- **Fluxo Único**: Gerenciam tanto a criação de novos blocos (`onAdd`) quanto a atualização em tempo real de blocos existentes (`onUpdate`).
- **Registro Central**: Todas as rotas de edição são mapeadas no `block-editor-registry.tsx`.

#### Universal Identity Editor (`UniversalIdentityEditor.tsx`) 🛡️👤
- **Padrão Visual**: Segue o **Studio Editor Standard**, utilizando `EditorHeader`, `EditorSection` e `EditorActionButton`.
- **Inputs HUD**: Utiliza inputs com fundo `bg-zinc-50 dark:bg-zinc-900/50`, cantos `rounded-2xl` e ícones técnicos (`User`, `AtSign`).
- **Feedback Reativo**: Exibe um "Tab Preview" em tempo real para que o usuário veja como sua identidade aparecerá na aba do navegador antes de salvar.
- **i18n Integrado**: Todas as labels, hints e toasts de sucesso/erro são consumidos via `useTranslation` (`editors.identity.*`).

## Core Tecnológico

### Mood Canvas & WYSIWYG
- **Mural (`src/components/dashboard/mood-canvas.tsx`)**: Sistema de Drag & Drop estabilizado com `framer-motion`. 
- **Sincronia Total**: O editor e a página pública são visualmente idênticos, respeitando uma **Safe Area de 40px** nas bordas para evitar cortes de conteúdo.
- **WebGL Backgrounds**: Efeitos de fundo (Aurora, Liquid, Universe, etc.) renderizados via Shaders para máxima performance (60 FPS).

### Sistema de Redimensionamento (Figma-like)
- **Módulo de cálculos**: `src/lib/canvas-transforms.ts` — funções puras para resize, separadas da UI.
- **8 Handles**: 4 cantos (BR, BL, TR, TL) + 4 bordas (top, bottom, left, right) para resize em 1 ou 2 eixos.
- **Canto oposto fixo**: Ao arrastar TL, o canto BR permanece fixo (e vice-versa). Padrão Figma.

### MoodSpace Architecture 2.2: The Sovereign State
**Objetivo**: Performance extrema (60 FPS), consistência atômica e modularidade Figma-like.

#### 1. Zero-Tearing Architecture
Para operações de alta frequência (movimentação, rotação), não dependemos do ciclo de renderização do React/DB para feedback visual.
- **Refs & MotionValues**: O estado visual imediato é mantido em `refs` e `MotionValues`.
- **Custom DOM Events**: Comunicação entre componentes de seleção (Aura) e itens do canvas via `CANVAS_EVENTS.GROUP_ROTATE` etc.
- **Batch Persistence**: Persistência no banco de dados ocorre apenas no `onPanEnd` ou via debounced batch updates no `useCanvasManager`.

#### 2. useCanvasManager: Single Source of Truth
Toda a lógica de mutação de blocos deve passar por este hook.
- **Z-Index Intelligence**: Gerenciamento automático de camadas (`bringToFront`, `sendToBack`).
- **Smart Selection**: Inclusão automática de membros de grupo e normalização de IDs.
- **Epoch System**: Proteção contra race conditions entre Server Actions e atualizações locais.

#### 3. Modular Canvas UI
Lógicas pesadas de renderização foram extraídas do `MoodCanvas.tsx`:
- **SelectionAura**: Handles de rotação/redimensionamento, labels de grupo e glows atmosféricos.
- **LassoSelector**: Lógica de seleção por área (clique e arraste).
- **CanvasUtils**: Normalização de inputs (`getClientPos`) e cálculos de bounding box.

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

### Ciclo de Vida de uma Interação no Canvas 🖱️✨

Para entender como o sistema processa um movimento desde o clique até a persistência:

1.  **Clique em Área Vazia**:
    *   **Lasso Selection**: Se o usuário clicar e arrastar no fundo do canvas, o `LassoSelector.tsx` cria uma caixa de seleção. IDs dentro da área são injetados em `selectedIds`.
    *   **Panning (Câmera)**: Se `Space` estiver pressionado, o `MoodCanvas.tsx` captura o movimento para transladar todo o `motion.div` da câmera (`mvPanX`, `mvPanY`).

2.  **Clique em Bloco (Focus & Drag)**:
    *   **Alvo**: `CanvasItem.tsx`.
    *   **Ação**: `onPanStart` (Framer Motion) captura a intenção. Se o bloco não estiver selecionado, ele assume o foco (`onSelect`). O estado `isInteracting` da `stateRef` é ativado para bloquear sincronizações externas durante o movimento.
    *   **Coordenadas**: Posição inicial (`startX`, `startY`) é gravada na `ref` para cálculos relativos estáveis.

3.  **Movimentação (High-Frequency Drag)**:
    *   **Alvo**: `handleDragPan`.
    *   **Cálculo de Precisão**: O deslocamento em pixels (`info.delta`) é convertido em **porcentagem (%)** com base no `getBoundingClientRect` do canvas. Isso garante que o movimento seja idêntico em qualquer nível de Zoom.
    *   **Zero-Tearing**: O valor é injetado nos `MotionValues` (`mvX`, `mvY`). Isso move o bloco via GPU sem disparar re-renders do React (60 FPS cravados).
    *   **Magnetic Snapping**: O motor `calculateSnap` projeta as `guidelines` (réguas azuis) e ajusta as coordenadas para alinhar bordas e centros com outros blocos.

4.  **Soltura e Persistência (Commit)**:
    *   **Alvo**: `handleDragEnd`.
    *   **Cleanup**: Remove guias visuais e reseta `isInteracting`.
    *   **Comportamento Alt**: Se `Alt` estiver pressionado, o bloco original volta ao lugar e uma cópia é criada na posição final.
    *   **Persistência**: Dispara `onUpdate` que sobe até o `useCanvasManager`. A persistência no DB é debounced para evitar sobrecarga em movimentos rápidos.

### Performance & Viewport Scaling 📏🚀
- **ScaleProvider (`src/lib/contexts/ScaleProvider.tsx`)**: Centraliza o cálculo de proporção do Canvas. Utiliza um único listener de `resize` para toda a aplicação, injetado no layout raiz.
- **useViewportScale**: Hook legado mantido para retrocompatibilidade, mas agora otimizado para consumir o `ScaleProvider` global, eliminando gargalos de CPU no redimensionamento.

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

### Arquitetura de UI Premium (Studio 2.1) 🕹️💎
Para elevar o nível de sofisticação e reduzir a carga cognitiva, o Studio 2.1 adota padrões de design ultra-minimalistas:

- **Premium Ghost Pattern (Sidebar/Editors)**:
    - **Filosofia**: Ícones puros são os protagonistas. Remova molduras (círculos/cards) e títulos quando o símbolo for autoexplicativo (ex: redes sociais, emojis de countdown, estilos visuais).
    - **GridSelector**: Utilize `variant="ghost"` no componente `GridSelector`.
    - **Escala**: Os ícones devem ser proeminentes (`w-8 h-8` ou 32px) para compensar a ausência de moldura.
    - **Indicador Ativo**: Use o ponto flutuante centralizado na base (`ghost-active`) via `framer-motion` para sinalizar a seleção de forma sutil.
    - **Cromatismo**: O estado ativo deve respeitar a cor da marca (brand color) se disponível, reforçando a identidade da plataforma sem poluir o layout.

- **Frame Awareness (Consciência de Moldura)**:
    - **Objetivo**: Evitar o erro estético de "Bordas Duplas".
    - **Lógica**: Blocos utilitários (`Social`, `Weather`, `Countdown`) devem aceitar a prop `isInsideFrame`.
    - **Comportamento**: Se `isInsideFrame` for verdadeiro (detectado via `BlockRenderer` ao verificar se há um `FrameContainer` ativo), o bloco deve remover automaticamente seus próprios `background`, `border`, `shadow` e `borderRadius`.
    - **Resultado**: O bloco se "funde" à moldura escolhida (Polaroid, Glass, etc.), herdando sua estética de forma limpa e profissional.

### Experiência Pública & Autoplay
- O `ExperienceOverlay.tsx` captura a interação inicial do usuário para desbloquear o som.
- Players de YouTube e Spotify reagem ao estado `hasInteracted` para iniciar com áudio.
### 📐 Studio 2.1: Countdown & Configuration Standard

1. **Ghost Configuration Pattern**:
   - Remova molduras (`border`, `bg-white`) de containers internos nos editores.
   - Use `EditorSection` para separar grupos logicamente, mas mantenha os inputs flutuando sobre o fundo da sidebar.
   - Inputs premium: `h-14`, `rounded-2xl`, ícones em slots `w-8 h-8` que reagem ao foco.

2. **Persistência Autônoma**:
   - Editores devem ser "Soberanos": Importar `addMoodBlock` e usá-lo como fallback se `onAdd` não for fornecido.
   - Sempre disparar `onClose()` após criação bem-sucedida para fluidez de UX.

3. **Premium Ghost Pattern (Tooltips)**:
   - Seletores de ícones/estilos devem usar `variant="ghost"` no `GridSelector`.
   - Obrigatório o uso de `id` único para isolar a bolinha indicadora (`layoutId`).
   - Tooltips flutuantes via `AnimatePresence` para compensar a ausência de labels de texto fixos.
### 🎨 Ferramentas Artísticas (Smart Architecture)
O sistema **Smart Architecture** permite a composição de murais complexos e estéticos com alta performance.

### Componentes Chave:
- **`SmartShape.tsx`**: Renderiza geometrias via SVG.
- **`UniversalShapeEditor.tsx`**: Interface de controle dividida em abas (**Geometria**, **Estética**, **Efeitos FX**).
- **`UniversalWeatherEditor.tsx`**: Sistema dinâmico que integra clima em tempo real via Server Actions.
- **`SmartWeather.tsx`**: Renderizador atmosférico de elite.
- **`SmartPhoto.tsx` / `SmartReview.tsx`**: Renderizadores padronizados para imagens e críticas.
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

### Central de Performance & Blindagem (P0-P3) ⚡🚀
Para garantir fluidez absoluta em murais com alta densidade de blocos:
- **P0 (Lyrics Loop)**: NUNCA clone arrays (`[...]`) ou use `.reverse()` dentro do `onTimeUpdate` de áudio. Use loops reversos simples para busca de letras para evitar pressão no Garbage Collector.
- **P1 (Context Isolation)**: O estado de letras deve residir estritamente no `LyricsProvider`. O `AudioProvider` lida apenas com estados globais (volume/mute). Isso evita que mudanças frequentes de letras re-renderizem a UI de áudio.
- **P2 (GPU Acceleration)**: Animações de progresso e Waveforms devem usar `transform: scale()` ou `translate()` com `will-change: transform`. Evite animar `width` ou `height` para não disparar ciclos de *Layout/Reflow*.
- **P3 (Scale Mapping)**: Operações de normalização de camadas (Z-Index) devem usar `Map` para mapeamento $O(1)$ de IDs, garantindo performance linear mesmo com centenas de elementos.

### Catálogo de Blocos (User Architecture) 📦🎨
O ecossistema MoodSpace é composto por 11 tipos de blocos fundamentais, cada um com comportamentos e especializações únicas:

1.  **Typography (`text`)**: Bloco base para comunicação. Suporta múltiplos comportamentos: `static`, `ticker` (letreiro), `typewriter` (máquina de escrever), `floating` (flutuação suave) e `quote` (estilização de citação).
2.  **Photo (`photo`)**: Renderização de imagens com suporte a legendas (`caption`) e múltiplos estilos de moldura (`FrameContainer`).
3.  **Universal Media (`media`)**: O coração dinâmico. Suporta Player de Música (Spotify/Local) com letras sincronizadas e Player de Vídeo (YouTube/TikTok).
4.  **GIF (`gif`)**: Integração rápida para elementos visuais em loop, ideal para texturas animadas ou memes.
5.  **Weather (`weather`)**: Bloco de utilidade que exibe clima e temperatura em tempo real com estética minimalista.
6.  **Doodle (`doodle`)**: Camada de arte livre. Renderiza traços e desenhos manuais exportados do `FullscreenDoodleOverlay`.
7.  **Guestbook (`guestbook`)**: Bloco de interação social. Suporta modos `Classic`, `Scattered` e `Cloud` (veja seção específica abaixo).
8.  **Countdown (`countdown`)**: Relógio de contagem regressiva para datas específicas, focando em antecipação estética.
9.  **Social (`social`)**: Links rápidos para redes externas com ícones técnicos e layouts de cartão minimalistas.
10. **Shape (`shape`)**: Elementos geométricos generativos (Blobs, Polígonos, Estrelas). Usados para criar "Auras" decorativas atrás de outros blocos.
11. **Rorschach (`rorschach`)**: Bloco de arte generativa baseada em simetria de manchas, variando conforme o `seed`.

*Nota: O **SmartReview** é uma especialização semântica de mídia focada em avaliações críticas, geralmente integrada ao fluxo de curadoria.*

### HUD System: Public Slots (Studio 2.1) 🎛️
Para evitar sobreposição e manter uma leitura limpa das obras, os overlays da página pública são estritamente alinhados em um grid técnico imersivo:
- **Top-Left**: `ProfileSignature` (Avatar, Nome, Role e HUD Volume/Focus Controls).
- **Top-Center**: `GuestPromotion` (Desliza dinamicamente como notificação *in-app* para incentivar inscrições sem bloquear a visão inferor).
- **Top-Right**: `StudioCatalogID` (Número de catálogo único e estilizado, exclusivo para identificação da sala).
- **Bottom-Left**: `AnalyticsDisplay` (Métricas Live, Pisca dinâmico baseado em volume de views).
- **Bottom-Center**: `GlobalLyricsOverlay` (Reservado estritamente para reprodução de letras *fullscreen* com amplo *padding*, garantindo respiração tipográfica).
- **Bottom-Right**: `SignatureShare` (Código de barras técnico e botão de cópia de link, invertido para expandir à esquerda).

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
6. **Memoização Obrigatória**: Todos os componentes HUD (`ProfileSignature`, `AnalyticsDisplay`, `StudioCatalogID`, `SignatureShare`) DEVEM ser envolvidos em `React.memo` para proteção contra re-renderizações em cascata dos Providers.

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

### Arquitetura Smart & Escala Global (Studio 2.1) 💎⚡
O sistema foi elevado para um novo padrão de performance e organização:
- **Smart Architecture**: Todos os renderizadores de blocos seguem o padrão `Smart*` (ex: `SmartPhoto`, `SmartReview`, `SmartWeather`).
    - **SmartReview**: Nome exclusivo para resenhas de mídia, separando a semântica de "Play" (SmartMedia) de "Review".
- **ScaleProvider (`src/lib/contexts/ScaleProvider.tsx`)**: Sistema centralizado que calcula a escala do viewport (`useGlobalScale`).
    - **Performance**: Elimina centenas de listeners redundantes de resize, centralizando o controle em um único Context.
    - **FUS (Fluid Unit Scaling)**: Garante que o canvas seja idêntico em qualquer resolução (1080p, 4K, Mobile).

### User Identity & Aesthetic Metadata (Studio 2.2) 🛡️✨

Para garantir segurança, SEO e a estética minimalista da plataforma, o tratamento de identidades segue regras estritas:

- **Username Standard**: 
    - **Casing**: Todos os nomes de usuário são forçados para **letras minúsculas** (`[a-z0-9_]`) no registro e salvamento.
    - **Reserved Names**: Lista de 29+ termos do sistema bloqueados (ex: `admin`, `api`, `dashboard`, `auth`) para evitar "sequestro" de rotas.
    - **Normalization**: Consultas ao banco de dados usam `.toLowerCase()` e `mode: 'insensitive'` para máxima resiliência.
- **URL Handling**: 
    - **Canonical Redirects**: Qualquer URL de perfil acessada com letras maiúsculas (ex: `/Nyo`) é redirecionada permanentemente (301) para sua versão canônica em minúsculo (`/nyo`).
    - **Middleware**: Verificação de caminhos com precisão absoluta (`/dashboard/` vs `/dashboard-user`) para evitar colisões entre rotas do sistema e perfis de usuários.
- **Aesthetic Metadata (Browser Tabs)**:
    - **Template Global**: `%s — moodspace` (Uso de letras minúsculas e travessão `—`).
    - **Símbolos de Status**: 
        - **Padrão**: Travessão (`—`) como separador.
        - **Autoridade/Verificado**: Brilho (`✦`) como separador.
    - **Lógica de Título Inteligente**: 
        - **Apenas Username**: `@username — moodspace`
        - **Com Nome Real**: `Nome (@username) — moodspace` (Evita redundância se o nome for igual ao username).
    - **Admin Hub**: Título absoluto `admin ✦ moodspace`.

---
*Documentação atualizada por Antigravity em 22/04/2026. User Identity & Aesthetic Metadata integrados.*

### 📐 Canvas Architecture 2.2 (Referência Rápida)
Para detalhes profundos, consulte: `docs/CANVAS_ARCHITECTURE.md`

#### Regras de Ouro para Manutenção:
1.  **Não use `useState` para transformações em tempo real**: Use `MotionValues` (framer-motion) e `refs`.
2.  **Mutações via `useCanvasManager`**: Nunca modifique o array de blocos diretamente no `MoodCanvas`. Use `updateBlocks` ou os helpers de Z-index.
3.  **Eventos Customizados**: Se adicionar um novo tipo de manipulação global (ex: skew, zoom), use o barramento `CANVAS_EVENTS` em `canvas-utils.ts`.
4.  **Coordenadas**: Sempre converta cálculos de pixel para porcentagem (%) usando as dimensões do canvas antes de salvar.
5.  **Smart Selection**: Sempre respeite o `groupId`. Se um bloco for movido, todos do grupo devem segui-lo (o `useCanvasManager` já faz isso no `updateBlocks`).

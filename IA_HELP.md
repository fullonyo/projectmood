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
- **Coreografia Studio 3.1 🎭✨**:
  - **Orquestração Blindada**: O `MoodCanvas` utiliza a chave `profile.theme` para disparar o `stagger` apenas em momentos críticos (troca de vibe/carregamento).
  - **Staggered Blur (Fast)**: Entrada sequencial (stagger: 0.03s) com foco dinâmico (blur: 10px -> 0px) e escala (0.96 -> 1).
  - **AnimatePresence & Layout**: Uso de `popLayout` e prop `layout` no `CanvasItem` para garantir que adições/remoções e mudanças de posição sejam fluidas e não re-trigguem a animação de entrada.
  - **GPU Optimized**: Uso de `will-change: transform, opacity, filter` para preparar a GPU e manter 60fps estáveis.

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
2. **Blur & Glass**: Formas com desfoque alto atuam como luzes de fundo (Glow effects).
3. **Blobs**: Use formas orgânicas para quebrar a rigidez da grade.

### Infraestrutura & Deploy
- **Docker Standalone**: Configuração otimizada para baixo consumo de recursos em instâncias AWS EC2.
- **CI/CD (GitHub Actions)**: Deploy automático via SSH. O pipeline realiza `git pull`, rebuild de containers e migrações Prisma (`db push`) automaticamente ao dar push na branch `main`.
- **Reverse Proxy**: Recomendado uso de Nginx no host da EC2 para SSL (Certbot) e encaminhamento para a porta 3000.

### Blindagem Técnica & Hardening (React 19 / Next.js 15)
- **Geometria Desacoplada**: A renderização de réguas e guias no Canvas deve usar **coordenadas 100% baseadas em porcentagem**. NUNCA acesse `.getBoundingClientRect()` ou propriedades de Refs durante o ciclo de renderização (React Ref Anti-pattern).
- **Derivação de Estado (maxZ)**: O índice `maxZ` para ordenação de blocos deve ser derivado via `useMemo` a partir da lista de blocos, evitando estados sincronizados em `useEffect` que causam renderizações em cascata.
- **Tipagem de Estilos Customizados**: Use a interface `CustomTextureStyle` (estendendo `React.CSSProperties`) para gerenciar variáveis CSS dinâmicas (ex.: `--room-texture-*`) sem recorrer ao tipo `any`.
- **Sanitização de Actions**: Server Actions devem receber dados limpos (substituindo `null` por `undefined` onde necessário) para evitar conflitos entre as tipagens do Prisma e os schemas de validação Zod.

### Administração & Moderação 🛡️
- **Gestão de Roles**: O sistema utiliza um enum `Role` (`USER`, `CURATOR`, `MODERATOR`, `ADMIN`).
- **Comando Manual (Emergência)**: Para conceder acesso administrativo via SSH:
  ```bash
  docker exec moodspace_db psql -U mood_admin -d moodspace_prod -c "UPDATE \"User\" SET role = 'ADMIN' WHERE username = 'Nyo';"
  ```
- **Auditoria**: Todas as ações administrativas são registradas na tabela `AuditLog`.

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
*Documentação atualizada por Antigravity em 24/02/2026. Acesso administrativo concedido ao usuário Nyo conforme solicitado. Mood Templates 1.0 (Onboarding Criativo) entregue.*

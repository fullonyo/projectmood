# Ajuda da IA - MoodSpace Studio 🌌✨🛡️

Este arquivo centraliza a documentação de funcionalidades e componentes do **MoodSpace** para facilitar o contexto da IA e manter a consistência do ecossistema.

## Padronização Visual & Marca
- **Marca**: O projeto chama-se oficialmente **MoodSpace**. Evite referências a "MOOD Project" ou "Project Mood".
- **Ícones**: NUNCA usar emojis para ícones de interface. Use sempre `lucide-react`.
- **Estética**: Design "Studio" premium, minimalista, com alto uso de Glassmorphism (backdrop-blur) e tipografia fluida.

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

### Infraestrutura & Deploy
- **Docker Standalone**: Configuração otimizada para baixo consumo de recursos em instâncias AWS EC2.
- **CI/CD (GitHub Actions)**: Deploy automático via SSH. O pipeline realiza `git pull`, rebuild de containers e migrações Prisma (`db push`) automaticamente ao dar push na branch `main`.
- **Reverse Proxy**: Recomendado uso de Nginx no host da EC2 para SSL (Certbot) e encaminhamento para a porta 3000.

---
*Documentação atualizada por Antigravity em 18/02/2026. Identidade MoodSpace consolidada.*

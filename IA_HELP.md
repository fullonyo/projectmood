# Ajuda da IA - MOOD Project

Este arquivo centraliza a documentação de funcionalidades e componentes para facilitar o contexto da IA.

## Telas Analisadas

### Tela Principal (Landing Page)
- **Caminho**: `src/app/page.tsx`
- **Descrição**: Página de entrada do projeto.
- **Estilo**: Minimalista, alto contraste, uso extensivo de `zinc` e `black`.
- **Componentes**: Botões Shadcn/UI, Link do Next.js.
- **Destaque**: Layout responsivo com cards rotacionados e animações de pulse.

### Auth & Middleware
- **Autenticação**: Provedor de `credentials` configurado em `src/auth.ts`.
- **Middleware (`src/middleware.ts`)**:
  - Protege rotas de `/dashboard`.
  - Redireciona usuários logados das rotas de `/auth` e da raiz `/` diretamente para `/dashboard`.
  - Garante que a Landing Page só seja vista por usuários não autenticados.

---
*Documentação atualizada por Antigravity em 18/02/2026.*

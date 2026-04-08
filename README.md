# Oficina 4.1 — Sistema de Gestão para Oficina Mecânica

Aplicação web PWA (Progressive Web App) para gestão de uma oficina mecânica. Funciona no navegador com dados armazenados localmente (localStorage), sem necessidade de backend ou banco de dados.

## Funcionalidades

- **Dashboard** — visão geral com estatísticas de clientes, veículos e notas
- **Clientes e Veículos** — cadastro completo com associação entre cliente e veículos
- **Notas de Serviço** — criação, edição, visualização e exclusão, com geração de PDF
- **Orçamentos** — criação e gerenciamento com status (pendente, aprovado, recusado)
- **Histórico** — listagem completa de notas com filtros
- **Geração de PDF** — exporta nota de serviço e orçamento em PDF formatado com logo

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- shadcn/ui (componentes: Button, Badge, Input, Label, Dialog, Select, Textarea, Alert Dialog)
- jsPDF (geração de PDF)
- Sonner (notificações toast)
- PWA com vite-plugin-pwa

## Como rodar

```bash
# Instalar dependências
pnpm install
# ou: npm install

# Desenvolvimento
pnpm dev
# ou: npm run dev

# Build para produção
pnpm build
# ou: npm run build
```

A aplicação ficará disponível em `http://localhost:5173`.

## Estrutura

```
src/
  app/
    components/       # Telas e componentes UI
      ui/             # Componentes shadcn/ui
    context/          # DataContext (estado global via localStorage)
    types.ts          # Interfaces TypeScript
    utils/            # Geração de PDF (notas e orçamentos)
  assets/             # Logo da oficina
  styles/             # CSS global
  main.tsx
```

## Dados

Todos os dados são persistidos no `localStorage` do navegador. Não há servidor, API ou banco de dados.

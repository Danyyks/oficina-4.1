# Oficina 4.1 — Sistema de Gestão para Oficina Mecânica

Aplicação web PWA (Progressive Web App) para gestão de uma oficina mecânica. Os dados são sincronizados em tempo real com o Firebase Firestore, permitindo que o sistema seja usado em mais de um dispositivo com as informações sempre atualizadas.

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
- Firebase Firestore (banco de dados e sincronização em tempo real)
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
    context/          # DataContext (estado global, sincronizado com o Firestore)
    services/         # Funções de leitura e escrita no Firestore
    types.ts          # Interfaces TypeScript
    utils/            # Geração de PDF (notas e orçamentos)
  lib/                # Configuração do Firebase
  assets/             # Logo da oficina
  styles/             # CSS global
  main.tsx
```

## Dados

Os dados de clientes, veículos, notas e orçamentos são armazenados no Firebase Firestore e sincronizados em tempo real entre as telas. O acesso ao banco é feito por configuração própria do projeto, mantida fora do repositório.

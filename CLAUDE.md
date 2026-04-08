# CLAUDE.md — Diretrizes de Desenvolvimento

## Visão geral do projeto

Sistema de gestão para oficina mecânica (PWA). Dados persistidos em `localStorage`, sem backend. Desenvolvido com React + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui.

## Arquitetura

- **Navegação:** feita manualmente via `useState` no `App.tsx` (sem React Router). `currentPage` é uma string que determina qual componente renderizar.
- **Estado global:** `DataContext` em `src/app/context/DataContext.tsx` — gerencia clientes, veículos, notas e orçamentos, com persistência automática no localStorage via `useEffect`.
- **Tipos:** todos os tipos de dados em `src/app/types.ts`.

## Componentes principais

| Arquivo | Descrição |
|---|---|
| `App.tsx` | Roteamento e layout principal |
| `Dashboard.tsx` | Tela inicial com stats e notas recentes |
| `Clientes.tsx` | CRUD de clientes e veículos |
| `NovaNota.tsx` | Criação e edição de notas de serviço |
| `NotaView.tsx` | Visualização de nota com opções de PDF e exclusão |
| `NovoOrcamento.tsx` | Criação e edição de orçamentos |
| `OrcamentoView.tsx` | Visualização de orçamento |
| `Historico.tsx` | Listagem de notas com filtros |
| `Footer.tsx` | Rodapé fixo |

## Componentes UI (shadcn)

Apenas os seguintes componentes estão em uso — não adicionar outros sem necessidade:
`button`, `badge`, `input`, `label`, `dialog`, `select`, `textarea`, `alert-dialog`, `sonner`

## Geração de PDF

- `src/app/utils/gerarPDF.ts` — PDF de nota de serviço
- `src/app/utils/gerarOrcamentoPDF.ts` — PDF de orçamento
- Usa `jsPDF` diretamente. O logo é carregado do asset em `src/assets/`.

## Padrões de código

- Componentes funcionais com TypeScript estrito
- Tailwind CSS para estilo — sem CSS customizado (exceto `src/styles/index.css`)
- IDs gerados com `crypto.randomUUID()`
- Datas armazenadas como string ISO (`new Date().toISOString()`)
- Sem testes automatizados no momento

## O que evitar

- Não usar React Router (navegação é manual via string)
- Não adicionar backend/API (projeto é 100% client-side)
- Não criar novos componentes UI shadcn sem verificar se já existe um que atenda
- Não usar `any` no TypeScript

# Finance David Dashboard

Aplicacao web completa para controle financeiro pessoal/empresarial, desenvolvida com React, TypeScript e Vite. O layout segue a referencia da dashboard fornecida, com menu lateral configuravel, graficos interativos, formularios de lancamentos, calendario integrado e exportacao de relatorios em PDF.

## Principais recursos.

- **Autenticacao** com Supabase (login, registro e persistencia de sessao).
- **Temas** personalizaveis (Aurora, Dark, Nude, Sunset, Ocean, Neon-Cyan, Obsidian, Midnight e Studio) com opcoes de ocultar itens do menu e definir o comportamento da sidebar.
- **Dashboard** com metricas em tempo real, graficos Recharts alimentados pelo Supabase e cards resumindo entradas, saidas, saldo e contas pendentes.
- **Entradas / Saidas**: formularios validados (React Hook Form + Zod), integracao com Supabase e listagem dos ultimos lancamentos.
- **Contas**: cadastro, controle de status, integracao com calendario e opcao de quick add.
- **Calendario** (FullCalendar) sincronizado com as contas registradas; clique para alternar status.
- **Relatorios** com filtros semanal/mensal, agregacoes por categoria e exportacao em PDF (jsPDF + autotable).
- **Configuracoes**: troca de tema, comportamento do menu e visibilidade de secoes (persistidos via Zustand).

## Requisitos

- Node.js 20+
- Conta gratuita no [Supabase](https://supabase.com/)
- Opcional: conta no [Vercel](https://vercel.com/) para deploy do frontend

## Instalação e execução

```bash
# instalar dependencias
npm install

# copiar variaveis de ambiente
cp .env.example .env.local

# preencher .env.local com as chaves do Supabase
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# iniciar modo desenvolvimento
npm run dev
```

O servidor local fica disponivel em `http://localhost:5173`.

## Configurando o Supabase

1. Crie um novo projeto no painel do Supabase.
2. Em **Project Settings → API**, copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
3. Em **SQL Editor**, execute o conteudo de [`supabase/schema.sql`](supabase/schema.sql) para criar tabelas, indices e politicas RLS.
4. Habilite o **Email Auth** (Authentication → Providers → Email) para permitir login e registro.

Depois de atualizar as variaveis, reinicie `npm run dev`.

## Estrutura

- `src/components` – componentes reutilizaveis (layout, formularios).
- `src/pages` – telas (dashboard, entradas, saidas, contas, calendario, relatorios, configuracoes, auth).
- `src/hooks` – hooks de integracao com Supabase usando React Query.
- `src/services` – camada de servico centralizando chamadas ao Supabase.
- `src/store` – Zustand store para preferencias de interface.
- `src/providers` – provedores (tema, auth).
- `src/utils` – utilitarios (formatadores).

## Scripts

```bash
npm run dev       # modo desenvolvimento
npm run build     # build de producao (gera dist/)
npm run preview   # preview do build
npm run lint      # lint
```

## Deploy no Vercel

1. Garanta que `.env.example` contenha apenas valores placeholder e mantenha `.env.local` fora do controle de versao.
2. No painel do Vercel clique em **Add New → Project**, selecione o repositorio e aceite a deteccao automatica de framework (Vite).
3. Em **Environment Variables**, cadastre:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Utilize o comando de build padrao `npm run build`; o adaptador `@vercel/static-build` (definido em `vercel.json`) publica o conteudo do diretorio `dist`.
5. O mesmo `vercel.json` inclui um fallback para `index.html`, garantindo que todas as rotas do SPA sejam servidas corretamente.
6. Conclua o deploy. O Supabase permanece responsavel pelo banco e autenticacao.

## Proximos passos (opcionais)

- Criar testes automatizados para os hooks/servicos mais criticos.
- Implementar upload da logo definitiva e personalizacao do nome (hoje usa placeholder).
- Habilitar notificacoes (e-mail/push) utilizando Edge Functions do Supabase.
- Adicionar resumo por metas/centros de custo conforme a necessidade do negocio.

---

Projeto desenvolvido sob demanda para o painel **Finance David**. Para novas funcionalidades ou duvidas, entre em contato!
# Dr.-David-Finance
# Dr.-David-Finance

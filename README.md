# RACE DAY SPEED & GLORY

Loja virtual de camisetas, jaquetas, equipamentos e colecionáveis do universo motorsport. Vitrine premium com intro 3D, catálogo real, carrinho persistente, checkout com registro de pedido no banco e atendimento pelo WhatsApp, além de painel administrativo completo.

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **Tailwind CSS 4** para o design system
- **PostgreSQL** (Supabase em produção, PostgreSQL embutido no desenvolvimento)
- **Supabase Storage** para upload de imagens (fallback local em `public/uploads` apenas em desenvolvimento)
- **Motion / GSAP / Three.js + React Three Fiber** para animações e intro cinematográfica
- **Zod** para validação de dados no servidor
- **Playwright** para testes E2E reais (desktop e mobile)

## Requisitos

- Node.js 20+
- npm

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente:

   ```bash
   cp .env.example .env.local
   ```

   Para o ambiente local, ajuste `DATABASE_URL` para o banco embutido:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/raceday"
   ADMIN_EMAIL="admin@racedayspeed.com"
   ADMIN_PASSWORD="escolha-uma-senha"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

3. Suba o PostgreSQL local (terminal separado), aplique as migrações e cadastre o catálogo:

   ```bash
   npm run db:dev        # sobe o PostgreSQL embutido na porta 55432 e aplica migrações + seed
   ```

   Ou, com um PostgreSQL já disponível:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Inicie o site:

   ```bash
   npm run dev
   ```

   - Loja: <http://localhost:3000>
   - Painel: <http://localhost:3000/admin>

O administrador é criado pelo seed usando `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Para redefinir a senha do administrador em um banco já populado:

```bash
npm run db:seed -- --reset-admin
```

> `npm run db:seed -- --reset` apaga o catálogo e recria os 25 produtos do PDF. Use com cuidado: pedidos existentes são preservados, mas preços/estoques cadastrados manualmente no catálogo são perdidos.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Conexão PostgreSQL. Em produção use a URI do pooler do Supabase. |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL pública do site (SEO, sitemap, Open Graph e links de pedido). |
| `ADMIN_EMAIL` | Seed | E-mail do administrador inicial. |
| `ADMIN_PASSWORD` | Seed | Senha do administrador inicial. |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase. Valor público. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave publicável do Supabase. Valor público, seguro no browser. |
| `SUPABASE_URL` | Não | URL do projeto para uso no servidor. Usa `NEXT_PUBLIC_SUPABASE_URL` como fallback. |
| `SUPABASE_PUBLISHABLE_KEY` | Não | Chave publicável para uso no servidor. Usa `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como fallback. |
| `SUPABASE_SECRET_KEY` | Produção | Secret key (`sb_secret_...`) usada apenas no servidor para upload no Storage. **Nunca exponha no frontend.** |
| `SUPABASE_SERVICE_ROLE_KEY` | Não | Alias legado aceito pelo código (service role key do projeto). |
| `SUPABASE_STORAGE_BUCKET` | Não | Bucket de imagens. Padrão: `product-images`. |

`DATABASE_URL`, `ADMIN_PASSWORD`, `SUPABASE_SECRET_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são lidas apenas no servidor. As variáveis `NEXT_PUBLIC_*` são públicas por definição e contêm apenas a chave publicável.

## Conectar ao seu projeto Supabase

O projeto já está preparado para o Supabase: os helpers SSR estão em `utils/supabase/` e o proxy em `proxy.ts`. A loja continua usando PostgreSQL via `pg` no servidor (transações de pedido e estoque) e o painel mantém a autenticação própria.

1. **Banco de dados** — no painel do Supabase, abra **Connect → Transaction pooler** e copie a URI com a senha do banco. Coloque em `DATABASE_URL` (somente no servidor):

   ```env
   DATABASE_URL="postgresql://postgres.SEU_PROJETO:SUA_SENHA@aws-0-SUA_REGIAO.pooler.supabase.com:6543/postgres?sslmode=require"
   ```

   A chave publicável **não** acessa o PostgreSQL e **não** cria tabelas. É necessário usar a URI de conexão (ou o SQL Editor) com a senha do banco.

2. **Criar o schema e o catálogo**:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   As migrações são idempotentes e controladas por `schema_migrations`. Em um banco vazio, elas criam as tabelas de produtos, tamanhos, pedidos, itens, categorias, configurações, administradores e sessões.

3. **Storage** — crie um bucket **público** chamado `product-images` em **Storage** (ou defina outro nome em `SUPABASE_STORAGE_BUCKET`). O upload no painel exige a secret key:

   ```env
   SUPABASE_SECRET_KEY="sb_secret_..."
   ```

   A chave publicável (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) é exposta ao browser e serve para Auth/PostgREST com RLS; ela não autoriza upload de arquivos. Sem a secret key, o upload funciona apenas localmente em `public/uploads`.

4. **Deploy** — configure as mesmas variáveis no provedor, com `NEXT_PUBLIC_SITE_URL` apontando para o domínio final e `DATABASE_URL` do pooler.

O `next.config.ts` já libera imagens públicas de `*.supabase.co`.

### Sobre autenticação

A autenticação do painel é própria (scrypt + sessão no banco + cookie `HttpOnly`) e não depende do Supabase Auth. Os helpers `utils/supabase/client.ts` e `utils/supabase/server.ts` ficam prontos para uso futuro; o `proxy.ts` só atua quando existe cookie de sessão do Supabase Auth, portanto não adiciona latência para visitantes da loja.

## Deploy

- **Build**: `npm run build` e **start**: `npm start`.
- Em Vercel/Netlify, configure as variáveis acima no painel do projeto.
- Execute migrações e seed uma vez contra o banco de produção (não são executados automaticamente no build).
- O diretório `public/uploads` serve apenas para desenvolvimento. Em produção, configure o Supabase Storage.

## Como funciona o pedido

1. O cliente monta o carrinho (persistido em `localStorage`).
2. No checkout informa dados pessoais e endereço completo; o CEP pode ser preenchido automaticamente via ViaCEP, com preenchimento manual como alternativa.
3. O servidor **recalcula preços e estoque**, valida tudo com Zod e grava o pedido no banco antes de qualquer redirecionamento.
4. O pedido recebe um código único no formato `RD-000001` e um token privado de acesso.
5. O cliente é levado ao WhatsApp com a mensagem pronta; o pedido fica em **Aguardando envio pelo WhatsApp** até o clique no link, e depois em **Aguardando confirmação**.
6. A confirmação do pedido é sempre manual, feita no painel. Nenhum pedido é marcado como pago automaticamente.

### Status do pedido

`Aguardando envio pelo WhatsApp` → `Aguardando confirmação` → `Pedido confirmado` → `Em preparação` → `Enviado` → `Concluído` (ou `Cancelado`).

O estoque é baixado quando o pedido passa para **Pedido confirmado** e devolvido em caso de cancelamento.

### Preço sob consulta

Produtos sem preço cadastrado exibem **Preço sob consulta** e não podem ser comprados. O administrador pode cadastrar o valor em **Painel → Produtos → editar produto**. Enquanto o preço não existir, o checkout é bloqueado no servidor — a loja nunca inventa valores.

Tamanhos com estoque `0` aparecem como esgotados e são bloqueados. Tamanhos sem controle de estoque (`null`) ficam disponíveis "sob consulta", sem limite inventado.

## Segurança

- Senhas de administrador com hash `scrypt`.
- Sessões administrativas no banco, com token aleatório, hash SHA-256 e cookie `HttpOnly`.
- Proteção contra tentativas repetidas de login por IP.
- Rotas do painel validam a sessão no servidor.
- Validação e recálculo de preço/estoque no servidor — o cliente não define valores.
- Upload de imagens restrito a JPG/PNG/WEBP/AVIF até 8 MB.
- Nenhuma chave privada no bundle do navegador.

## Testes E2E

Os testes usam o banco real configurado em `.env.local`, criam pedidos de teste e limpam os dados ao final.

```bash
npx playwright install chromium   # primeira execução
npm run test:e2e                  # desktop + mobile
npx playwright test --project=mobile
npx playwright test --project=desktop
```

O Playwright sobe o servidor de desenvolvimento automaticamente (`npm run dev`) caso não haja um em `http://localhost:3000`.

Cobertura principal:

- identidade visual, 25 produtos reais, busca e ausência de overflow horizontal;
- produto sob consulta bloqueado com alternativa de WhatsApp;
- tamanho esgotado bloqueado, carrinho e persistência após reload;
- checkout inválido, CEP, registro no banco, WhatsApp e transição de status;
- autenticação do painel, confirmação de pedido, baixa de estoque e logout mobile/desktop.

## Estrutura

```
app/                 rotas da loja, painel e APIs (Route Handlers)
components/          UI da loja, carrinho, checkout e painel
lib/                 banco, pedidos, autenticação, validação, storage, settings
db/migrations/       migrações SQL
scripts/             banco local, migrações, seed e geração de imagens
public/products/     imagens reais extraídas do catálogo
tests/e2e/           testes Playwright desktop e mobile
```

## Observação sobre o catálogo

O catálogo foi cadastrado com os 25 produtos reais do PDF e os preços informados no briefing. Dois pôsteres (itens 21 e 22) aparecem com **R$ 640,00** impresso na arte do catálogo, porém foram mantidos como **Preço sob consulta** conforme a instrução de não inventar valores. Basta o administrador cadastrar o preço real para liberar a compra.

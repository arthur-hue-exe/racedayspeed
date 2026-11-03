import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { categories, products } from "./catalog.mjs";
import { createClient } from "./lib.mjs";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

const privacyPolicy = `POLÍTICA DE PRIVACIDADE — RACE DAY SPEED & GLORY

Esta política explica como a Race Day Speed & Glory trata os dados pessoais coletados neste site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

1. DADOS COLETADOS
Coletamos apenas os dados necessários para registrar e atender o seu pedido: nome completo, telefone/WhatsApp, e-mail e endereço de entrega (CEP, estado, cidade, bairro, rua, número, complemento e referência).

2. FINALIDADE
Os dados são utilizados para registrar o pedido, confirmar disponibilidade e valores, combinar pagamento e entrega pelo WhatsApp e organizar o envio. Não utilizamos seus dados para finalidades diferentes destas sem informar você.

3. COMPARTILHAMENTO
Seus dados são compartilhados somente com quem é necessário para concluir a compra: a conversa de atendimento no WhatsApp e, quando houver envio, a transportadora responsável pela entrega.

4. PAGAMENTOS
Este site não coleta nem armazena números de cartão, códigos de segurança ou senhas. As condições e a forma de pagamento são combinadas diretamente no atendimento.

5. COOKIES E ARMAZENAMENTO LOCAL
Utilizamos armazenamento local do navegador apenas para manter o seu carrinho entre visitas. Nenhum dado de pagamento é guardado no navegador.

6. RETENÇÃO
Os registros de pedidos são mantidos pelo período necessário ao atendimento, à entrega e ao cumprimento de obrigações legais. Depois disso, são eliminados ou anonimizados.

7. SEUS DIREITOS
Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade ou exclusão dos seus dados, além de revogar consentimentos. Para exercer qualquer direito, fale com a gente pelo WhatsApp (61) 98281-7033 ou pelo Instagram @racedayspeed.

8. SEGURANÇA
O acesso ao painel administrativo é restrito e protegido por autenticação. As informações de pedidos ficam registradas em banco de dados com acesso controlado.

9. CONTATO DO CONTROLADOR
Race Day Speed & Glory — atendimento pelo WhatsApp (61) 98281-7033 e Instagram @racedayspeed.

Esta política pode ser atualizada para refletir mudanças no atendimento ou na legislação. A versão vigente é sempre a publicada nesta página.`;

const termsPolicy = `TERMOS DE USO — RACE DAY SPEED & GLORY

Ao navegar e comprar neste site, você concorda com os termos abaixo.

1. SOBRE A LOJA
A Race Day Speed & Glory comercializa camisetas, jaquetas, equipamentos e itens colecionáveis relacionados ao universo motorsport. O catálogo apresenta produtos e informações conforme disponibilidade.

2. PEDIDOS
O pedido é montado neste site e enviado para o atendimento pelo WhatsApp (61) 98281-7033. O envio da mensagem não confirma automaticamente o pedido: a confirmação depende da checagem de disponibilidade, do valor final, do frete e das condições de pagamento no atendimento.

3. PREÇOS
Os preços exibidos são os valores praticados no catálogo no momento da consulta. Produtos marcados como "Preço sob consulta" não possuem valor definido e não podem ser finalizados pelo site; o valor será informado no atendimento. Frete e prazo também são confirmados no atendimento quando não estiverem calculados.

4. DISPONIBILIDADE E ESTOQUE
A disponibilidade de tamanhos e quantidades é confirmada no atendimento. O site impede a compra de variações marcadas como esgotadas, mas a confirmação final é feita pela equipe Race Day.

5. PAGAMENTO
As formas de pagamento aceitas são informadas no atendimento. Este site não processa pagamentos online e não solicita dados de cartão.

6. IMAGENS E CONTEÚDO
As imagens são do catálogo oficial da marca e podem apresentar detalhes de composição, medidas e condições comerciais. Pequenas diferenças de cor podem ocorrer conforme a tela do dispositivo.

7. USO DO SITE
É proibido utilizar o site para fins ilícitos, tentar acessar áreas restritas sem autorização ou interferir no funcionamento da loja.

8. PROPRIEDADE INTELECTUAL
Marcas, nomes, fotos e demais conteúdos pertencem aos seus titulares. A reprodução sem autorização não é permitida.

9. CONTATO
Dúvidas sobre estes termos: WhatsApp (61) 98281-7033 ou Instagram @racedayspeed.`;

const returnsPolicy = `POLÍTICA DE TROCA E DEVOLUÇÃO — RACE DAY SPEED & GLORY

1. DIREITO DE ARREPENDIMENTO
Nas compras à distância, o Código de Defesa do Consumidor garante o direito de desistir da compra em até 7 (sete) dias corridos a partir do recebimento do produto. Para isso, fale com a gente pelo WhatsApp (61) 98281-7033 informando o número do pedido.

2. CONDIÇÕES DO PRODUTO
Para troca ou devolução, o produto deve estar sem uso, com etiquetas e embalagem preservadas, acompanhado de todos os acessórios recebidos. Produtos com sinais de uso podem não ser aceitos.

3. TAMANHO OU MODELO
Se o tamanho ou o modelo não servir, entre em contato pelo WhatsApp para verificar a disponibilidade de troca. A logística e o custo do envio serão combinados no atendimento, conforme o caso.

4. PRODUTO COM DEFEITO
Caso o produto chegue com defeito ou diferente do pedido, envie fotos e o número do pedido pelo WhatsApp em até 7 dias do recebimento. Vamos analisar e combinar a troca, o reparo ou a devolução, conforme o Código de Defesa do Consumidor.

5. PRAZOS E REEMBOLSO
O prazo de análise e de estorno depende da forma de pagamento e será informado no atendimento. O reembolso é realizado pelos mesmos meios utilizados na compra, quando possível.

6. COMO SOLICITAR
Envie uma mensagem para (61) 98281-7033 com: número do pedido, nome completo e o motivo da solicitação. Guarde o comprovante de envio até a conclusão do atendimento.`;

export const defaultSettings = {
  store: {
    whatsappNumber: "5561982817033",
    whatsappDisplay: "(61) 98281-7033",
    instagram: "racedayspeed",
    email: "",
  },
  shipping: {
    mode: "pending",
    flatCents: null,
    freeAboveCents: null,
    note: "Frete e prazo são confirmados no atendimento pelo WhatsApp.",
  },
  payment: {
    methods: "Pix, cartão de crédito e dinheiro — condições confirmadas no atendimento.",
  },
  company: {
    legalName: "Race Day Speed & Glory",
    cnpj: "",
    address: "",
    hours: "Atendimento pelo WhatsApp (61) 98281-7033.",
  },
  policies: {
    privacy: privacyPolicy,
    terms: termsPolicy,
    returns: returnsPolicy,
  },
  media: {
    heroVideoUrl: "",
    heroVideoPoster: "",
  },
  announcement: {
    enabled: true,
    text: "Frete e disponibilidade confirmados no atendimento",
  },
};

export async function seed({ reset = false, resetAdmin = false } = {}) {
  const client = createClient();
  await client.connect();
  try {
    await client.query("begin");

    if (reset) {
      await client.query("delete from products");
      console.log("[seed] catálogo limpo para recarga completa.");
    }

    const categoryIds = new Map();
    for (const category of categories) {
      await client.query(
        `insert into categories (slug, name, description, position)
         values ($1, $2, $3, $4)
         on conflict (slug) do nothing`,
        [category.slug, category.name, category.description, category.position],
      );
      const { rows } = await client.query("select id from categories where slug = $1", [
        category.slug,
      ]);
      categoryIds.set(category.slug, rows[0].id);
    }

    let inserted = 0;
    for (const product of products) {
      const result = await client.query(
        `insert into products
          (slug, name, category_id, short_description, description, price_cents,
           is_new, is_featured, has_sizes, stock, sku, position)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, null, $10, $11)
         on conflict (slug) do nothing
         returning id`,
        [
          product.slug,
          product.name,
          categoryIds.get(product.category),
          product.shortDescription,
          product.description,
          product.priceCents,
          Boolean(product.isNew),
          Boolean(product.featured),
          Array.isArray(product.sizes) && product.sizes.length > 0,
          product.sku,
          product.position,
        ],
      );

      if (result.rowCount === 0) continue;
      inserted += 1;
      const productId = result.rows[0].id;

      if (Array.isArray(product.sizes)) {
        for (const [index, label] of product.sizes.entries()) {
          await client.query(
            `insert into product_sizes (product_id, label, stock, position)
             values ($1, $2, null, $3)`,
            [productId, label, index],
          );
        }
      }

      for (const image of product.images) {
        await client.query(
          `insert into product_images (product_id, url, alt, position)
           values ($1, $2, $3, $4)`,
          [productId, image.url, image.alt, image.position],
        );
      }
    }

    for (const [key, value] of Object.entries(defaultSettings)) {
      await client.query(
        `insert into settings (key, value) values ($1, $2)
         on conflict (key) do nothing`,
        [key, JSON.stringify(value)],
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const existing = await client.query("select id from admin_users limit 1");
      if (existing.rowCount === 0 || resetAdmin) {
        await client.query(
          `insert into admin_users (email, name, password_hash)
           values ($1, $2, $3)
           on conflict (email) do update set password_hash = excluded.password_hash`,
          [adminEmail, "Race Day Admin", hashPassword(adminPassword)],
        );
        console.log(`[seed] administrador preparado: ${adminEmail}`);
      }
    }

    await client.query("commit");
    console.log(
      `[seed] ${inserted} produto(s) novo(s) de ${products.length} do catálogo; configurações padrão garantidas.`,
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seed({
    reset: process.argv.includes("--reset"),
    resetAdmin: process.argv.includes("--reset-admin"),
  }).catch((error) => {
    console.error("[seed] falhou:", error);
    process.exit(1);
  });
}

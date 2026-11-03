// Fonte: Catalogo_Race_Day_Speed.pdf (páginas 3 a 27).
// Preços em centavos. null = "sob consulta" — nunca inventar valores.
// Ordem dos arquivos: p01..p25 corresponde à ordem das páginas do catálogo.

const shirtSizes = ["PP", "P", "M", "G", "GG", "XGG"];

export const categories = [
  {
    slug: "camisetas",
    name: "Camisetas",
    description:
      "Camisetas temáticas inspiradas em equipes, pilotos e marcas do motorsport.",
    position: 1,
  },
  {
    slug: "jaquetas-e-equipamentos",
    name: "Jaquetas e equipamentos",
    description: "Jaquetas e equipamentos selecionados para viver a velocidade.",
    position: 2,
  },
  {
    slug: "colecionaveis",
    name: "Colecionáveis",
    description: "Miniaturas e peças de coleção para quem vive a cultura motorsport.",
    position: 3,
  },
];

const shirt = (name, theme, color) => ({
  name,
  shortDescription: `${color} com estampas ${theme} na frente e nas costas.`,
  description: `Camiseta ${color.toLowerCase()} com estampas ${theme} na frente e nas costas. Acabamento de alta qualidade, do catálogo oficial Race Day.`,
  sizes: shirtSizes,
});

export const products = [
  {
    ...shirt("VR46 Lunna — Edição especial", "Petronas 46 e arte Lunna", "Preta"),
    slug: "vr46-lunna-edicao-especial",
    category: "camisetas",
    priceCents: null,
    featured: true,
    sku: "RD-001",
  },
  {
    ...shirt("Gulf Racing Team", "Gulf Racing", "Azul-marinho"),
    slug: "gulf-racing-team",
    category: "camisetas",
    priceCents: null,
    sku: "RD-002",
  },
  {
    ...shirt("Diogo 11", "11 e Red Bull", "Vermelha"),
    slug: "diogo-11",
    category: "camisetas",
    priceCents: null,
    sku: "RD-003",
  },
  {
    ...shirt(
      "Red Bull Grand Prix of the Americas",
      "Red Bull Grand Prix of the Americas",
      "Azul-marinho",
    ),
    slug: "red-bull-grand-prix-of-the-americas",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-004",
  },
  {
    ...shirt("Work in Silence — Azul", "Work in Silence", "Azul-clara"),
    slug: "work-in-silence-azul",
    category: "camisetas",
    priceCents: null,
    sku: "RD-005",
  },
  {
    ...shirt("Work in Silence — Preta", "Work in Silence", "Preta"),
    slug: "work-in-silence-preta",
    category: "camisetas",
    priceCents: null,
    sku: "RD-006",
  },
  {
    ...shirt("VR46 Estilo Racing", "46 e sol nas costas", "Azul-marinho"),
    slug: "vr46-estilo-racing",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-007",
  },
  {
    ...shirt("Valentino Rossi 46 — Cartoon", "arte cartoon do 46", "Preta"),
    slug: "valentino-rossi-46-cartoon",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-008",
  },
  {
    ...shirt("Kawasaki Ninja", "Kawasaki Ninja", "Preta"),
    slug: "kawasaki-ninja",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-009",
  },
  {
    ...shirt("244 — Coelho Racing", "244 e Coelho Racing", "Preta"),
    slug: "244-coelho-racing",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-010",
  },
  {
    ...shirt("Valentino Rossi 46 — Cartoon Azul", "arte cartoon do 46", "Azul-marinho"),
    slug: "valentino-rossi-46-cartoon-azul",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-011",
  },
  {
    ...shirt("Wheeling Is Not a Crime", "Wheeling Is Not a Crime", "Preta"),
    slug: "wheeling-is-not-a-crime",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-012",
  },
  {
    ...shirt(
      "BMW — Deutsche Bunny Motorrad",
      "BMW Motorrad e Deutsche Bunny",
      "Preta",
    ),
    slug: "bmw-deutsche-bunny-motorrad",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-013",
  },
  {
    ...shirt("Red Bull Grand Prix — Preta", "Red Bull Grand Prix", "Preta"),
    slug: "red-bull-grand-prix-preta",
    category: "camisetas",
    priceCents: 10000,
    sku: "RD-014",
  },
  {
    ...shirt("Ducati 93 — Vermelha", "Ducati 93 na frente e etiqueta Racing Light", "Vermelha"),
    slug: "ducati-93-vermelha",
    category: "camisetas",
    priceCents: null,
    isNew: true,
    sku: "RD-015",
  },
  {
    ...shirt("BMW GS Adventure", "BMW GS Adventure", "Azul-marinho"),
    slug: "bmw-gs-adventure",
    category: "camisetas",
    priceCents: null,
    sku: "RD-016",
  },
  {
    ...shirt("Gulf Heuer — Azul", "Gulf e Heuer", "Azul"),
    slug: "gulf-heuer-azul",
    category: "camisetas",
    priceCents: null,
    sku: "RD-017",
  },
  {
    ...shirt("Speed Racing Technology", "Speed Racing Technology", "Preta"),
    slug: "speed-racing-technology",
    category: "camisetas",
    priceCents: null,
    sku: "RD-018",
  },
  {
    ...shirt("Team Suzuki", "Team Suzuki", "Azul-marinho"),
    slug: "team-suzuki",
    category: "camisetas",
    priceCents: null,
    sku: "RD-019",
  },
  {
    ...shirt("Motorsport 11 Diogo", "11 e Red Bull", "Preta"),
    slug: "motorsport-11-diogo",
    category: "camisetas",
    priceCents: null,
    sku: "RD-020",
  },
  {
    name: "Jaqueta Alpinestars — Cinza",
    slug: "jaqueta-alpinestars-cinza",
    category: "jaquetas-e-equipamentos",
    shortDescription:
      "Jaqueta Alpinestars cinza com capuz ajustável e forro interno acolchoado.",
    description:
      "Jaqueta Alpinestars cinza com capuz ajustável, forro interno acolchoado e logos em destaque. Composição: 100% poliéster (tecido externo, interno e enchimento).",
    sizes: ["2XL"],
    priceCents: null,
    isNew: true,
    sku: "RD-021",
  },
  {
    name: "Jaqueta Alpinestars — Preta",
    slug: "jaqueta-alpinestars-preta",
    category: "jaquetas-e-equipamentos",
    shortDescription:
      "Jaqueta Alpinestars preta com capuz ajustável e forro interno acolchoado.",
    description:
      "Jaqueta Alpinestars preta com capuz ajustável, forro interno acolchoado e logos em destaque. Composição: 100% poliéster (tecido externo, interno e enchimento).",
    sizes: ["2XL"],
    priceCents: null,
    isNew: true,
    featured: true,
    sku: "RD-022",
  },
  {
    name: "Datsun 510 Kaido House Mini GT",
    slug: "datsun-510-kaido-house-mini-gt",
    category: "colecionaveis",
    shortDescription:
      "Datsun 510 Pro Street Anniversary Edition, escala 1:64, Kaido House Mini GT.",
    description:
      "Datsun 510 Pro Street Anniversary Edition da Kaido House Mini GT, escala 1:64. Miniatura de coleção com detalhes exclusivos e embalagem original.",
    sizes: null,
    priceCents: 25000,
    isNew: true,
    featured: true,
    sku: "RD-023",
  },
  {
    name: "Volkswagen T1 Kaido House — Kaido Radvan V1",
    slug: "volkswagen-t1-kaido-house-kaido-radvan-v1",
    category: "colecionaveis",
    shortDescription:
      "Volkswagen T1 Kaido Radvan V1, escala 1:64, edição exclusiva Kaido House.",
    description:
      "Volkswagen T1 Kaido Radvan V1 da Kaido House, escala 1:64. Miniatura de coleção em edição exclusiva, com embalagem original.",
    sizes: null,
    priceCents: 27000,
    isNew: true,
    sku: "RD-024",
  },
  {
    name: "Macacão X11 — Tamanho G",
    slug: "macacao-x11-tamanho-g",
    category: "jaquetas-e-equipamentos",
    shortDescription: "Macacão X11 original, tamanho G, com zíper frontal.",
    description:
      "Macacão X11 original, tamanho G, com zíper frontal e detalhes em destaque no peito e nas costas.",
    sizes: ["G"],
    priceCents: 160000,
    isNew: true,
    sku: "RD-025",
  },
].map((product, index) => {
  const file = `p${String(index + 1).padStart(2, "0")}`;
  return {
    ...product,
    position: index + 1,
    images: [
      {
        url: `/products/${file}-card.webp`,
        alt: `${product.name} — foto oficial do catálogo Race Day`,
        position: 0,
      },
      {
        url: `/products/${file}-full.webp`,
        alt: `${product.name} — detalhes do produto no catálogo Race Day`,
        position: 1,
      },
    ],
  };
});

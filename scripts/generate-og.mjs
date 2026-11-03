import sharp from "sharp";

const width = 1200;
const height = 630;

const product = await sharp("public/products/p05-full.webp")
  .resize(620, height, { fit: "cover", position: "top" })
  .modulate({ brightness: 0.98, saturation: 1.02 })
  .toBuffer();

const overlay = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#080A0D" stop-opacity="1"/>
      <stop offset="0.42" stop-color="#080A0D" stop-opacity="1"/>
      <stop offset="0.72" stop-color="#080A0D" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#080A0D" stop-opacity="0.1"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.08" cy="0.1" r="0.75">
      <stop offset="0" stop-color="#B7F000" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#B7F000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.25" cy="0.95" r="0.55">
      <stop offset="0" stop-color="#FFD500" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#FFD500" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="url(#glow2)"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#fade)"/>
  <g font-family="Arial Narrow, Arial, sans-serif">
    <text x="72" y="128" fill="#9AA3AC" font-size="20" letter-spacing="7">CATÁLOGO OFICIAL · MOTORSPORT</text>
    <text x="68" y="290" fill="#F4F6F7" font-size="126" font-weight="bold" letter-spacing="-2">RACE DAY</text>
    <text x="72" y="366" fill="#FFD500" font-size="54" font-weight="bold" font-style="italic" letter-spacing="6">SPEED &amp; GLORY</text>
    <rect x="72" y="408" width="96" height="4" fill="#B7F000"/>
    <text x="72" y="470" fill="#C8CDD2" font-size="26">Camisetas, jaquetas, equipamentos</text>
    <text x="72" y="506" fill="#C8CDD2" font-size="26">e colecionáveis do universo motorsport.</text>
    <text x="72" y="576" fill="#9AA3AC" font-size="19" letter-spacing="4">DA PISTA PARA AS RUAS</text>
  </g>
  <rect x="0" y="${height - 8}" width="${width}" height="8" fill="#FFD500"/>
  <rect x="0" y="${height - 8}" width="360" height="8" fill="#B7F000"/>
</svg>
`);

await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: { r: 8, g: 10, b: 13 },
  },
})
  .composite([
    { input: product, left: width - 620, top: 0 },
    { input: overlay, left: 0, top: 0 },
  ])
  .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
  .toFile("public/og.jpg");

console.log("[og] public/og.jpg gerado (1200x630).");

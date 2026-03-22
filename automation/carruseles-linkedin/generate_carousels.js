const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaExclamationTriangle, FaTools, FaTruckMoving, FaHardHat,
  FaHandshake, FaIndustry, FaShieldAlt, FaBolt, FaFire,
  FaGlasses, FaGlobeAmericas, FaRobot, FaClipboardCheck,
  FaChartLine, FaUserTie, FaEnvelope, FaLinkedin, FaDollarSign
} = require("react-icons/fa");

function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

const NAVY = "0a1628";
const GOLD = "c8a84b";
const BLUE = "1a3a6b";
const RED = "d42b2b";
const WHITE = "FFFFFF";
const LIGHT_NAVY = "142238";
const DARK_GOLD = "a8883b";

const SZ = 7.5; // 1080px at 144dpi ≈ 7.5 inches square
const PAD = 0.6;
const CONTENT_W = SZ - PAD * 2;

async function main() {
  const pres = new pptxgen();
  pres.defineLayout({ name: "SQUARE", width: SZ, height: SZ });
  pres.layout = "SQUARE";
  pres.author = "Grupo MICSA";
  pres.title = "MICSA LinkedIn Carousels";

  // Pre-render icons
  const icons = {
    warning: await iconToBase64Png(FaExclamationTriangle, `#${GOLD}`, 256),
    tools: await iconToBase64Png(FaTools, `#${GOLD}`, 256),
    truck: await iconToBase64Png(FaTruckMoving, `#${GOLD}`, 256),
    hardhat: await iconToBase64Png(FaHardHat, `#${GOLD}`, 256),
    handshake: await iconToBase64Png(FaHandshake, `#${GOLD}`, 256),
    industry: await iconToBase64Png(FaIndustry, `#${GOLD}`, 256),
    shield: await iconToBase64Png(FaShieldAlt, `#${RED}`, 256),
    bolt: await iconToBase64Png(FaBolt, `#${RED}`, 256),
    fire: await iconToBase64Png(FaFire, `#${RED}`, 256),
    glasses: await iconToBase64Png(FaGlasses, `#${RED}`, 256),
    dollar: await iconToBase64Png(FaDollarSign, `#${RED}`, 256),
    globe: await iconToBase64Png(FaGlobeAmericas, `#${GOLD}`, 256),
    robot: await iconToBase64Png(FaRobot, `#${GOLD}`, 256),
    clipboard: await iconToBase64Png(FaClipboardCheck, `#${GOLD}`, 256),
    chart: await iconToBase64Png(FaChartLine, `#${GOLD}`, 256),
    user: await iconToBase64Png(FaUserTie, `#${GOLD}`, 256),
    envelope: await iconToBase64Png(FaEnvelope, `#${GOLD}`, 256),
    linkedin: await iconToBase64Png(FaLinkedin, `#${GOLD}`, 256),
    shieldGold: await iconToBase64Png(FaShieldAlt, `#${GOLD}`, 256),
    warningRed: await iconToBase64Png(FaExclamationTriangle, `#${RED}`, 256),
    dollarGold: await iconToBase64Png(FaDollarSign, `#${GOLD}`, 256),
  };

  function addFooter(slide) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: SZ - 0.55, w: SZ, h: 0.55,
      fill: { color: LIGHT_NAVY }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: SZ - 0.55, w: SZ, h: 0.04,
      fill: { color: GOLD }
    });
    slide.addText("GRUPO MICSA", {
      x: PAD, y: SZ - 0.48, w: CONTENT_W, h: 0.4,
      fontSize: 11, fontFace: "Arial", color: GOLD,
      charSpacing: 4, align: "center", margin: 0
    });
  }

  function addNumberCircle(slide, num, y) {
    slide.addShape(pres.shapes.OVAL, {
      x: PAD, y: y, w: 0.7, h: 0.7,
      fill: { color: GOLD }
    });
    slide.addText(String(num), {
      x: PAD, y: y, w: 0.7, h: 0.7,
      fontSize: 28, fontFace: "Arial Black", color: NAVY,
      align: "center", valign: "middle", bold: true, margin: 0
    });
  }

  // ========================================
  // CARRUSEL 1: 5 Señales
  // ========================================

  // C1 - Slide 1: Cover
  let s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SZ, h: 0.06, fill: { color: GOLD }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: SZ - 0.06, w: SZ, h: 0.06, fill: { color: GOLD }
  });
  s.addImage({ data: icons.warning, x: (SZ - 1) / 2, y: 1.2, w: 1, h: 1 });
  s.addText("5 Señales\nde que tu Planta\nNecesita un\nIntegrador Industrial", {
    x: PAD, y: 2.4, w: CONTENT_W, h: 3,
    fontSize: 34, fontFace: "Arial Black", color: WHITE,
    align: "center", valign: "top", bold: true, lineSpacingMultiple: 1.1, margin: 0
  });
  s.addText("¿Tu operación está en riesgo?", {
    x: PAD, y: 5.6, w: CONTENT_W, h: 0.5,
    fontSize: 16, fontFace: "Arial", color: GOLD,
    align: "center", italic: true, margin: 0
  });
  addFooter(s);

  // C1 - Slide 2: Signal 1
  s = pres.addSlide();
  s.background = { color: NAVY };
  addNumberCircle(s, 1, 0.8);
  s.addText("Tus paros no\nprogramados cuestan\nmás que el\nmantenimiento", {
    x: PAD + 0.9, y: 0.7, w: CONTENT_W - 0.9, h: 1.2,
    fontSize: 22, fontFace: "Arial Black", color: WHITE,
    bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD, y: 2.2, w: CONTENT_W, h: 0.03, fill: { color: GOLD }
  });
  s.addImage({ data: icons.chart, x: (SZ - 0.8) / 2, y: 2.6, w: 0.8, h: 0.8 });
  s.addText("El diagnóstico vibracional y\ntermografía detectan fallas\nantes de que paren tu línea.", {
    x: PAD + 0.3, y: 3.7, w: CONTENT_W - 0.6, h: 1.8,
    fontSize: 18, fontFace: "Arial", color: "b0b8c8",
    align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 5.5, w: SZ - 3, h: 0.5,
    fill: { color: BLUE }
  });
  s.addText("Prevenir < Reparar", {
    x: 1.5, y: 5.5, w: SZ - 3, h: 0.5,
    fontSize: 14, fontFace: "Arial", color: GOLD,
    align: "center", valign: "middle", bold: true, margin: 0
  });
  addFooter(s);

  // C1 - Slide 3: Signal 2
  s = pres.addSlide();
  s.background = { color: NAVY };
  addNumberCircle(s, 2, 0.8);
  s.addText("Mover maquinaria\npesada te quita\nel sueño", {
    x: PAD + 0.9, y: 0.7, w: CONTENT_W - 0.9, h: 1.0,
    fontSize: 22, fontFace: "Arial Black", color: WHITE,
    bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD, y: 2.1, w: CONTENT_W, h: 0.03, fill: { color: GOLD }
  });
  s.addImage({ data: icons.truck, x: (SZ - 0.8) / 2, y: 2.5, w: 0.8, h: 0.8 });
  s.addText("Rigging de precisión con\npóliza USD 1,000,000.", {
    x: PAD + 0.3, y: 3.6, w: CONTENT_W - 0.6, h: 1.0,
    fontSize: 18, fontFace: "Arial", color: "b0b8c8",
    align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD + 0.3, y: 4.8, w: CONTENT_W - 0.6, h: 0.9,
    fill: { color: LIGHT_NAVY }
  });
  s.addText("Caso real: expansor de 7.20m\n17,200 tons reubicado sin incidentes", {
    x: PAD + 0.5, y: 4.8, w: CONTENT_W - 1.0, h: 0.9,
    fontSize: 14, fontFace: "Arial", color: GOLD,
    align: "center", valign: "middle", italic: true, margin: 0, lineSpacingMultiple: 1.2
  });
  addFooter(s);

  // C1 - Slide 4: Signal 3
  s = pres.addSlide();
  s.background = { color: NAVY };
  addNumberCircle(s, 3, 0.8);
  s.addText("Tu proyecto de\nexpansión lleva\nmeses atorado", {
    x: PAD + 0.9, y: 0.7, w: CONTENT_W - 0.9, h: 1.0,
    fontSize: 22, fontFace: "Arial Black", color: WHITE,
    bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD, y: 2.1, w: CONTENT_W, h: 0.03, fill: { color: GOLD }
  });
  s.addImage({ data: icons.industry, x: (SZ - 0.8) / 2, y: 2.5, w: 0.8, h: 0.8 });
  s.addText("Proyectos llave en mano:\ndesde cimentación hasta\npuesta en marcha.", {
    x: PAD + 0.3, y: 3.6, w: CONTENT_W - 0.6, h: 1.2,
    fontSize: 18, fontFace: "Arial", color: "b0b8c8",
    align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 5.2, w: SZ - 3, h: 0.5,
    fill: { color: BLUE }
  });
  s.addText("REPSE Registrado  ·  Póliza USD 1M", {
    x: 1.5, y: 5.2, w: SZ - 3, h: 0.5,
    fontSize: 12, fontFace: "Arial", color: GOLD,
    align: "center", valign: "middle", bold: true, margin: 0
  });
  addFooter(s);

  // C1 - Slide 5: Signal 4
  s = pres.addSlide();
  s.background = { color: NAVY };
  addNumberCircle(s, 4, 0.8);
  s.addText("Tus proveedores\nde EPP no entienden\ntu operación", {
    x: PAD + 0.9, y: 0.7, w: CONTENT_W - 0.9, h: 1.0,
    fontSize: 22, fontFace: "Arial Black", color: WHITE,
    bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD, y: 2.1, w: CONTENT_W, h: 0.03, fill: { color: GOLD }
  });
  s.addImage({ data: icons.shieldGold, x: (SZ - 0.8) / 2, y: 2.5, w: 0.8, h: 0.8 });
  s.addText("EPP especializado por sector:\nanticorte nivel 5, dieléctricos,\nantiflama. Precios directos.", {
    x: PAD + 0.3, y: 3.6, w: CONTENT_W - 0.6, h: 1.2,
    fontSize: 18, fontFace: "Arial", color: "b0b8c8",
    align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
  // Price callouts
  const prices = [
    { item: "Anticorte Nv.5", price: "$43" },
    { item: "Dieléctricos", price: "$50.90" },
    { item: "Antiflama", price: "$89.50" },
  ];
  const cardW = (CONTENT_W - 0.4) / 3;
  prices.forEach((p, i) => {
    const cx = PAD + 0.2 + i * (cardW + 0.2);
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 5.0, w: cardW, h: 0.8,
      fill: { color: LIGHT_NAVY }
    });
    s.addText([
      { text: p.price, options: { fontSize: 16, bold: true, color: GOLD, breakLine: true } },
      { text: p.item, options: { fontSize: 10, color: "b0b8c8" } }
    ], {
      x: cx, y: 5.0, w: cardW, h: 0.8,
      align: "center", valign: "middle", margin: 0
    });
  });
  addFooter(s);

  // C1 - Slide 6: Signal 5
  s = pres.addSlide();
  s.background = { color: NAVY };
  addNumberCircle(s, 5, 0.8);
  s.addText("Necesitas un\nsocio, no un\nproveedor más", {
    x: PAD + 0.9, y: 0.7, w: CONTENT_W - 0.9, h: 1.0,
    fontSize: 22, fontFace: "Arial Black", color: WHITE,
    bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: PAD, y: 2.1, w: CONTENT_W, h: 0.03, fill: { color: GOLD }
  });
  s.addImage({ data: icons.handshake, x: (SZ - 0.8) / 2, y: 2.5, w: 0.8, h: 0.8 });
  s.addText("En MICSA no vendemos\nmano de obra.", {
    x: PAD + 0.3, y: 3.6, w: CONTENT_W - 0.6, h: 0.8,
    fontSize: 18, fontFace: "Arial", color: "b0b8c8",
    align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
  s.addText("Vendemos reducción de\nriesgo operativo\ncon ingeniería.", {
    x: PAD + 0.3, y: 4.4, w: CONTENT_W - 0.6, h: 1.2,
    fontSize: 22, fontFace: "Arial Black", color: GOLD,
    align: "center", valign: "top", bold: true, margin: 0, lineSpacingMultiple: 1.15
  });
  addFooter(s);

  // C1 - Slide 7: CTA
  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SZ, h: 0.06, fill: { color: GOLD }
  });
  s.addText("¿Tu planta tiene\nalguna de\nestas señales?", {
    x: PAD, y: 1.0, w: CONTENT_W, h: 2.0,
    fontSize: 32, fontFace: "Arial Black", color: WHITE,
    align: "center", valign: "middle", bold: true, margin: 0, lineSpacingMultiple: 1.1
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 3.5, w: SZ - 3, h: 0.06, fill: { color: GOLD }
  });
  s.addText("Escríbeme por DM o a", {
    x: PAD, y: 3.9, w: CONTENT_W, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: "b0b8c8",
    align: "center", margin: 0
  });
  s.addText("micdelcentro@gmail.com", {
    x: PAD, y: 4.3, w: CONTENT_W, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: GOLD,
    align: "center", bold: true, margin: 0
  });
  s.addText("Jordan González", {
    x: PAD, y: 5.2, w: CONTENT_W, h: 0.4,
    fontSize: 18, fontFace: "Arial Black", color: WHITE,
    align: "center", bold: true, margin: 0
  });
  s.addText("Grupo MICSA — Integración Industrial + EPP", {
    x: PAD, y: 5.6, w: CONTENT_W, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: GOLD,
    align: "center", margin: 0
  });
  addFooter(s);

  // ========================================
  // CARRUSEL 2: EPP
  // ========================================

  // C2 - Cover
  s = pres.addSlide();
  s.background = { color: RED };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SZ, h: 0.06, fill: { color: WHITE }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: SZ - 0.06, w: SZ, h: 0.06, fill: { color: WHITE }
  });
  s.addImage({ data: icons.warningRed, x: (SZ - 1) / 2, y: 1.0, w: 1, h: 1 });
  s.addText("Lo que Realmente\nCuesta NO Tener\nel EPP Correcto", {
    x: PAD, y: 2.3, w: CONTENT_W, h: 2.5,
    fontSize: 34, fontFace: "Arial Black", color: WHITE,
    align: "center", valign: "top", bold: true, margin: 0, lineSpacingMultiple: 1.1
  });
  s.addText("Más allá de la multa de STPS", {
    x: PAD, y: 5.0, w: CONTENT_W, h: 0.5,
    fontSize: 16, fontFace: "Arial", color: WHITE,
    align: "center", italic: true, margin: 0, transparency: 20
  });
  s.addText("MICSA INDUSTRIAL SUPPLY", {
    x: PAD, y: 5.8, w: CONTENT_W, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: WHITE,
    charSpacing: 4, align: "center", margin: 0, transparency: 30
  });

  // C2 - Slide 2: Cost overview
  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addImage({ data: icons.dollar, x: (SZ - 0.7) / 2, y: 0.8, w: 0.7, h: 0.7 });
  s.addText("+$500,000\nMXN", {
    x: PAD, y: 1.7, w: CONTENT_W, h: 1.4,
    fontSize: 48, fontFace: "Arial Black", color: RED,
    align: "center", valign: "middle", bold: true, margin: 0, lineSpacingMultiple: 0.95
  });
  s.addText("Un accidente por EPP\ninadecuado puede costar esto.", {
    x: PAD, y: 3.2, w: CONTENT_W, h: 0.9,
    fontSize: 18, fontFace: "Arial", color: WHITE,
    align: "center", margin: 0, lineSpacingMultiple: 1.3
  });
  const costs = ["Multas STPS", "Incapacidad", "Paro de línea", "Demanda"];
  costs.forEach((c, i) => {
    const cardWidth = (CONTENT_W - 0.3) / 2;
    const col = i % 2;
    const row = Math.floor(i / 2);
    s.addShape(pres.shapes.RECTANGLE, {
      x: PAD + col * (cardWidth + 0.3), y: 4.4 + row * 0.7, w: cardWidth, h: 0.55,
      fill: { color: LIGHT_NAVY }
    });
    s.addText(c, {
      x: PAD + col * (cardWidth + 0.3), y: 4.4 + row * 0.7, w: cardWidth, h: 0.55,
      fontSize: 13, fontFace: "Arial", color: RED,
      align: "center", valign: "middle", bold: true, margin: 0
    });
  });
  addFooter(s);

  // EPP comparison slides
  const eppSlides = [
    {
      product: "Guantes Anticorte\nNivel 5",
      price: "$43 MXN",
      vs: "Incapacidad por corte\nprofundo: $15,000+ MXN",
      icon: icons.shieldGold,
      factor: "350x"
    },
    {
      product: "Guantes\nDieléctricos",
      price: "$50.90 MXN",
      vs: "Un arco eléctrico sin\nprotección: incalculable",
      icon: icons.bolt,
      factor: "∞"
    },
    {
      product: "Capucha\nAntiflama",
      price: "$89.50 MXN",
      vs: "Quemadura facial por\nsalpicadura: cirugía + demanda",
      icon: icons.fire,
      factor: "500x+"
    },
    {
      product: "Cascos Clase E\ncon Ratchet",
      price: "$56 MXN",
      vs: "Traumatismo craneal:\nhospitalización +\nresponsabilidad patronal",
      icon: icons.hardhat,
      factor: "1000x+"
    },
    {
      product: "Goggles\nTrilogy",
      price: "$87.90 MXN",
      vs: "Pérdida de visión parcial:\npensión vitalicia",
      icon: icons.glasses,
      factor: "∞"
    }
  ];

  eppSlides.forEach((item) => {
    s = pres.addSlide();
    s.background = { color: NAVY };
    // Left side: product
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: SZ / 2 - 0.05, h: SZ - 0.55,
      fill: { color: LIGHT_NAVY }
    });
    s.addImage({ data: item.icon, x: (SZ / 2 - 0.05 - 0.6) / 2, y: 1.0, w: 0.6, h: 0.6 });
    s.addText(item.product, {
      x: 0.3, y: 1.8, w: SZ / 2 - 0.65, h: 1.2,
      fontSize: 20, fontFace: "Arial Black", color: WHITE,
      align: "center", valign: "top", bold: true, margin: 0, lineSpacingMultiple: 1.1
    });
    s.addText(item.price, {
      x: 0.3, y: 3.2, w: SZ / 2 - 0.65, h: 0.7,
      fontSize: 28, fontFace: "Arial Black", color: GOLD,
      align: "center", valign: "middle", bold: true, margin: 0
    });
    // Right side: consequence
    s.addText("vs.", {
      x: SZ / 2 - 0.3, y: 0.5, w: 0.6, h: 0.4,
      fontSize: 14, fontFace: "Arial", color: GOLD,
      align: "center", bold: true, margin: 0
    });
    s.addText(item.vs, {
      x: SZ / 2 + 0.15, y: 1.5, w: SZ / 2 - 0.45, h: 2.0,
      fontSize: 16, fontFace: "Arial", color: "b0b8c8",
      align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
    });
    // Factor badge
    s.addShape(pres.shapes.OVAL, {
      x: SZ / 2 + (SZ / 2 - 1.2) / 2, y: 4.0, w: 1.2, h: 1.2,
      fill: { color: RED }
    });
    s.addText(item.factor, {
      x: SZ / 2 + (SZ / 2 - 1.2) / 2, y: 4.0, w: 1.2, h: 1.0,
      fontSize: 24, fontFace: "Arial Black", color: WHITE,
      align: "center", valign: "middle", bold: true, margin: 0
    });
    s.addText("más caro", {
      x: SZ / 2 + (SZ / 2 - 1.2) / 2, y: 4.85, w: 1.2, h: 0.3,
      fontSize: 9, fontFace: "Arial", color: WHITE,
      align: "center", margin: 0
    });
    addFooter(s);
  });

  // C2 - CTA
  s = pres.addSlide();
  s.background = { color: RED };
  s.addText("¿Tu EPP protege\no solo cumple\nel checklist?", {
    x: PAD, y: 1.0, w: CONTENT_W, h: 2.2,
    fontSize: 32, fontFace: "Arial Black", color: WHITE,
    align: "center", valign: "middle", bold: true, margin: 0, lineSpacingMultiple: 1.1
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.5, y: 3.5, w: SZ - 3, h: 0.04, fill: { color: WHITE }
  });
  s.addText("Catálogo completo + precios\ndirectos sin intermediario", {
    x: PAD, y: 3.8, w: CONTENT_W, h: 0.8,
    fontSize: 16, fontFace: "Arial", color: WHITE,
    align: "center", margin: 0, lineSpacingMultiple: 1.3, transparency: 15
  });
  s.addText("micdelcentro@gmail.com", {
    x: PAD, y: 4.8, w: CONTENT_W, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: WHITE,
    align: "center", bold: true, margin: 0
  });
  s.addText("Jordan González — Grupo MICSA", {
    x: PAD, y: 5.5, w: CONTENT_W, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: WHITE,
    align: "center", margin: 0, transparency: 20
  });
  s.addText("MICSA INDUSTRIAL SUPPLY", {
    x: PAD, y: 6.1, w: CONTENT_W, h: 0.4,
    fontSize: 11, fontFace: "Arial", color: WHITE,
    charSpacing: 4, align: "center", margin: 0, transparency: 30
  });

  // ========================================
  // CARRUSEL 3: Industria 2025-2026
  // ========================================

  // C3 - Cover
  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SZ, h: 0.06, fill: { color: GOLD }
  });
  s.addText("Industria\n2025 → 2026", {
    x: PAD, y: 1.0, w: CONTENT_W, h: 2.0,
    fontSize: 42, fontFace: "Arial Black", color: GOLD,
    align: "center", valign: "middle", bold: true, margin: 0, lineSpacingMultiple: 1.05
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 2.0, y: 3.2, w: SZ - 4.0, h: 0.04, fill: { color: GOLD }
  });
  s.addText("Lo que Viene para\nPlantas Industriales\nen el Noreste de México", {
    x: PAD, y: 3.5, w: CONTENT_W, h: 1.8,
    fontSize: 20, fontFace: "Arial", color: WHITE,
    align: "center", valign: "top", margin: 0, lineSpacingMultiple: 1.3
  });
  s.addImage({ data: icons.globe, x: (SZ - 0.8) / 2, y: 5.4, w: 0.8, h: 0.8 });
  addFooter(s);

  // C3 content slides
  const c3Slides = [
    {
      title: "Nearshoring sigue\nacelerando",
      body: "Más plantas = más montajes,\nmás reubicaciones,\nmás mantenimiento.",
      question: "¿Tu capacidad de respuesta\nestá lista?",
      icon: icons.globe
    },
    {
      title: "Automatización no\nreemplaza operarios",
      body: "Reemplaza procesos manuales\nde riesgo. La integración industrial\nes el puente entre la máquina\nnueva y tu línea existente.",
      question: "",
      icon: icons.robot
    },
    {
      title: "STPS endurece\ninspecciones de EPP",
      body: "Las multas por EPP inadecuado\nsubieron. El EPP genérico ya\nno pasa.",
      question: "Necesitas equipo certificado\npor riesgo específico.",
      icon: icons.clipboard
    },
    {
      title: "Mantenimiento\npredictivo > correctivo",
      body: "Termografía + análisis vibracional\n+ alineación láser",
      question: "= 40% menos paros\nno programados",
      icon: icons.chart
    },
    {
      title: "El proveedor del\nfuturo es socio técnico",
      body: "No el más barato.\nEl que entiende tu operación,\ntiene REPSE, póliza,\ny te resuelve sin sorpresas.",
      question: "",
      icon: icons.user
    }
  ];

  c3Slides.forEach((item) => {
    s = pres.addSlide();
    s.background = { color: NAVY };
    s.addImage({ data: item.icon, x: PAD, y: 0.7, w: 0.6, h: 0.6 });
    s.addText(item.title, {
      x: PAD + 0.8, y: 0.6, w: CONTENT_W - 0.8, h: 1.0,
      fontSize: 24, fontFace: "Arial Black", color: WHITE,
      bold: true, valign: "middle", margin: 0, lineSpacingMultiple: 1.05
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: PAD, y: 1.9, w: CONTENT_W, h: 0.03, fill: { color: GOLD }
    });
    s.addText(item.body, {
      x: PAD + 0.2, y: 2.3, w: CONTENT_W - 0.4, h: 2.2,
      fontSize: 17, fontFace: "Arial", color: "b0b8c8",
      align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.4
    });
    if (item.question) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: PAD, y: 4.8, w: CONTENT_W, h: 0.8,
        fill: { color: BLUE }
      });
      s.addText(item.question, {
        x: PAD + 0.3, y: 4.8, w: CONTENT_W - 0.6, h: 0.8,
        fontSize: 14, fontFace: "Arial", color: GOLD,
        align: "center", valign: "middle", bold: true, margin: 0, lineSpacingMultiple: 1.2
      });
    }
    addFooter(s);
  });

  // C3 - CTA
  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SZ, h: 0.06, fill: { color: GOLD }
  });
  s.addText("¿Estás preparando\ntu planta para\nlo que viene?", {
    x: PAD, y: 1.0, w: CONTENT_W, h: 2.2,
    fontSize: 32, fontFace: "Arial Black", color: WHITE,
    align: "center", valign: "middle", bold: true, margin: 0, lineSpacingMultiple: 1.1
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 2.0, y: 3.5, w: SZ - 4.0, h: 0.04, fill: { color: GOLD }
  });
  s.addText("Hablemos:", {
    x: PAD, y: 3.9, w: CONTENT_W, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: "b0b8c8",
    align: "center", margin: 0
  });
  s.addText("micdelcentro@gmail.com", {
    x: PAD, y: 4.3, w: CONTENT_W, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: GOLD,
    align: "center", bold: true, margin: 0
  });
  s.addText("Jordan González", {
    x: PAD, y: 5.2, w: CONTENT_W, h: 0.4,
    fontSize: 20, fontFace: "Arial Black", color: WHITE,
    align: "center", bold: true, margin: 0
  });
  s.addText("Grupo MICSA — Integración Industrial + EPP", {
    x: PAD, y: 5.6, w: CONTENT_W, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: GOLD,
    align: "center", margin: 0
  });
  addFooter(s);

  const outPath = "/Users/jordangonzalez/Desktop/micsa-docs-app 3/.claude/worktrees/silly-napier/automation/carruseles-linkedin/MICSA_Carrusel_Servicios.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log("Created: " + outPath);
}

main().catch(e => { console.error(e); process.exit(1); });

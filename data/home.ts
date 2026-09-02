export const homeCategories = [
  {
    number: "01",
    title: "Individuales",
    copy: "Miniaturas, mixers, vasos y extras por separado.",
    href: "/productos?categoria=miniatures",
  },
  {
    number: "02",
    title: "Combos",
    copy: "Combinaciones que ya pensamos y armamos por vos.",
    href: "/productos?categoria=combos",
  },
  {
    number: "03",
    title: "Packs",
    copy: "Opciones para compartir, regalar o llevar a la previa.",
    href: "/productos?categoria=packs",
  },
  {
    number: "04",
    title: "Armá tu combo",
    copy: "Elegí cada parte y hacelo exactamente a tu manera.",
    href: "/arma-tu-combo",
  },
];

export const brandBenefits = [
  {
    icon: "BOX",
    title: "Packaging propio",
    copy: "Una presentación pensada para abrir, regalar y compartir.",
  },
  {
    icon: "01",
    title: "Vaso incluido",
    copy: "Lo necesario para que no tengas que resolver nada más.",
  },
  {
    icon: "+",
    title: "Siempre algo más",
    copy: "Sticker y tarjeta sorpresa en cada combo o pack de marca.",
  },
  {
    icon: "OK",
    title: "Compra fácil",
    copy: "Elegís lo que te gusta y recibís la cantidad justa.",
  },
];

export const packOptions = [
  { name: "Duo", amount: "02", use: "Uno para vos. Otro también." },
  { name: "x4", amount: "04", use: "La previa arranca acá." },
  { name: "x6", amount: "06", use: "Para compartir de verdad." },
  { name: "x12", amount: "12", use: "Fiesta, evento o regalo." },
];

export const faqItems = [
  {
    question: "¿Puedo comprar una sola miniatura?",
    answer:
      "Sí. Las miniaturas, mixers, vasos y extras publicados también se podrán comprar por separado.",
  },
  {
    question: "¿Puedo armar mi combo?",
    answer:
      "Sí. Elegí miniatura, mixer, vaso y extras en nuestro constructor. Si armás un combo existente, te aplicamos automáticamente el mejor precio.",
  },
  {
    question: "¿Hacen envíos?",
    answer:
      "La operación inicial contempla delivery propio en zonas habilitadas de Mar del Plata y Balcarce. Las condiciones finales están pendientes.",
  },
  {
    question: "¿Hay retiro?",
    answer:
      "Sí, el retiro forma parte de las modalidades previstas. El punto y los horarios se confirmarán antes del lanzamiento.",
  },
  {
    question: "¿Venden mayorista?",
    answer:
      "Sí. Habrá atención comercial para negocios y revendedores, con cotización y condiciones por contacto.",
  },
  {
    question: "¿Hacen packs para eventos?",
    answer:
      "Sí. Se contemplan packs, souvenirs y opciones personalizadas mediante consulta y cotización manual.",
  },
];

export const comboPreviewOptions = [
  ["Fernet", "bg-action text-white"],
  ["Whisky", "bg-ink text-white"],
  ["Gin", "bg-mint text-action"],
] as const;

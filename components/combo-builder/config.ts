export const comboBuilderSteps = [
  {
    short: "Mini",
    title: "Elegí tu miniatura",
    description: "La protagonista de tu combo. Elegí la que tengas ganas de tomar hoy.",
  },
  {
    short: "Mixer",
    title: "Elegí tu mixer",
    description: "Clásico, cítrico o con energía. Acá no hay combinaciones prohibidas.",
  },
  {
    short: "Vaso",
    title: "Elegí tu vaso",
    description: "Hoy hay un modelo. El paso queda listo para sumar nuevas ediciones.",
  },
  {
    short: "Extras",
    title: "Sumá extras",
    description: "Este paso es opcional. Podés elegir todos los que quieras.",
  },
  {
    short: "Listo",
    title: "Así quedó tu combo",
    description: "Revisá lo que elegiste. Si coincide con un combo, el mejor precio ya está aplicado.",
  },
] as const;

export const extraDefinitions = [
  {
    productId: "golosina-extra",
    displayName: "Golosina",
    caption: "Un toque dulce para acompañar.",
  },
  {
    productId: "sorbete-rayado",
    displayName: "Sorbete",
    caption: "El detalle simple que completa el vaso.",
  },
  {
    productId: "vaso-mini",
    displayName: "Segundo vaso",
    caption: "Por si este mini se comparte.",
  },
  {
    productId: "packaging-especial",
    displayName: "Packaging especial",
    caption: "Para regalar o hacerlo más especial.",
  },
] as const;

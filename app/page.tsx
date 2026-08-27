import Link from "next/link";

import { ButtonLink } from "@/components/button-link";
import { Container } from "@/components/container";
import { Footer } from "@/components/footer";
import { ArrowIcon, PlusIcon } from "@/components/icons";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { combos } from "@/data/catalog";

const categories = [
  {
    number: "01",
    title: "Individuales",
    copy: "Miniaturas, mixers, vasos y extras por separado.",
    href: "/catalogo?categoria=miniatures",
  },
  {
    number: "02",
    title: "Combos",
    copy: "Combinaciones que ya pensamos y armamos por vos.",
    href: "/catalogo?categoria=combos",
  },
  {
    number: "03",
    title: "Packs",
    copy: "Opciones para compartir, regalar o llevar a la previa.",
    href: "/catalogo?categoria=packs",
  },
  {
    number: "04",
    title: "Armá tu combo",
    copy: "Elegí cada parte y hacelo exactamente a tu manera.",
    href: "#arma-tu-combo",
  },
];

const differentials = [
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

const packs = [
  { name: "Duo", amount: "02", use: "Uno para vos. Otro también." },
  { name: "x4", amount: "04", use: "La previa arranca acá." },
  { name: "x6", amount: "06", use: "Para compartir de verdad." },
  { name: "x12", amount: "12", use: "Fiesta, evento o regalo." },
];

const faq = [
  {
    question: "¿Puedo comprar una sola miniatura?",
    answer:
      "Sí. Las miniaturas, mixers, vasos y extras publicados también se podrán comprar por separado.",
  },
  {
    question: "¿Puedo armar mi combo?",
    answer:
      "Sí. Vas a poder elegir miniatura, mixer, vaso y extras. El constructor se implementará en una próxima etapa.",
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

export default function Home() {
  return (
    <>
      <Header />
      <main id="contenido">
        <section
          id="inicio"
          className="hero-section overflow-hidden border-b border-ink/10 py-10 sm:py-14 lg:py-20"
        >
          <Container>
            <div className="hero-layout grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <div className="relative z-10">
                <h1 className="hero-title font-display max-w-4xl text-[clamp(3.65rem,17vw,8.8rem)] leading-[0.82] tracking-[-0.065em] uppercase">
                  Tu trago.
                  <span className="block text-action">En mini.</span>
                </h1>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70 sm:text-xl">
                  Todo lo que necesitás para hacerte uno.
                </p>
                <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row">
                  <ButtonLink href="/catalogo?categoria=combos" className="min-[390px]:min-w-36">
                    Ver combos
                  </ButtonLink>
                  <ButtonLink
                    href="#arma-tu-combo"
                    variant="secondary"
                    className="min-[390px]:min-w-36"
                  >
                    Armar el mío
                  </ButtonLink>
                </div>
              </div>

              <div
                aria-label="Placeholder visual de miniatura, mixer, vaso y packaging"
                role="img"
                className="hero-visual relative min-h-[27rem] overflow-hidden rounded-[1.75rem] bg-mint sm:min-h-[35rem]"
              >
                <div className="absolute top-5 right-5 z-20 rotate-6 rounded-full bg-ink px-4 py-3 text-xs font-black tracking-widest text-white uppercase">
                  50 ml
                </div>
                <div className="absolute -top-12 -left-12 size-44 rounded-full border-[26px] border-white/45 sm:size-64" />
                <div className="absolute -right-16 -bottom-20 size-72 rounded-full bg-action/90 sm:size-96" />

                <div className="absolute top-[13%] right-[7%] h-[53%] w-[47%] rotate-3 rounded-[1.25rem] border-2 border-ink bg-canvas p-4 shadow-[12px_16px_0_#0d0d0d] sm:p-6">
                  <p className="font-display text-[clamp(1.4rem,5vw,3rem)] leading-none uppercase">
                    Tu trago
                    <span className="block text-action">en mini.</span>
                  </p>
                  <span className="absolute right-4 bottom-4 left-4 border-t-2 border-ink pt-2 text-[0.6rem] font-black tracking-widest uppercase sm:text-xs">
                    Packaging de marca
                  </span>
                </div>

                <div className="absolute bottom-[9%] left-[11%] z-20 h-[53%] w-[23%] -rotate-8 rounded-t-[2.5rem] rounded-b-xl border-2 border-ink bg-action shadow-[8px_10px_0_rgba(13,13,13,0.22)]">
                  <div className="absolute -top-[8%] left-1/2 h-[13%] w-[48%] -translate-x-1/2 rounded-t-md border-2 border-ink bg-ink" />
                  <span className="absolute top-[43%] inset-x-2 border-y border-white/50 py-3 text-center text-[0.6rem] font-black tracking-widest text-white sm:text-sm">
                    MINI
                  </span>
                </div>

                <div className="absolute bottom-[8%] left-[38%] z-20 h-[43%] w-[20%] rotate-8 rounded-xl border-2 border-ink bg-[#d92d20] shadow-[8px_10px_0_rgba(13,13,13,0.22)]">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[0.6rem] font-black tracking-widest text-white sm:text-xs">
                    MIXER
                  </span>
                </div>

                <div className="absolute right-[7%] bottom-[7%] z-30 h-[28%] w-[23%] rounded-b-3xl border-2 border-white bg-white/25 backdrop-blur-sm">
                  <span className="absolute right-2 bottom-2 left-2 h-[46%] rounded-b-2xl bg-white/55" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="destacados" className="featured-section py-20 sm:py-28 lg:py-36">
          <Container>
            <SectionHeading
              eyebrow="Combos destacados"
              title="Los que no fallan."
              description="Combinaciones simples, conocidas y listas para resolver ese trago que querés ahora."
            />
            <div className="featured-combos mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:items-start">
              {combos.map((product, index) => (
                <ProductCard
                  key={product.id}
                  item={product}
                  variant="featured"
                  className={index % 2 === 1 ? "lg:mt-12" : ""}
                />
              ))}
            </div>
            <p className="mt-6 text-xs font-medium text-ink/60">
              Imágenes y precios finales pendientes. Las composiciones son
              placeholders visuales.
            </p>
          </Container>
        </section>

        <section className="buy-section bg-white py-20 sm:py-28" aria-labelledby="comprar-title">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
              <div className="home-sticky-title">
                <p className="mb-3 text-xs font-black tracking-[0.2em] text-action uppercase">
                  Hay más de una forma
                </p>
                <h2
                  id="comprar-title"
                    className="buy-title font-display text-[clamp(2.5rem,9vw,5.4rem)] leading-[0.95] tracking-[-0.04em] uppercase"
                >
                  ¿Qué podés comprar?
                </h2>
              </div>
              <div className="divide-y divide-ink/15 border-y border-ink/15">
                {categories.map((category) => (
                  <Link
                    key={category.number}
                    href={category.href}
                    className="category-link group grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 py-7 transition-colors active:bg-mint/30 sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:gap-6 sm:py-9"
                  >
                    <span className="text-xs font-black text-action">
                      {category.number}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl leading-none uppercase sm:text-3xl">
                        {category.title}
                      </h3>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60 sm:text-base">
                        {category.copy}
                      </p>
                    </div>
                    <span className="col-start-2 grid size-8 place-items-center justify-self-end rounded-full border border-ink/40 text-action transition-transform group-active:translate-x-1 sm:col-auto sm:size-12 sm:border-2 sm:text-ink sm:group-hover:bg-mint">
                      <ArrowIcon />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="arma-tu-combo" className="build-section bg-action py-20 text-white sm:py-28 lg:py-32">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <SectionHeading
                  eyebrow="La parte más divertida"
                  title="Armalo como quieras."
                  description="Elegí miniatura, mixer, vaso y extras. Nosotros lo dejamos listo."
                  inverted
                />
                <ButtonLink href="#arma-tu-combo" variant="lightdark" className="mt-8 min-w-36">
                  Empezar
                </ButtonLink>
                <p className="mt-4 text-xs text-white/70">
                  Presentación visual. El constructor se implementará más adelante.
                </p>
              </div>

              <div
                aria-hidden="true"
                className="build-preview relative rounded-[1.75rem] bg-canvas p-4 text-ink sm:p-7"
              >
                <div className="mb-7 flex items-center gap-2" aria-hidden="true">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-2 flex-1 rounded-full ${
                        step === 1 ? "bg-action" : "bg-ink/10"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-black tracking-widest text-action uppercase">
                      Paso 1 de 4
                    </span>
                    <h3 className="mt-2 font-display text-2xl leading-none uppercase sm:text-4xl">
                      Elegí tu mini
                    </h3>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-5">
                  {[
                    ["Fernet", "bg-action text-white"],
                    ["Whisky", "bg-ink text-white"],
                    ["Gin", "bg-mint text-action"],
                  ].map(([name, color], index) => (
                    <div
                      key={name}
                      className={`relative flex aspect-[0.72] items-end justify-center rounded-xl border-2 p-2 ${
                        index === 0 ? "border-action" : "border-transparent bg-white"
                      }`}
                    >
                      <div
                        className={`relative h-[72%] w-[52%] rounded-t-2xl rounded-b-md border border-ink/15 ${color}`}
                      >
                        <span className="absolute top-1/2 inset-x-0 text-center text-[0.6rem] font-black uppercase sm:text-xs">
                          {name}
                        </span>
                      </div>
                      {index === 0 ? (
                        <span className="absolute top-2 right-2 grid size-5 place-items-center rounded-full bg-action text-xs text-white">
                          ✓
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold">
                  <span>Miniatura + mixer + vaso + extras</span>
                  <PlusIcon className="size-5 text-action" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-28">
          <Container>
            <SectionHeading
              eyebrow="No es solo una mini"
              title="Todo suma."
              description="El diferencial está en cómo llega, cómo se abre y lo fácil que es disfrutarlo."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {differentials.map((item, index) => (
                <article
                  key={item.title}
                  className={`min-h-64 rounded-[1.5rem] border border-ink/10 p-6 sm:p-7 ${
                    index === 2 ? "bg-mint" : "bg-white"
                  }`}
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-ink font-black text-white">
                    {item.icon}
                  </span>
                  <h3 className="mt-10 font-display text-xl leading-tight uppercase sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">
                    {item.copy}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="packs" className="packs-section overflow-hidden bg-ink py-20 text-white sm:py-28">
          <Container>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="¿Uno o para todos?"
                title="Elegí tu pack."
                description="Desde un duo hasta doce combinaciones para regalar, compartir o resolver un evento."
                inverted
              />
              <ButtonLink href="#packs" variant="light" className="sm:mb-1">
                Ver packs
              </ButtonLink>
            </div>
            <div className="packs-grid mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {packs.map((pack, index) => (
                <article
                  key={pack.name}
                  className={`pack-card relative min-h-64 overflow-hidden rounded-[1.5rem] p-5 sm:min-h-80 sm:p-7 ${
                    index === 1
                      ? "bg-mint text-ink"
                      : index === 3
                        ? "bg-action text-white"
                        : "bg-white text-ink"
                  }`}
                >
                  <span className="text-xs font-black tracking-[0.18em] uppercase">
                    Pack {pack.name}
                  </span>
                  <p className="absolute -right-2 bottom-8 font-display text-[6.5rem] leading-none tracking-[-0.08em] opacity-15 sm:text-[9rem]">
                    {pack.amount}
                  </p>
                  <div className="absolute right-5 bottom-5 left-5 sm:right-7 sm:bottom-7 sm:left-7">
                    <p className="font-display text-4xl leading-none uppercase sm:text-5xl">
                      {pack.name}
                    </p>
                    <p className="mt-3 text-sm opacity-65 sm:text-base">
                      {pack.use}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="surprise-section py-20 sm:py-28">
          <Container>
            <div className="grid overflow-hidden rounded-[1.75rem] bg-mint lg:grid-cols-2">
              <div className="p-7 sm:p-12 lg:p-16">
                <h2 className="font-display text-[clamp(2.5rem,10vw,5rem)] leading-[0.94] tracking-[-0.04em] uppercase">
                  Siempre viene una sorpresa.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/70 sm:text-lg">
                  Cada combo o pack de marca incluye sticker y tarjeta. El QR o
                  código deja preparado el camino para sumar beneficios en el
                  futuro.
                </p>
                <p className="mt-5 text-xs font-bold tracking-wide text-action uppercase">
                  Sin puntos ni canje digital en esta etapa
                </p>
              </div>
              <div className="surprise-visual relative min-h-[25rem] overflow-hidden bg-action sm:min-h-[32rem]">
                <div className="absolute top-[12%] left-[10%] w-[62%] -rotate-7 rounded-xl bg-white p-6 shadow-[10px_12px_0_#0d0d0d] sm:p-8">
                  <p className="text-xs font-black tracking-widest text-action uppercase">
                    Tarjeta sorpresa
                  </p>
                  <p className="mt-4 font-display text-2xl leading-none uppercase sm:text-4xl">
                    Esto recién empieza.
                  </p>
                  <div className="mt-8 grid size-16 grid-cols-4 gap-1 bg-ink p-2" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <span
                        key={index}
                        className={
                          [0, 2, 5, 7, 8, 11, 13, 14].includes(index)
                            ? "bg-white"
                            : "bg-ink"
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute right-[8%] bottom-[9%] grid aspect-square w-[45%] rotate-9 place-items-center rounded-[30%] border-4 border-ink bg-[#f1e45c] shadow-[8px_10px_0_#0d0d0d]">
                  <span className="font-display text-[clamp(1.4rem,6vw,3.5rem)] leading-none text-center uppercase">
                    Mini
                    <br /> club
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="regalos-eventos" className="gifts-section pb-20 sm:pb-28">
          <Container>
            <div className="gifts-grid grid gap-5 lg:grid-cols-2">
              <article className="gift-card relative min-h-[27rem] overflow-hidden rounded-[1.75rem] bg-white p-7 sm:min-h-[34rem] sm:p-12">
                <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
                  Regalos
                </p>
                <h2 className="mt-4 max-w-lg font-display text-[clamp(2.5rem,9vw,4.8rem)] leading-[0.96] tracking-[-0.04em] uppercase">
                  Chico. Distinto. Regalable.
                </h2>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-ink/65">
                  Boxes, packs temáticos y una presentación que no pasa
                  desapercibida.
                </p>
                <span className="gift-sticker absolute right-8 bottom-8 grid size-32 rotate-8 place-items-center rounded-2xl bg-mint font-display text-2xl uppercase shadow-[7px_8px_0_#0d0d0d] sm:size-44 sm:text-3xl">
                  Para vos
                </span>
              </article>

              <article className="gift-card relative min-h-[27rem] overflow-hidden rounded-[1.75rem] bg-mint p-7 sm:min-h-[34rem] sm:p-12">
                <p className="text-xs font-black tracking-[0.18em] text-action uppercase">
                  Eventos
                </p>
                <h2 className="mt-4 max-w-lg font-display text-[clamp(2.5rem,9vw,4.8rem)] leading-[0.96] tracking-[-0.04em] uppercase">
                  Hagámoslo a tu manera.
                </h2>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-ink/65">
                  Packs, souvenirs y opciones personalizadas para celebraciones.
                </p>
                <span className="absolute right-7 bottom-7 inline-flex items-center gap-2 border-b-2 border-ink pb-2 text-sm font-black sm:right-12 sm:bottom-12">
                  Consultar eventos <ArrowIcon className="size-4" />
                </span>
              </article>
            </div>
          </Container>
        </section>

        <section id="mayoristas" className="wholesale-section bg-action py-20 text-white sm:py-24">
          <Container>
            <div className="wholesale-content flex flex-col items-center gap-8 text-center lg:mx-auto lg:w-fit">
              <div>
                <h2 className="font-display text-[clamp(2.5rem,10vw,6rem)] leading-[0.92] tracking-[-0.045em] uppercase">
                  ¿Tenés un negocio?
                </h2>
              </div>
              <ButtonLink href="#mayoristas" variant="lightdark" className="shrink-0">
                Quiero venderlos
              </ButtonLink>
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-28" aria-labelledby="faq-title">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
              <div className="home-sticky-title">
                <p className="mb-3 text-xs font-black tracking-[0.2em] text-action uppercase">
                  Antes de pedir
                </p>
                <h2
                  id="faq-title"
                  className="font-display text-[clamp(2.5rem,9vw,5rem)] leading-[0.95] tracking-[-0.04em] uppercase"
                >
                  Preguntas frecuentes.
                </h2>
              </div>
              <div className="border-t border-ink/20">
                {faq.map((item) => (
                  <details key={item.question} className="group border-b border-ink/20">
                    <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-black sm:text-lg">
                      {item.question}
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white transition-transform group-open:rotate-45">
                        <PlusIcon />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-6 pr-10 text-sm leading-relaxed text-ink/65 sm:text-base">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  inverted?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  inverted = false,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow ? (
        <p
          className={`mb-3 text-xs font-black tracking-[0.2em] uppercase ${
            inverted ? "text-mint" : "text-action"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-[clamp(2rem,8vw,4.75rem)] leading-[0.98] tracking-[-0.035em] uppercase">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${
            inverted ? "text-white/75" : "text-ink/70"
          } ${alignment}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

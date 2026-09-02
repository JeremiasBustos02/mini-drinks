import { comboBuilderSteps } from "@/components/combo-builder/config";

type ComboBuilderProgressProps = {
  currentStep: number;
};

export function ComboBuilderProgress({ currentStep }: ComboBuilderProgressProps) {
  return (
    <ol aria-label="Progreso del armado" className="grid grid-cols-5 gap-2">
      {comboBuilderSteps.map((item, index) => (
        <li
          key={item.short}
          aria-current={index === currentStep ? "step" : undefined}
          className={index === currentStep ? "text-action" : "text-ink/45"}
        >
          <span
            className={`block h-1.5 rounded-full ${
              index <= currentStep
                ? index === currentStep
                  ? "bg-action"
                  : "bg-ink"
                : "bg-ink/10"
            }`}
          />
          <span className="mt-1.5 block text-center text-[0.6rem] font-black uppercase sm:text-[0.7rem]">
            <span className="sm:hidden">0{index + 1}</span>
            <span className="hidden sm:inline">{item.short}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

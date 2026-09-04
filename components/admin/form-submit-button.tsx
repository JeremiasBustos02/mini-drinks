"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  confirmMessage?: string;
};

export function AdminSubmitButton({
  children,
  className,
  confirmMessage,
  disabled,
  pendingLabel = "Guardando...",
  ...props
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      aria-busy={pending}
      className={className}
      disabled={disabled || pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
        props.onClick?.(event);
      }}
      type={props.type ?? "submit"}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {pendingLabel}
        </span>
      ) : children}
    </button>
  );
}

type NoticeProps = {
  error?: string;
  success?: string;
};

export function AdminNotice({ error, success }: NoticeProps) {
  const message = error ?? success;
  if (!message) return null;

  return (
    <p
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-bold ${
        error
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-action/20 bg-mint/30 text-action"
      }`}
      role={error ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

import { redirect } from "next/navigation";

export default async function LegacyCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  redirect(categoria ? `/productos?categoria=${encodeURIComponent(categoria)}` : "/productos");
}

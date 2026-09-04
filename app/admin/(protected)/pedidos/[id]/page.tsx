import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AdminPageHeader, adminSecondaryButtonClass } from "@/components/admin/admin-ui";
import { OrderDetail } from "@/components/admin/order-detail";
import { getAdminOrderDetail } from "@/lib/db/queries/admin";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const data = await getAdminOrderDetail(id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-[92rem]">
      <AdminPageHeader action={<Link className={adminSecondaryButtonClass} href="/admin/pedidos">Volver a pedidos</Link>} description="Información histórica del pedido, pago y reserva." eyebrow="Detalle de pedido" title={data.order.publicNumber} />
      <div className="mt-7"><OrderDetail data={data} /></div>
    </div>
  );
}

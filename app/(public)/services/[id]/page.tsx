import { ServiceDetail } from "./service-detail";

/** Next 16: `params` is a Promise — unwrap before rendering the client view. */
export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetail serviceId={id} />;
}

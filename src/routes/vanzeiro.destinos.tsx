import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vanzeiro/destinos")({
  component: () => <Outlet />,
});

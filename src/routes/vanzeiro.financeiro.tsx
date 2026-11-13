import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vanzeiro/financeiro")({
  component: Outlet,
});

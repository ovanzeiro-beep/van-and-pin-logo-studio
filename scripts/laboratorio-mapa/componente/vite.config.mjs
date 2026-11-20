import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const raiz = fileURLToPath(new URL("../../../", import.meta.url));
export default {
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  resolve: { alias: { "@": `${raiz}src` } },
  server: { port: 5175, host: "127.0.0.1", fs: { allow: [raiz] } },
  logLevel: "warn",
};

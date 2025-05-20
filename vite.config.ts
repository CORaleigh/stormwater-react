import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: '/stormwater-react/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      "/customers": {
        target: "https://us-ashburn-1.stg.utilities-cloud.oracleindustry.com/c84r3h/test/ccb/rest/apis/cm/customers",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/customers/, ''),
      },
    },
  }
});

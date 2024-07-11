import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "https://api:8000",
                changeOrigin: true,
                secure: false,
            },
            "/api/events/ws": {
                target: "wss://api:8000",
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
        https: {
            key: readFileSync("/raven/certs/client/key.pem"),
            cert: readFileSync("/raven/certs/client/cert.pem"),
        },
    },
});

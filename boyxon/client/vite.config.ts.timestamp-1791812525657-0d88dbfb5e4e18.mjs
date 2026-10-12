// vite.config.ts
import { defineConfig } from "file:///D:/Loyihalar/Boyxon%20oshxonasi/boyxon/client/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Loyihalar/Boyxon%20oshxonasi/boyxon/client/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "node:path";
var __vite_injected_original_dirname = "D:\\Loyihalar\\Boyxon oshxonasi\\boyxon\\client";
var vite_config_default = defineConfig({
  plugins: [react()],
  root: path.resolve(__vite_injected_original_dirname),
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true }
    }
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          vendor: ["@tanstack/react-query", "zustand", "axios", "framer-motion", "socket.io-client"],
          i18n: ["i18next", "react-i18next"]
        }
      }
    }
  },
  preview: { port: 4173 }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxMb3lpaGFsYXJcXFxcQm95eG9uIG9zaHhvbmFzaVxcXFxib3l4b25cXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxMb3lpaGFsYXJcXFxcQm95eG9uIG9zaHhvbmFzaVxcXFxib3l4b25cXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9Mb3lpaGFsYXIvQm95eG9uJTIwb3NoeG9uYXNpL2JveXhvbi9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcclxuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCldLFxyXG4gIHJvb3Q6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUpLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgcmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgIHZlbmRvcjogWydAdGFuc3RhY2svcmVhY3QtcXVlcnknLCAnenVzdGFuZCcsICdheGlvcycsICdmcmFtZXItbW90aW9uJywgJ3NvY2tldC5pby1jbGllbnQnXSxcclxuICAgICAgICAgIGkxOG46IFsnaTE4bmV4dCcsICdyZWFjdC1pMThuZXh0J10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwcmV2aWV3OiB7IHBvcnQ6IDQxNzMgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1QsU0FBUyxvQkFBb0I7QUFDNVYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsTUFBTSxLQUFLLFFBQVEsZ0NBQVM7QUFBQSxFQUM1QixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxLQUFLO0FBQUEsSUFDaEU7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixPQUFPLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ2hELFFBQVEsQ0FBQyx5QkFBeUIsV0FBVyxTQUFTLGlCQUFpQixrQkFBa0I7QUFBQSxVQUN6RixNQUFNLENBQUMsV0FBVyxlQUFlO0FBQUEsUUFDbkM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsRUFBRSxNQUFNLEtBQUs7QUFDeEIsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

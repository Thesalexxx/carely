import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two public versions of Carely are built independently from the same source:
//   demo  -> /carely/demo/   -> dist/demo   (fully populated synthetic demo data)
//   beta  -> /carely/beta/   -> dist/beta   (completely empty, user supplies data)
//
// Use `vite build --mode demo` or `vite build --mode beta`.
// `import.meta.env.MODE` is baked into the built code at compile time and
// controls the localStorage key + demo seeding in src/types/carely.ts.
//
// The root index.html is the React app shell. A separate static landing page
// (landing.html) is copied to dist/index.html by the `build:pages` script.
export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: isDemo ? 'dist/demo' : 'dist/beta',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    // HashRouter is kept; base matches the GitHub Pages subpath for each version.
    base: isDemo ? '/carely/demo/' : '/carely/beta/',
  }
})

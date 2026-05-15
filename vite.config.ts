import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  // npm library — React/ReactFlow externalised
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({ include: ['src/lib'], rollupTypes: true }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'SequenceFlowVisualizer',
          fileName: 'index',
          formats: ['es'],
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime', '@xyflow/react'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              '@xyflow/react': 'ReactFlow',
            },
          },
        },
        copyPublicDir: false,
      },
    };
  }

  // Standalone IIFE — React bundled, usable from plain HTML
  if (mode === 'standalone') {
    return {
      plugins: [react()],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/standalone.ts'),
          name: 'SequenceFlowVisualizer',
          fileName: 'sequence-flow-visualizer',
          formats: ['iife'],
        },
        copyPublicDir: false,
      },
    };
  }

  // Dev server
  return {
    plugins: [react()],
  };
});

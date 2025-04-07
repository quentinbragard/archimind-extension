import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import tsconfigPaths from 'vite-tsconfig-paths';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load environment variables from .env files
    // mode can be 'development' or 'production'
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    
    const isProduction = mode === 'production';
    
    // Get the API URL from env or use default values
    const apiUrl = env.VITE_API_URL || (isProduction 
        ? 'https://jaydai-api-sw5cmqbraq-uc.a.run.app/'
        : 'http://localhost:8000');
    
    // Get debug setting from env or default based on mode
    const debug = env.VITE_DEBUG || (!isProduction).toString();
    
    // Get app version from env or default
    const appVersion = env.VITE_APP_VERSION || '1.0.0';
    
    console.log(`🚀 Building for ${mode} environment`);
    console.log(`🔌 API URL: ${apiUrl}`);
    console.log(`🐞 Debug: ${debug}`);
    console.log(`📦 Version: ${appVersion}`);

    return {
        plugins: [
            react(),
            tsconfigPaths(), // Add this to resolve path aliases correctly
            cssInjectedByJs(),
            viteStaticCopy({
                targets: [
                    {
                        src: 'public/*',
                        dest: ''
                    },
                    // Copy HTML files from their source locations to the dist folder
                    {
                        src: 'src/extension/popup/popup.html',
                        dest: '',
                        rename: 'popup.html'
                    },
                    {
                        src: 'src/extension/welcome/welcome.html',
                        dest: '',
                        rename: 'welcome.html'
                    },
                    {
                        src: 'src/extension/content/content.css',
                        dest: 'assets/'
                    },
                    {
                        src: '_locales',
                        dest: ''
                    }
                ]
            })
        ],
        css: {
            postcss: {
                plugins: [
                    tailwindcss,
                    autoprefixer,
                ],
            },
        },
        // Prevent code splitting for extension entry points
        build: {
            emptyOutDir: true,
            outDir: 'dist',
            minify: isProduction,
            sourcemap: !isProduction,
            rollupOptions: {
                input: {
                    content: resolve(__dirname, 'src/extension/content/content.js'),
                    'content-init': resolve(__dirname, 'src/extension/content/initializer.ts'),
                    background: resolve(__dirname, 'src/extension/background/background.js'),
                    popup: resolve(__dirname, 'src/extension/popup/popup.tsx'),
                    welcome: resolve(__dirname, 'src/extension/welcome/welcome.tsx'),
                    'injectedInterceptor': resolve(__dirname, 'src/extension/content/injectedInterceptor/index.js'),
                    'applicationInitializer': resolve(__dirname, 'src/extension/content/applicationInitializer.ts'),
                    'popup-styles': resolve(__dirname, 'src/extension/popup/popup.css'),
                    'welcome-styles': resolve(__dirname, 'src/extension/welcome/welcome.css'),
                    'content-styles': resolve(__dirname, 'src/extension/content/content.css')
                },
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: 'assets/[name].[hash].js',
                    assetFileNames: 'assets/[name].[ext]',
                    manualChunks: undefined // Disable chunk optimization for extension entry points
                },
                preserveEntrySignatures: 'strict' // Helps prevent tree-shaking of exports
            }
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
                '@components': resolve(__dirname, './src/components')
            }
        },
        // Improve handling of external dependencies
        optimizeDeps: {
            include: ['react', 'react-dom']
        },
        define: {
            // Make environment variables available in the code
            'process.env.NODE_ENV': JSON.stringify(mode),
            'process.env.VITE_API_URL': JSON.stringify(apiUrl),
            'process.env.VITE_DEBUG': JSON.stringify(debug),
            'process.env.VITE_APP_VERSION': JSON.stringify(appVersion)
        },
        server: {
            hmr: {
                // This helps with HMR when developing
                port: 3000
            }
        }
    };
});
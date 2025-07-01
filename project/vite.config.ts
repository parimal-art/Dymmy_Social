import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read canister IDs from dfx configuration
let canisterIds = {};
try {
  const canisterIdsPath = join(process.cwd(), '.dfx/local/canister_ids.json');
  const canisterIdsContent = readFileSync(canisterIdsPath, 'utf8');
  canisterIds = JSON.parse(canisterIdsContent);
} catch (error) {
  console.warn('Could not read canister IDs:', error.message);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'window',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.CANISTER_ID_SOCIAL_BACKEND': JSON.stringify(
      canisterIds.social_backend?.local || process.env.CANISTER_ID_SOCIAL_BACKEND || 'rdmx6-jaaaa-aaaaa-aaadq-cai'
    ),
    'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(
      canisterIds.internet_identity?.local || process.env.CANISTER_ID_INTERNET_IDENTITY || 'rrkah-fqaaa-aaaaa-aaaaq-cai'
    ),
  },
});
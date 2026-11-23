// @ts-check
import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

function sitio() {
  const explicita = String(process.env.SITE || '').trim().replace(/\/$/, '');
  if (explicita) return explicita;
  const vercel = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`;
  console.warn('Definí SITE con la URL pública para el sitemap y las URLs canónicas.');
  return 'http://localhost:4321';
}

// https://astro.build/config
export default defineConfig({
  site: sitio(),
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      options: { weights: [400, 500], styles: ['normal', 'italic'] },
    },
    {
      provider: fontProviders.google(),
      name: 'DM Sans',
      cssVariable: '--font-dm-sans',
      options: { weights: [400, 500] },
    },
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-instrument-sans',
      options: { weights: [400, 500, 600] },
    },
  ],
  integrations: [
    react(),
    sitemap(),
    {
      name: 'sin-originales',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          await rm(fileURLToPath(new URL('demo/celia-originales', dir)), { recursive: true, force: true })
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
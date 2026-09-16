import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BotClips - Viral Automation & Organic Engagement',
    short_name: 'BotClips',
    description: 'Organic Growth & Engagement Automation Engine for Short-Form Clippers',
    start_url: '/app',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#00F2FE',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };
}

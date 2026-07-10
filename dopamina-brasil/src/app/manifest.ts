import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dopaminando',
    short_name: 'Dopaminando',
    description: 'Compre o que quiser. Gaste zero.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#ccff00',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  };
}

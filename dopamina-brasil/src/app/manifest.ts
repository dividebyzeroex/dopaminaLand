import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'dopaminado',
    short_name: 'dopaminado',
    description: 'Compre o que quiser. Gaste zero. Uma experiência de e-commerce simulado.',
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

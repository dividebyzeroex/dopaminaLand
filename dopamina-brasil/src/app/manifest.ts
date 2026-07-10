import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dopamina Land',
    short_name: 'Dopamina',
    description: 'A loja onde você compra tudo sem gastar nada.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#ff6b00',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  };
}

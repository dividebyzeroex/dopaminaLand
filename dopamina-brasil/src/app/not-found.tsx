import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8 h-48 w-48 overflow-hidden rounded-full border-4 border-neon shadow-[0_0_30px_rgba(204,255,0,0.3)] animate-float">
        <Image 
          src="/cleiton.png" 
          alt="Cleiton Mascot" 
          fill
          className="object-cover"
          style={{ transform: 'scale(1.2) translateY(10%) rotate(-10deg)' }} 
        />
      </div>
      <h1 className="font-[var(--font-display)] text-5xl font-black text-foreground">
        Eita! 404 🗺️
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        O Cleiton olhou pro mapa de cabeça pra baixo e acabou se perdendo. Essa página não existe no nosso estoque!
      </p>
      <Link 
        href="/"
        className="mt-8 rounded-full bg-neon px-8 py-4 font-bold text-background transition-transform hover:scale-105 active:scale-95"
      >
        Ajudar o Cleiton a voltar pra Home
      </Link>
    </div>
  );
}

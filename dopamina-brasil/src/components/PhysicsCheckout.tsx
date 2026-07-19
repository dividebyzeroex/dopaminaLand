'use client';

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import Link from 'next/link';
import { CartItem } from '@/types';

interface PhysicsCheckoutProps {
  items: CartItem[];
  orderId: string;
}

export default function PhysicsCheckout({ items, orderId }: PhysicsCheckoutProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          MouseConstraint = Matter.MouseConstraint,
          Mouse = Matter.Mouse,
          World = Matter.World,
          Bodies = Matter.Bodies;
          
    const engine = Engine.create();
    const world = engine.world;
    
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio
      }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
    
    // Add walls
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true, render: { fillStyle: 'transparent' } });
    const wallLeft = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, render: { fillStyle: 'transparent' } });
    const wallRight = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, render: { fillStyle: 'transparent' } });
    
    World.add(world, [ground, wallLeft, wallRight]);
    
    // Add interactive mouse
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    World.add(world, mouseConstraint);
    render.mouse = mouse;

    // Helper to generate a text texture for emojis or receipt
    const createTextTexture = (text: string, bgColor: string, textColor: string, isReceipt = false) => {
      const canvas = document.createElement('canvas');
      canvas.width = isReceipt ? 300 : 120;
      canvas.height = isReceipt ? 500 : 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        if (isReceipt) {
           // Draw receipt style
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           ctx.fillStyle = '#f4f4f5'; // Light gray background
           ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
           
           ctx.fillStyle = textColor;
           ctx.font = 'bold 24px monospace';
           ctx.textAlign = 'center';
           ctx.fillText('DOPAMINA BRASIL', canvas.width/2, 60);
           
           ctx.font = '20px monospace';
           ctx.fillText('PEDIDO FAKE', canvas.width/2, 100);
           
           ctx.textAlign = 'left';
           ctx.font = '16px monospace';
           ctx.fillText('Qtd  Item', 30, 150);
           ctx.fillText('-----------------', 30, 170);
           
           let y = 200;
           items.slice(0, 5).forEach((item: any) => {
             ctx.fillText(`${item.quantity}x ${item.shortName.substring(0, 12)}...`, 30, y);
             y += 30;
           });
           
           ctx.textAlign = 'center';
           ctx.font = 'bold 28px monospace';
           ctx.fillText('TOTAL: R$ 0,00', canvas.width/2, canvas.height - 60);
           ctx.font = '14px monospace';
           ctx.fillText('A fatura nunca chega!', canvas.width/2, canvas.height - 30);
           
        } else {
           // Draw emoji
           ctx.beginPath();
           ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
           ctx.fill();
           ctx.font = '60px Arial';
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 5);
        }
      }
      return canvas.toDataURL();
    };

    // Drop items
    const dropItems = () => {
      let delayAcc = 0;
      items.forEach((item) => {
        const qty = Math.min(item.quantity, 10);
        for(let i=0; i<qty; i++) {
          setTimeout(() => {
            const size = window.innerWidth < 600 ? 80 : 120;
            let renderOptions: any = {
              fillStyle: '#10b981',
            };
            
            if (item.localImage) {
              renderOptions = {
                sprite: {
                  texture: item.localImage,
                  xScale: size / 400, // Assuming base images are around 400px
                  yScale: size / 400
                }
              };
            } else if (item.image) {
              // Emoji fallback
              renderOptions = {
                sprite: {
                  texture: createTextTexture(item.image, '#f4f4f5', '#09090b'),
                  xScale: size / 120,
                  yScale: size / 120
                }
              };
            }

            const body = Bodies.rectangle(
              window.innerWidth / 2 + (Math.random() * 200 - 100), 
              -100, 
              size, size, 
              { 
                restitution: 0.6,
                friction: 0.1,
                render: renderOptions
              }
            );
            World.add(world, body);
          }, delayAcc);
          delayAcc += 150;
        }
      });

      // Drop the giant receipt at the end
      setTimeout(() => {
        const receiptWidth = window.innerWidth < 600 ? 250 : 300;
        const receiptHeight = window.innerWidth < 600 ? 400 : 500;
        const receipt = Bodies.rectangle(
          window.innerWidth / 2, -receiptHeight,
          receiptWidth, receiptHeight,
          {
            restitution: 0.2,
            frictionAir: 0.02,
            render: {
              sprite: {
                texture: createTextTexture('', '#09090b', '#09090b', true),
                xScale: 1,
                yScale: 1
              }
            }
          }
        );
        World.add(world, receipt);
      }, delayAcc + 1000);
    };
    
    dropItems();

    // Handle resize
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
      Matter.Body.setPosition(wallRight, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
    };
  }, [items, orderId]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <div ref={sceneRef} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />
      
      {/* UI Overlay */}
      <div className="absolute top-10 w-full text-center z-20 pointer-events-none px-4">
        <h1 className="font-[var(--font-display)] text-5xl md:text-7xl font-black text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
          BOOM! 💥
        </h1>
        <p className="mt-2 text-lg md:text-2xl text-neon font-black bg-background/80 inline-block px-4 py-1 rounded-full border border-neon/30 backdrop-blur-sm">
          Jogue os itens para o alto!
        </p>
      </div>

      <div className="absolute bottom-10 w-full flex flex-col sm:flex-row justify-center gap-4 z-20 px-4">
        <Link
          href={`/rastreamento/${orderId}`}
          className="rounded-2xl bg-neon px-8 py-4 text-center text-lg font-extrabold text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] transition hover:bg-neon-light hover:scale-105 active:scale-95 pointer-events-auto"
        >
          RASTREAR PEDIDO 📍
        </Link>
        <Link
          href="/"
          className="rounded-2xl border-2 border-border bg-card px-8 py-4 text-center text-lg font-extrabold text-foreground transition hover:border-neon hover:text-neon hover:scale-105 active:scale-95 pointer-events-auto"
        >
          COMPRAR MAIS 🛒
        </Link>
      </div>
    </div>
  );
}

import Hero from "@/components/Hero";
import ShowcaseGallery from "@/components/ShowcaseGallery";

export default function Home() {
  return (
    <main className="relative w-full flex flex-col min-h-screen">
      <Hero />
      <ShowcaseGallery />
    </main>
  );
}

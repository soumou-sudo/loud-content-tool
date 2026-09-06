import HomeHero from '@/components/home/HomeHero';
import HomeTools from '@/components/home/HomeTools';
import HomeProcess from '@/components/home/HomeProcess';
import HomeDetails from '@/components/home/HomeDetails';
import HomeLanguagePanel from '@/components/home/HomeLanguagePanel';

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <HomeHero />
        <HomeTools />
        <HomeLanguagePanel />
        <HomeProcess />
        <HomeDetails />
      </div>
    </div>
  );
}
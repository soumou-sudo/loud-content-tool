import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function HomeHero() {
  return (
    <section className="grid gap-12 border-b border-border pb-14 pt-12 md:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16 lg:pb-16">
      <div>
        <p className="mb-8 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground"><span className="h-1.5 w-1.5 bg-primary" />The creator’s language toolkit</p>
        <h1 className="font-heading text-[clamp(3.8rem,7.8vw,7rem)] font-medium leading-[0.94] tracking-[-0.065em] text-foreground">Make every<br />word <span className="text-primary">count.</span></h1>
        <p className="mb-8 mt-7 max-w-sm text-sm leading-7 text-muted-foreground">From spoken words to subtitles. From one language to another. Keep your voice. Reach further.</p>
        <div className="flex flex-wrap items-center gap-5 sm:gap-7">
          <Link to="/Subtitles" className="btn-primary inline-flex h-12 items-center gap-7 px-5 text-sm font-semibold">Generate subtitles<ArrowUpRight className="h-4 w-4" /></Link>
          <Link to="/Captions" className="inline-flex items-center gap-2 border-b border-border py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">Translate captions<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div aria-label="Illustration of spoken words becoming bilingual captions" className="relative min-w-0 border border-border bg-card p-6 sm:p-8 lg:mb-1">
        <div className="flex items-center justify-between border-b border-border pb-5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground"><span>Sound → meaning</span><span className="text-primary">EN / AR</span></div>
        <div className="my-7 flex h-12 items-center gap-1 overflow-hidden" aria-hidden="true">
          {[12,20,10,30,44,26,18,36,48,22,14,30,18,42,28,12,20,38,48,30,18,8,22,36,16,28,44,22,12,32,18,10,26,40,20,12].map((height, i) => <span key={i} className="min-w-0 flex-1 bg-primary/70" style={{ height }} />)}
        </div>
        <div className="border-t border-border py-6"><p className="mb-3 font-mono text-[10px] text-muted-foreground">01 / ENGLISH</p><p className="font-heading text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Your voice.<br />Without borders.</p></div>
        <div className="border-t border-border pt-5"><p className="mb-3 font-mono text-[10px] text-muted-foreground">02 / العربية</p><p lang="ar" dir="rtl" className="text-3xl leading-relaxed text-primary sm:text-4xl">صوتك. بلا حدود.</p></div>
        <div className="mt-7 flex justify-between border-t border-border pt-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span>One message. More possibilities.</span><span>LOUD.</span></div>
      </div>
    </section>
  );
}
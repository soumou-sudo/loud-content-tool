export default function HomeHero() {
  return (
    <section className="pb-10 pt-20 sm:pb-12 sm:pt-24">
      <p className="mb-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-1.5 w-1.5 bg-primary" />
        The creator’s language toolkit
      </p>
      <h1 className="max-w-6xl font-heading text-[clamp(3.35rem,6.8vw,6.2rem)] font-medium leading-[0.94] tracking-[-0.065em] text-foreground">
        Make every word <span className="text-primary">count.</span>
      </h1>
      <p className="mt-7 max-w-md text-sm leading-6 text-muted-foreground">
        From spoken words to subtitles. From one language to another. Keep your voice. Reach further.
      </p>
    </section>
  );
}
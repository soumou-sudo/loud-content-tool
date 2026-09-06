export default function HomeLanguagePanel() {
  const waveform = [18, 32, 26, 44, 29, 52, 35, 22, 47, 31, 56, 25, 41, 20, 49, 34, 60, 28, 45, 24, 54, 38, 19, 48, 30, 58, 27, 43, 21, 51, 36, 23, 46, 32, 55, 26, 40, 18, 50, 33, 59, 29, 44, 22, 53, 37, 25, 47, 31, 57, 28, 42, 20, 49, 34, 54, 24, 45, 30, 52];

  return (
    <section aria-label="Illustration of spoken words becoming bilingual captions" className="border border-border bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between border-b border-border pb-5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>Sound → meaning</span>
        <span className="text-primary">EN / AR</span>
      </div>
      <div className="my-5 flex h-12 items-center gap-1 overflow-hidden" aria-hidden="true">
        {waveform.map((height, index) => <span key={index} className="min-w-0 flex-1 bg-primary" style={{ height }} />)}
      </div>
      <div className="grid gap-6 border-y border-border py-5 sm:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-[9px] text-muted-foreground">01 / ENGLISH</p>
          <p className="font-heading text-3xl font-medium tracking-[-0.045em]">Your voice. Without borders.</p>
        </div>
        <div>
          <p className="mb-3 font-mono text-[9px] text-muted-foreground">02 / العربية</p>
          <p lang="ar" dir="rtl" className="text-3xl leading-tight text-primary">صوتك. بلا حدود.</p>
        </div>
      </div>
      <div className="flex justify-between pt-5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
        <span>One message. More possibilities.</span>
        <span>LOUD.</span>
      </div>
    </section>
  );
}
const steps = [
  ['Choose a tool', 'Subtitles for your footage. Translation for your captions.'],
  ['Add your content', 'Upload a video or audio file, or paste your caption.'],
  ['Make it yours', 'Set your language, style, and context. Let AI do the first pass.'],
  ['Review & export', 'Refine the words. Download SRT or VTT, or copy your caption.'],
];

export default function HomeProcess() {
  return (
    <section className="border-b border-border py-12 sm:py-14">
      <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">The process</p>
      <h2 className="mb-9 font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">Less busywork. More creating.</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([title, description], index) => (
          <article key={title} className="min-h-[168px] border border-border bg-card p-6">
            <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
            <h3 className="mb-2 mt-6 text-sm font-medium">{title} —</h3>
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
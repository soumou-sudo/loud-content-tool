const steps = [
  ['Choose a tool', 'Subtitles for your footage. Translation for your captions.'],
  ['Add your content', 'Upload a video or audio file, or paste your caption.'],
  ['Make it yours', 'Set your language, style, and context. Let AI do the first pass.'],
  ['Review & export', 'Refine the words. Download SRT or VTT, or copy your caption.'],
];
export default function HomeProcess() {
  return (
    <section className="grid gap-8 border-y border-border py-10 lg:grid-cols-[1fr_3fr] lg:gap-12">
      <div><p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-primary">The process</p><h2 className="font-heading text-2xl font-medium tracking-[-0.04em]">Less busywork.<br />More creating.</h2></div>
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([title, description], index) => <div key={title}><span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span><h3 className="mb-2 mt-4 text-sm font-medium">{title}</h3><p className="text-xs leading-6 text-muted-foreground">{description}</p></div>)}
      </div>
    </section>
  );
}
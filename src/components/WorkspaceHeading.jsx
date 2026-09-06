export default function WorkspaceHeading({ number, label, title, description }) {
  return (
    <header className="mb-10 border-b border-border pb-8 sm:mb-12 sm:pb-10">
      <div className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.18em]">
        <span className="text-primary">{number}</span><span className="h-px w-8 bg-border" /><span className="text-muted-foreground">{label}</span>
      </div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="font-heading text-4xl font-medium tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl">{title}<span className="text-primary">.</span></h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:pb-1">{description}</p>
      </div>
    </header>
  );
}
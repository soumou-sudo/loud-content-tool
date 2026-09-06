import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function HomeDetails() {
  return (
    <>
      <section className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[['AI-assisted precision', 'A first draft you can fine-tune.'], ['Language, with context', 'Arabic and English. Your way.'], ['Made for your workflow', 'Standard SRT and VTT formats.'], ['Ready when you are', 'Download and put your words to work.']].map(([title, text]) => <div key={title}><h3 className="mb-2 text-xs font-medium">{title}</h3><p className="text-xs leading-5 text-muted-foreground">{text}</p></div>)}
      </section>
      <section className="mb-14 flex flex-col gap-8 bg-primary p-7 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div><p className="mb-3 text-[10px] font-medium uppercase tracking-[0.15em]">Your next piece starts here</p><h2 className="font-heading text-3xl font-medium tracking-[-0.05em] sm:text-4xl">Let your words travel.</h2></div>
        <div className="flex flex-col items-start gap-4 text-sm font-medium"><Link to="/Subtitles" className="inline-flex items-center gap-6 border-b border-primary-foreground/40 pb-2">Start with subtitles<ArrowUpRight className="h-4 w-4" /></Link><Link to="/Captions" className="inline-flex items-center gap-3">Translate a caption<ArrowUpRight className="h-4 w-4" /></Link></div>
      </section>
    </>
  );
}
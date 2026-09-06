import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const benefits = [
  ['AI-assisted precision', 'A first draft you can fine-tune.'],
  ['Language, with context', 'Arabic and English. Your way.'],
  ['Made for your workflow', 'Standard SRT and VTT formats.'],
  ['Ready when you are', 'Download and put your words to work.'],
];

export default function HomeDetails() {
  return (
    <>
      <section className="py-12 sm:py-14">
        <h2 className="mb-9 font-heading text-3xl font-medium tracking-[-0.045em]">Benefits</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([title, text]) => <div key={title}><h3 className="mb-3 text-sm font-medium">{title} —</h3><p className="text-xs leading-5 text-muted-foreground">{text}</p></div>)}
        </div>
      </section>
      <section className="mb-16 flex flex-col gap-8 bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div><p className="mb-3 text-[9px] font-medium uppercase tracking-[0.16em]">Your next piece starts here</p><h2 className="font-heading text-3xl font-medium tracking-[-0.05em] sm:text-4xl">Let your words travel.</h2></div>
        <div className="flex min-w-52 flex-col items-stretch gap-4 text-xs font-medium">
          <Link to="/Subtitles" className="flex items-center justify-between border-b border-primary-foreground/40 pb-3">Start with subtitles<ArrowUpRight className="h-4 w-4" /></Link>
          <Link to="/Captions" className="flex items-center justify-between">Translate a caption<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
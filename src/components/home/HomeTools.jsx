import { Link } from 'react-router-dom';
import { ArrowUpRight, Captions, Languages } from 'lucide-react';

const tools = [
  { number: '01', title: 'Subtitles', description: 'Turn your audio and video into editable, time-synced subtitles. Ready for your next cut.', detail: 'VIDEO & AUDIO → SRT / VTT', route: '/Subtitles', icon: Captions },
  { number: '02', title: 'Caption translation', description: 'English to Arabic. Arabic to English. The right dialect, tone, and context for your audience.', detail: 'ENGLISH ↔ ARABIC', route: '/Captions', icon: Languages },
];
export default function HomeTools() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mb-7 flex items-end justify-between gap-4"><h2 className="font-heading text-2xl font-medium tracking-[-0.04em] sm:text-3xl">Two tools. Zero friction.</h2><span className="hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">The workspace / 01—02</span></div>
      <div className="grid border-l border-t border-border md:grid-cols-2">
        {tools.map(({ icon: Icon, ...tool }) => (
          <Link key={tool.number} to={tool.route} className="group flex flex-col border-b border-r border-border bg-card p-6 transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:p-8">
            <div className="mb-10 flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">/{tool.number}</span><Icon className="h-6 w-6 text-primary" strokeWidth={1.4} /></div>
            <h3 className="font-heading text-2xl font-medium tracking-[-0.035em] sm:text-3xl">{tool.title}</h3>
            <p className="mb-8 mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{tool.description}</p>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-5"><span className="text-[9px] font-medium tracking-[0.12em] text-muted-foreground">{tool.detail}</span><ArrowUpRight className="h-5 w-5 text-primary" strokeWidth={1.5} /></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
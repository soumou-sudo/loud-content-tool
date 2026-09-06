import { Link } from 'react-router-dom';
import { ArrowUpRight, Captions, Languages } from 'lucide-react';

const tools = [
  { number: '01', title: 'Subtitles', description: 'Turn your audio and video into editable, time-synced subtitles. Ready for your next cut.', detail: 'VIDEO & AUDIO → SRT / VTT', action: 'Generate subtitles', route: '/Subtitles', icon: Captions },
  { number: '02', title: 'Caption translation', description: 'English to Arabic. Arabic to English. The right dialect, tone, and context for your audience.', detail: 'ENGLISH ↔ ARABIC', action: 'Translate captions', route: '/Captions', icon: Languages },
];
const waveform = [14,28,19,42,25,54,34,20,46,60,27,15,38,49,24,58,36,18,44,29,52,22,37,55,31,17,45,26,61,33,20,48,29,42,16,35,52,24,40,18,47,31,56,27];

export default function HomeTools() {
  return (
    <section className="pb-14">
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map(({ icon: Icon, ...tool }) => (
          <article key={tool.number} className="flex min-h-[410px] flex-col border border-border bg-card p-7 sm:p-8">
            <div className="flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">/{tool.number}</span><Icon className="h-5 w-5 text-primary" strokeWidth={1.4} /></div>
            <div className="my-10 flex h-16 items-center gap-1 overflow-hidden opacity-45" aria-hidden="true">
              {waveform.map((height, index) => <span key={index} className="min-w-0 flex-1 border border-muted-foreground" style={{ height }} />)}
            </div>
            <h2 className="font-heading text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{tool.title}</h2>
            <p className="mb-5 mt-3 max-w-md text-sm leading-6 text-muted-foreground">{tool.description}</p>
            <p className="mb-6 text-[9px] font-medium tracking-[0.13em] text-muted-foreground">{tool.detail}</p>
            <div className="mt-auto flex items-end justify-between">
              <Link to={tool.route} className="btn-primary inline-flex h-11 items-center gap-5 px-4 text-xs font-semibold">{tool.action}<ArrowUpRight className="h-4 w-4" /></Link>
              <ArrowUpRight className="h-5 w-5 text-primary" strokeWidth={1.4} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
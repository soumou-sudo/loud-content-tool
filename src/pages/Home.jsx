import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Video, 
  Type, 
  Zap, 
  Globe, 
  FileText, 
  Download,
  ArrowRight,
  Sparkles,
  Upload 
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Video,
      title: "Video Subtitles",
      description: "Upload videos and get accurate AI-generated subtitles with precise timestamps",
      route: "Subtitles"
    },
    {
      icon: Type,
      title: "Caption Translation",
      description: "Translate captions between Arabic and English with full customization",
      route: "Captions"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "AI-Powered Accuracy",
      description: "Advanced AI ensures high-quality subtitles and translations"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Seamless Arabic-English translation with cultural context"
    },
    {
      icon: FileText,
      title: "Export Ready",
      description: "Download subtitles in standard .srt and .vtt formats"
    },
    {
      icon: Download,
      title: "Instant Download",
      description: "Get your processed content ready for immediate use"
    }
  ];

  // Replaced stats with steps
  const steps = [
    {
      icon: Video,
      title: "1. Choose a Tool",
      description: "Pick Subtitles for videos or Captions for translation."
    },
    {
      icon: Upload,
      title: "2. Add Your Content",
      description: "Upload a video (MP4/MOV) or paste your caption text."
    },
    {
      icon: Sparkles,
      title: "3. Configure & Run",
      description: "Select language, style, and context, then let AI process."
    },
    {
      icon: Download,
      title: "4. Review & Export",
      description: "Edit if needed, then download SRT/VTT or copy/save."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <section className="px-4 pb-16 pt-8 sm:px-6 lg:px-8 section-fade">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl pt-6 sm:pt-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 pill mb-8 text-sm font-medium shadow-[0_8px_24px_rgba(215,180,123,0.18)]">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Content Creation</span>
            </div>

            <h1 className="max-w-5xl text-[3.4rem] font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-[4.6rem] lg:text-[5.8rem]">
              Transform Your Content
              <span className="block text-white">with <span className="text-[#e3c086]">AI Subtitles &amp; Captions</span></span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#c7c1ba] sm:text-[1.55rem] sm:leading-10">
              Professional subtitle generation and intelligent caption translation designed for marketers, creators, and social media managers.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to={createPageUrl("Subtitles")}>
                <Button className="btn-primary h-14 min-w-[220px] rounded-full px-7 text-lg font-medium">
                  Generate Subtitles
                </Button>
              </Link>
              <Link to={createPageUrl("Captions")}>
                <Button variant="outline" className="btn-outline-dark h-14 min-w-[220px] rounded-full px-7 text-lg font-medium">
                  Translate Captions
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`premium-panel panel-border-glow relative min-h-[176px] rounded-[18px] border border-white/20 p-5 text-left ${index % 2 === 1 ? 'md:translate-y-16' : ''}`}
                style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10), transparent 38%), linear-gradient(180deg, rgba(49,49,49,0.95) 0%, rgba(24,24,24,0.96) 100%)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#2a2a2a] text-[#e5c48d] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <step.icon className="h-9 w-9" />
                  </div>
                  <div className="text-[5rem] font-semibold leading-none tracking-[-0.08em] text-white/18">{index + 1}</div>
                </div>
                <div className="mt-6 text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white">{step.title.replace(/^\d+\.\s*/, '')}</div>
                <div className="mt-3 max-w-[18ch] text-base leading-6 text-[#d1cbc3]">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8 section-fade">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">Choose Your Creative Path</h2>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-[#cbc4bc]">
              Two powerful tools designed to enhance your content creation workflow
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index} className="premium-panel group overflow-hidden rounded-[22px] border border-white/20 bg-transparent">
                <CardHeader className="p-4">
                  <div className="rounded-[18px] border border-white/15 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(180deg,rgba(50,50,50,0.95),rgba(24,24,24,0.96))] p-6 sm:p-8">
                    <div className="flex items-start gap-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#2c2b29] text-[#e5c48d] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <feature.icon className="h-10 w-10" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[2.15rem] font-semibold leading-tight tracking-[-0.05em] text-white">{feature.title}</h3>
                        <p className="mt-2 max-w-md text-lg leading-7 text-[#cbc4bc]">{feature.description}</p>
                        <Link to={createPageUrl(feature.route)}>
                          <Button variant="ghost" className="mt-6 h-auto p-0 text-lg font-medium text-[#e3c086] hover:bg-transparent hover:text-[#f3d49d]">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 section-fade">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="premium-panel flex items-center overflow-hidden rounded-[18px] border border-white/14 bg-[linear-gradient(180deg,rgba(45,45,45,0.94),rgba(26,26,26,0.98))]">
              <div className="flex h-full w-[132px] shrink-0 items-center justify-center bg-[#333230] text-[#e5c48d]">
                <benefit.icon className="h-14 w-14" />
              </div>
              <div className="p-6">
                <h3 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-white">{benefit.title}</h3>
                <p className="mt-2 max-w-md text-lg leading-7 text-[#cbc4bc]">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 section-fade">
        <div
          className="bg-cover bg-center bg-no-repeat px-4 py-20 sm:px-6 lg:px-8"
          style={{ backgroundImage: 'url(https://media.base44.com/images/public/68c6af28339af22cb8af23d6/d8aed94de_generated_image.png)' }}
        >
          <div className="mx-auto max-w-6xl text-center text-black">
            <h2 className="text-[3.4rem] font-semibold leading-[0.98] tracking-[-0.07em] sm:text-[4.7rem]">Ready to Transform Your Content?</h2>
            <p className="mx-auto mt-4 max-w-4xl text-xl leading-8 text-black/80">
              Professional subtitle generation and intelligent caption translation designed for marketers, creators, and social media managers.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to={createPageUrl("Subtitles")}>
                <Button className="btn-primary h-14 min-w-[220px] rounded-full px-7 text-lg font-medium">
                  Start with Subtitles
                </Button>
              </Link>
              <Link to={createPageUrl("Captions")}>
                <Button variant="outline" className="h-14 min-w-[220px] rounded-full border border-[#cba76f] bg-white/55 px-7 text-lg font-medium text-[#755b31] backdrop-blur-md hover:bg-white/70">
                  Try Caption Translation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
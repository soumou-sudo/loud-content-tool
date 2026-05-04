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
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 section-fade border-b border-white/8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.3fr_0.7fr] gap-10 items-end">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 pill">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium tracking-[0.12em] uppercase">Creative Suite</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold mb-6 leading-[0.95] tracking-[-0.04em] text-white">
                Create sharper
                <span className="block text-white/55">subtitles and captions.</span>
              </h1>

              <p className="text-base md:text-lg text-gray-300/90 mb-12 max-w-2xl leading-relaxed">
                A cleaner workflow for transcription, translation, editing, and export — built for modern content teams and creators.
              </p>
            </div>

            <div className="premium-panel rounded-[32px] p-6 lg:p-8 text-left border border-white/10">
              <div className="text-xs uppercase tracking-[0.18em] text-white/50 mb-4">What you can do</div>
              <div className="space-y-4 text-sm text-white/80">
                <div className="flex items-start gap-3 border-b border-white/8 pb-4"><span className="text-white">01</span><span>Generate timestamped subtitles from audio or video.</span></div>
                <div className="flex items-start gap-3 border-b border-white/8 pb-4"><span className="text-white">02</span><span>Translate captions with better control over tone and style.</span></div>
                <div className="flex items-start gap-3"><span className="text-white">03</span><span>Review, refine, and export in a clean workspace.</span></div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-start max-w-6xl mx-auto mb-16 mt-10">
            <Link to={createPageUrl("Subtitles")}>
              <Button className="btn-primary h-12 sm:h-14 px-6 sm:px-8 rounded-xl min-w-[220px] justify-center">
                <Video className="w-5 h-5 mr-2" />
                Generate Subtitles
              </Button>
            </Link>
            <Link to={createPageUrl("Captions")}>
              <Button variant="outline" className="btn-outline-dark h-12 sm:h-14 px-6 sm:px-8 rounded-xl min-w-[220px] justify-center">
                <Type className="w-5 h-5 mr-2" />
                Translate Captions
              </Button>
            </Link>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto pt-10 border-t border-white/8">
            {steps.map((step, index) => (
              <div key={index} className="text-left premium-panel hover-lift rounded-[24px] p-5 border border-white/8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}
                >
                  <step.icon className="w-6 h-6 text-black" />
                </div>
                <div className="text-lg font-semibold text-white">{step.title}</div>
                <div className="text-sm text-gray-300 mt-1">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 section-fade border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/45 mb-4">Tools</div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white mb-3">
                Built for speed and clarity.
              </h2>
            </div>
            <p className="text-base md:text-lg text-gray-300 max-w-xl">
              Two focused tools, designed as a clean professional workspace instead of a flashy landing page.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden premium-panel hover-lift rounded-[32px] border border-white/8 transition-all duration-300">
                <CardHeader className="p-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300"
                    style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}
                  >
                    <feature.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">{feature.description}</p>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <Link to={createPageUrl(feature.route)}>
                    <Button
                      variant="outline"
                      className="w-full btn-outline-dark h-12 justify-center"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 section-fade border-b border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.16em] text-white/45 mb-4">Why it works</div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white">A more refined workflow.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-left group premium-panel rounded-[24px] p-8 hover-lift border border-white/8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}
                >
                  <benefit.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 section-fade">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[32px] p-8 md:p-12 text-white premium-panel border border-white/8">
            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/45 mb-4">Get started</div>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] mb-4">
                  Use the tools. Ship faster.
                </h2>
                <p className="text-base md:text-lg text-gray-300 max-w-2xl">
                  Start with subtitles or jump straight into caption translation with a cleaner, faster interface.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                <Link to={createPageUrl("Subtitles")}>
                  <Button className="btn-primary h-12 sm:h-14 px-6 sm:px-8 rounded-xl min-w-[220px] justify-center">
                    <Video className="w-5 h-5 mr-2" />
                    Start with Subtitles
                  </Button>
                </Link>
                <Link to={createPageUrl("Captions")}>
                  <Button variant="outline" className="btn-outline-dark h-12 sm:h-14 px-6 sm:px-8 rounded-xl min-w-[220px] justify-center">
                    <Type className="w-5 h-5 mr-2" />
                    Try Caption Translation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
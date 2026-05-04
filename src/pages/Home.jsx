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
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 section-fade">
        <div className="hero-orb w-72 h-72 bg-yellow-400/30 top-8 left-[-4rem]" />
        <div className="hero-orb w-80 h-80 bg-white/10 top-0 right-[-5rem]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 pill shadow-[0_0_40px_rgba(250,204,21,0.08)]">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium tracking-[0.02em]">AI-Powered Content Creation</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] text-white max-w-5xl mx-auto">
            Transform Your Content with
            <span className="gradient-text block mt-2">AI Subtitles & Captions</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional subtitle generation and intelligent caption translation 
            designed for marketers, creators, and social media managers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-left premium-panel panel-border-glow hover-lift rounded-[24px] p-5">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-fade">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Creative Path
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Two powerful tools designed to enhance your content creation workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden premium-panel panel-border-glow hover-lift rounded-[28px] transition-all duration-300">
                <CardHeader className="p-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-fade">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group premium-panel panel-border-glow rounded-[24px] p-8 hover-lift">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 section-fade">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-[32px] p-12 text-white premium-panel panel-border-glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Join thousands of creators using AI-powered subtitles and translations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </section>
    </div>
  );
}
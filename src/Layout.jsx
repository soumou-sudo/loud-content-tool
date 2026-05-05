import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Video,
  Type,
  Home,
  History,
  User as UserIcon,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const glowRef = useRef(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const checkUser = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    await base44.auth.redirectToLogin(window.location.href);
  };

  const handleLogout = async () => {
    await base44.auth.logout(window.location.origin + createPageUrl("Home"));
    setUser(null);
  };

  const navigationItems = [
    {
      title: "Home",
      url: createPageUrl("Home"),
      icon: Home,
      description: "Main dashboard"
    },
    {
      title: "Subtitles",
      url: createPageUrl("Subtitles"),
      icon: Video,
      description: "Video subtitle generation"
    },
    {
      title: "Captions",
      url: createPageUrl("Captions"),
      icon: Type,
      description: "Caption translation studio"
    },
    {
      title: "History",
      url: createPageUrl("History"),
      icon: History,
      description: "Your translation history"
    }
  ];


  return (
    <div className="min-h-screen bg-black">
      <style>{`
        /* Typography (modern, sleek) */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --bg-pitch: #000000;
          --bg-deep: #0a0a0a;
          --bg-panel: rgba(255,255,255,0.04);
          --border-subtle: rgba(255,255,255,0.08);
          --text-primary: #ffffff;
          --text-secondary: #b3b3b3;
          --accent-yellow: #f5d90a;
          --accent-yellow-strong: #facc15;
          --shadow-soft: 0 10px 30px rgba(0,0,0,0.35);
        }

        * { box-sizing: border-box; }

        html, body {
          background: var(--bg-pitch);
          color: var(--text-primary);
          font-family: "Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          letter-spacing: 0.1px;
        }

        /* Surfaces */
        .glass-effect {
          background: rgba(17, 17, 17, 0.72);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.32);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff7bf 0%, var(--accent-yellow) 42%, var(--accent-yellow-strong) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .premium-panel {
          background: linear-gradient(180deg, rgba(38,38,38,0.9) 0%, rgba(21,21,21,0.92) 100%);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 50px rgba(0,0,0,0.38);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .panel-border-glow {
          position: relative;
          overflow: hidden;
        }

        .hero-orb {
          display: none;
        }

        /* Utility + motion */
        .hover-lift {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.34);
        }

        .btn-primary {
          background: linear-gradient(180deg, #6f6a62 0%, #2a251f 100%);
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.28) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.28), 0 12px 32px rgba(221, 184, 120, 0.26);
          transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
        }
        .btn-primary:hover {
          filter: brightness(1.05);
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.32), 0 16px 34px rgba(221, 184, 120, 0.34);
        }

        .btn-outline-dark {
          border: 1px solid rgba(226, 195, 138, 0.9) !important;
          background: rgba(16,16,16,0.42) !important;
          color: #e8c992 !important;
          transition: background 180ms ease, transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .btn-outline-dark:hover {
          background: rgba(226,195,138,0.08) !important;
          border-color: rgba(226,195,138,1) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(226,195,138,0.16);
        }

        .pill {
          border: 1px solid rgba(226, 195, 138, 0.95);
          background: #d7b47b;
          color: #17130d;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.28);
        }

        .nav-link {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          color: #d1d1d1;
          transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;
        }
        .nav-link:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(250,204,21,0.28);
          color: #fff;
          transform: translateY(-2px);
        }
        .nav-link-active {
          background: linear-gradient(135deg, var(--accent-yellow), var(--accent-yellow-strong));
          color: #0a0a0a;
          border: 1px solid transparent;
        }

        .section-fade {
          animation: fadeIn 450ms ease forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        ::selection {
          background: var(--accent-yellow-strong);
          color: #111;
        }

        /* Page route transition (smoother navigation) */
        .route-transition {
          animation: routeFadeUp 320ms ease-out forwards;
          opacity: 0;
          transform: translateY(6px);
        }
        @keyframes routeFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Smooth scrolling for the whole app */
        html { scroll-behavior: smooth; }

        /* Input focus ring refinement */
        .focus-ring-yellow:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.35);
          border-color: rgba(250, 204, 21, 0.65);
        }
      `}</style>

      {/* Additional styles for the cursor glow */}
      <style>{`
        .cursor-glow {
          display: none;
        }

        /* Hide on touch devices */
        @media (hover: none), (pointer: coarse) {
          .cursor-glow { display: none; }
        }

        /* Respect reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          .cursor-glow { display: none !important; }
        }
      `}</style>

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`max-w-7xl mx-auto transition-all duration-300 ${isScrolled ? 'glass-effect rounded-2xl border border-white/10 px-4 sm:px-6 shadow-[0_20px_60px_rgba(0,0,0,0.42)]' : 'px-0'}`}>
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                   style={{ background: 'linear-gradient(135deg, var(--accent-yellow), var(--accent-yellow-strong))' }}>
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white tracking-[-0.02em]">Loud Content Tool</h1>
                <p className="text-xs text-[#b5afa7] -mt-1">High-end content tools</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-b transition-all duration-200 ${isActive ? 'text-[#f0d198] border-[#f0d198]' : 'text-[#c8c2ba] border-transparent hover:text-white hover:border-white/30'}`}
                  >
                    <span className="font-medium text-[15px]">{item.title}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-3">
              {!isLoading && (
                <div className="hidden md:block">
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center"
                               style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}>
                            <UserIcon className="w-4 h-4 text-black" />
                          </div>
                          <span className="font-medium">{user.full_name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#0f0f0f] border-[var(--border-subtle)] text-white">
                        <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/5 focus:bg-white/5">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      variant="ghost"
                      className="font-medium text-[#f0d198] hover:bg-transparent hover:text-white"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-[var(--border-subtle)] py-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl hover-lift ${isActive ? 'nav-link-active' : 'nav-link'}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm opacity-70">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Menu */}
              {!isLoading && (
                <div className="border-t border-[var(--border-subtle)] mt-4 pt-4">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                             style={{ background: 'linear-gradient(135deg, #f5d90a, #facc15)' }}>
                          <UserIcon className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-medium text-white">{user.full_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start px-4 btn-outline-dark"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      className="w-full font-medium btn-primary"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-black">
        <div key={location.pathname} className="route-transition">
          {children}
        </div>
      </main>


      {/* Footer */}
      <footer className="py-8 mt-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, var(--accent-yellow), var(--accent-yellow-strong))' }}>
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="font-semibold text-white">Loud Content Tool</div>
                <div className="text-xs text-[#b5afa7]">Professional subtitle generation and intelligent tools.</div>
              </div>
            </div>
            <div className="text-sm text-[#b5afa7]">
              © 2024 Loud Content Tool. Crafted for creators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
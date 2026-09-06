import { useState, useEffect } from "react";
import StudioBrand from '@/components/StudioBrand';
import StudioFooter from '@/components/StudioFooter';
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
  X
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

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      url: "/",
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
    <div className="dark min-h-screen bg-background font-body text-foreground">
      {/* Navigation Header */}
      <nav aria-label="Main navigation" className={`studio-nav sticky top-0 z-50 border-b border-border bg-background ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex h-20 justify-between items-center gap-5">
            {/* Logo */}
            <StudioBrand />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url || (item.title === 'Home' && location.pathname === '/Home');
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`studio-nav-link ${isActive ? 'studio-nav-link-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.title}</span>
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
                          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-secondary">
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="max-w-32 truncate text-xs font-medium">{user.full_name}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border-border text-popover-foreground">
                        <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/5 focus:bg-white/5">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      className="font-medium btn-primary"
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
                aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={isMobileMenuOpen}
                className="md:hidden text-foreground hover:bg-secondary"
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
                  const isActive = location.pathname === item.url || (item.title === 'Home' && location.pathname === '/Home');
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
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-secondary">
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
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
      <main className="min-h-[70vh] bg-background">
        <div key={location.pathname}>
          {children}
        </div>
      </main>


      <StudioFooter />
    </div>
  );
}
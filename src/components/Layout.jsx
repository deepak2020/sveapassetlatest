import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Landmark, BarChart3, Home, Menu, X, LogIn, LogOut, User, FlaskConical, Flame, Zap, LayoutDashboard, Dumbbell, BookMarked } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  { path: "/", label: "Hem", icon: Home },
  { path: "/dashboard", label: "Översikt", icon: LayoutDashboard },
  { path: "/language", label: "Språk", icon: BookOpen },
  { path: "/civic", label: "Samhälle", icon: Landmark },
  { path: "/gym", label: "Träning", icon: Dumbbell },
  { path: "/my-vocabulary", label: "Min Ordlista", icon: BookMarked },
  { path: "/progress", label: "Framsteg", icon: BarChart3 },
  { path: "/profile", label: "Profil", icon: User },
];

const bottomTabItems = [
  { path: "/dashboard", label: "Hem", icon: LayoutDashboard },
  { path: "/language", label: "Lär dig", icon: BookOpen },
  { path: "/civic", label: "Samhälle", icon: Landmark },
  { path: "/gym", label: "Träning", icon: Dumbbell },
  { path: "/profile", label: "Profil", icon: User },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    enabled: isAuthenticated,
  });

  // Redirect new users to onboarding (skip for admins)
  useEffect(() => {
    if (userProfile && !userProfile.onboarding_complete && userProfile.role !== "admin" && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    }
    // Redirect authenticated users away from landing page to dashboard
    if (userProfile && location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [userProfile, location.pathname]);

  const xp = userProfile?.xp_total || 0;
  const streak = userProfile?.streak_days || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-semibold text-lg text-foreground tracking-tight">Sveapasset</span>
                <span className="text-xs text-muted-foreground block -mt-1">Din väg till svenskt medborgarskap · <em>Your path to Swedish citizenship</em></span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth buttons (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                      <Flame className="w-4 h-4" /> {streak}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-lg">
                    <Zap className="w-4 h-4" /> {xp.toLocaleString()} XP
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Logga ut
                    </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Logga in
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 pb-3 pt-1 border-t border-border/50">
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={() => logout()} className="w-full justify-start gap-2">
                  <LogOut className="w-4 h-4" />
                  Logga ut ({user?.full_name || user?.email})
                </Button>
              ) : (
                <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  Logga in / Skapa konto
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile) */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50">
          <div className="flex items-center justify-around px-2 py-2">
            {bottomTabItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
              return (
                <Link key={item.path} to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-20 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">S</span>
              </div>
              <span className="font-display font-semibold text-foreground">Sveapasset</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Lycka till med dina studier! · <em>Good luck with your studies!</em>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
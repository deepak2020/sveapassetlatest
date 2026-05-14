import { Outlet, Link, useLocation } from "react-router-dom";
import { BookOpen, Landmark, BarChart3, Home, Menu, X, LogIn, LogOut, User, FlaskConical } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/language", label: "Language", icon: BookOpen },
  { path: "/language-test", label: "Tests", icon: FlaskConical },
  { path: "/civic", label: "Civic Test", icon: Landmark },
  { path: "/progress", label: "Progress", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

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
                <span className="font-display font-semibold text-lg text-foreground tracking-tight">SvenskVägen</span>
                <span className="text-xs text-muted-foreground block -mt-1">Your path to Swedish citizenship</span>
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
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {user?.full_name || user?.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign in
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
                  Log out ({user?.full_name || user?.email})
                </Button>
              ) : (
                <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign in / Create account
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

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">S</span>
              </div>
              <span className="font-display font-semibold text-foreground">SvenskVägen</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Lycka till med dina studier! — Good luck with your studies!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
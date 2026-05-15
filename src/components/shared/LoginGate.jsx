import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LoginGate({ children, message = "Log in to continue" }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 px-4 bg-muted/40 rounded-xl border border-border">
        <p className="text-foreground font-medium mb-4">{message}</p>
        <Button onClick={() => base44.auth.redirectToLogin(window.location.pathname)} className="gap-2">
          <LogIn className="w-4 h-4" />
          Logga in
        </Button>
      </div>
    );
  }

  return children;
}
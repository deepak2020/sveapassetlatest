import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.search).then(() => {
      const next = new URLSearchParams(window.location.search).get('next') || '/dashboard';
      navigate(next, { replace: true });
    });
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

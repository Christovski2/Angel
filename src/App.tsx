import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";

import Login from "@/pages/login";
import Tasks from "@/pages/tasks";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// ── Эффект "Звездной пыли" (Космический фон) ──────────────────────────────
function Particles() {
  return (
    <div className="particles-container" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0, background: '#050505', overflow: 'hidden'
    }}>
      {[...Array(45)].map((_, i) => (
        <div 
          key={i} 
          className="particle" 
          style={{
            position: 'absolute',
            top: '-10px',
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            opacity: Math.random() * 0.7 + 0.3,
            boxShadow: '0 0 12px white',
            animation: `fall ${Math.random() * 12 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 8}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        
        /* 🔥 ФИОЛЕТОВОЕ НЕОНОВОЕ СВЕЧЕНИЕ ДЛЯ БЛОКОВ 🔥 */
        .task-card, [class*="card"], [class*="block"], [class*="dialog"] {
          border: 1px solid rgba(168, 85, 247, 0.5) !important;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.25) !important;
          background: rgba(10, 10, 15, 0.85) !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.3s ease;
          border-radius: 16px !important;
        }
        
        /* Яркое свечение при наведении */
        .task-card:hover, [class*="card"]:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.6) !important;
          border-color: rgba(168, 85, 247, 0.9) !important;
          transform: translateY(-2px);
        }

        /* Глобальный сброс фона для космоса */
        body {
          background-color: #050505 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}

// ── Экран загрузки (С эффектами) ──────────────────────────────────────────
function SplashScreen() {
  const { timedOut, retryAuth } = useAuth();

  if (timedOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 relative z-10">
        <Particles />
        <p className="text-muted-foreground text-sm">Не удалось подключиться к серверу.</p>
        <button
          onClick={retryAuth}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold transition-all relative z-10"
        >
          <RefreshCw className="w-4 h-4" />
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <Particles />
      <Loader2 className="h-8 w-8 text-primary animate-spin relative z-10" />
    </div>
  );
}

// ── Защищенный роут ─────────────────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) return <SplashScreen />;
  if (!user) return null;
  return (
    <>
      <Particles />
      <div className="relative z-10">
        <Component />
      </div>
    </>
  );
}

// ── Роутер ──────────────────────────────────────────────────────────────────
function Router() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user && location === "/login") {
      setLocation("/");
    }
  }, [user, isLoading, location, setLocation]);

  return (
    <Switch>
      <Route path="/login">
        {() => (
          <>
            <Particles />
            <div className="relative z-10"><Login /></div>
          </>
        )}
      </Route>
      <Route path="/">
        {() => <ProtectedRoute component={Tasks} />}
      </Route>
      <Route>
        {() => <ProtectedRoute component={Tasks} />}
      </Route>
    </Switch>
  );
}

// ── Корень приложения ───────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

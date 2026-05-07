import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { BillingProvider } from "@/context/BillingContext";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import InvestorDashboard from "@/pages/InvestorDashboard";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";
import PitchDetail from "@/pages/PitchDetail";

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎬</div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Page not found</h1>
      <a href="/" style={{ color: "#8b5cf6", fontSize: 14, fontWeight: 600 }}>← Back to PitchFlix</a>
    </div>
  );
}

function AppRoutes() {
  const { user, userProfile, authLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authLoading || !user) return;

    const redirect = localStorage.getItem("post_signup_redirect");
    if (redirect) {
      localStorage.removeItem("post_signup_redirect");
      navigate(`/${redirect}`);
      return;
    }

    if (userProfile && !userProfile.onboardingComplete) {
      const current = window.location.pathname;
      if (!current.includes("/onboarding")) navigate("/onboarding");
    }
  }, [user?.id, authLoading, userProfile?.onboardingComplete]);

  return (
    <BillingProvider userId={user?.id} userRole={userProfile?.role}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/investor" component={InvestorDashboard} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/settings" component={Settings} />
        <Route path="/pitch/:id" component={PitchDetail} />
        <Route component={NotFound} />
      </Switch>
    </BillingProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppRoutes />
      </WouterRouter>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#14141e",
            border: "1px solid rgba(124,58,237,0.35)",
            borderRadius: 14,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </AuthProvider>
  );
}

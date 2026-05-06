import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎬</div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Page not found</h1>
      <a href="/" style={{ color: "#e50914", fontSize: 14, fontWeight: 600 }}>← Back to PitchFlix</a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#14141e",
            border: "1px solid rgba(229,9,20,0.35)",
            borderRadius: 14,
            color: "#fff",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </AuthProvider>
  );
}

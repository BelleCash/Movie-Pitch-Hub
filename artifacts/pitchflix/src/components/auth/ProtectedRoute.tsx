import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: string;
}

export default function ProtectedRoute({ children, requiredRole, fallback = "/" }: ProtectedRouteProps) {
  const { user, userProfile, authLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate(fallback); return; }
    if (requiredRole && userProfile?.role !== requiredRole) navigate(fallback);
  }, [user, userProfile, authLoading, requiredRole, fallback, navigate]);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && userProfile?.role !== requiredRole) return null;

  return <>{children}</>;
}

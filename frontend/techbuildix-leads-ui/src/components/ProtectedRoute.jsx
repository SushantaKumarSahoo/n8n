import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { settingsApi } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (!user) return;
    settingsApi.status().then((data) => {
      setNeedsSetup(!data.configured);
    }).catch(() => {
      // if endpoint fails, let them through
    }).finally(() => {
      setChecking(false);
    });
  }, [user]);

  if (loading || (user && checking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06080f]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (needsSetup && location.pathname !== "/settings") {
    return <Navigate to="/settings" replace />;
  }

  return children;
}

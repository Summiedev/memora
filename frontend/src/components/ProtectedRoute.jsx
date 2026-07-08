import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/auth";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  useEffect(() => {
    let cancelled = false;
    api
      .get("/auth/profile")
      .then(() => {
        if (!cancelled) setAuthState("authenticated");
      })
      .catch(() => {
        if (!cancelled) setAuthState("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg,#fce4f3 0%,#e8d5ff 45%,#c7e8ff 100%)" }}>
        <Spinner />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Jobs from "./pages/Jobs";
import Hours from "./pages/Hours";
import Admin from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Landing from "./pages/Landing";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* ================= PROTECTED ROUTE ================= */
function Protected({ children, role }) {
  const { user } = useAuth(); // Hook into Context instead of localStorage

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role || "student";

  if (role && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/student"} replace />;
  }

  return children;
}

import { GoogleOAuthProvider } from '@react-oauth/google';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';

const isPopupCallback = typeof window !== "undefined" && !!window.opener && window.opener !== window && (window.location.hash.includes("code=") || window.location.hash.includes("error="));

const msalConfig = {
  auth: {
    clientId: "549fe3c8-1508-41d2-96dc-dd9ce0958c93",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  }
};

let msalInstance;
if (!isPopupCallback) {
  msalInstance = new PublicClientApplication(msalConfig);
}
const GOOGLE_CLIENT_ID = "698385902892-2ep0d484pu32cdb74h4ckatgbhi3fcn8.apps.googleusercontent.com";

export default function App() {
  const [msalReady, setMsalReady] = useState(false);
  
  useEffect(() => {
    if (isPopupCallback) return;
    msalInstance.initialize().then(() => {
      setMsalReady(true);
    }).catch(e => console.error("MSAL Init Error", e));

    // Listen for auth expiration events dispatched by api.js interceptor
    const handleAuthExpired = () => {
       alert("Your session has expired. Please log in again.");
       window.location.href = "/login";
    };
    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  if (isPopupCallback) {
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>Finalizing Microsoft Auth...</div>;
  }

  if (!msalReady) {
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>Initializing Authentication...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <BrowserRouter>
              <ThemeToggle />
              <Routes>
                {/* Landing */}
                <Route path="/" element={<Landing />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* STUDENT */}
                <Route
                  path="/student"
                  element={
                    <Protected role="student">
                      <StudentDashboard />
                    </Protected>
                  }
                />

                <Route
                  path="/jobs"
                  element={
                    <Protected role="student">
                      <Jobs />
                    </Protected>
                  }
                />

                <Route
                  path="/hours"
                  element={
                    <Protected role="student">
                      <Hours />
                    </Protected>
                  }
                />

                {/* ADMIN */}
                <Route
                  path="/admin"
                  element={
                    <Protected role="admin">
                      <Admin />
                    </Protected>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
      </MsalProvider>
    </GoogleOAuthProvider>
  );
}
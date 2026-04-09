import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Briefcase, Clock, LogOut, Sun, Moon } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Default to light theme as requested
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className={`premium-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container glass-panel">
        
        {/* Brand Logo */}
        <Link to={user.role === "student" ? "/student" : "/admin"} className="nav-brand-orb flex-row gap-2">
          <div className="gradient-orb anim-pulse"></div>
          <span className="text-h4 text-gradient" style={{ margin: 0 }}>WorkStudy</span>
        </Link>

        {/* Dynamic Center Navigation */}
        <div className="nav-pills flex-row gap-2">
          {user.role === "student" && (
            <>
              <Link to="/student" className={`nav-pill ${location.pathname === '/student' ? 'active' : ''}`}>
                {location.pathname === '/student' && <motion.div layoutId="navBubble" className="active-pill-bg" />}
                <span className="pill-text"><LayoutDashboard size={14}/> Dashboard</span>
              </Link>
              <Link to="/jobs" className={`nav-pill ${location.pathname === '/jobs' ? 'active' : ''}`}>
                 {location.pathname === '/jobs' && <motion.div layoutId="navBubble" className="active-pill-bg" />}
                 <span className="pill-text"><Briefcase size={14}/> Market</span>
              </Link>
              <Link to="/hours" className={`nav-pill ${location.pathname === '/hours' ? 'active' : ''}`}>
                 {location.pathname === '/hours' && <motion.div layoutId="navBubble" className="active-pill-bg" />}
                 <span className="pill-text"><Clock size={14}/> Hours</span>
              </Link>
            </>
          )}

          {user.role === "admin" && (
            <Link to="/admin" className="nav-pill active">
              <motion.div layoutId="navBubble" className="active-pill-bg" />
              <span className="pill-text"><LayoutDashboard size={14}/> Dashboard Overview</span>
            </Link>
          )}
        </div>

        {/* Right Controls */}
        <div className="nav-controls flex-row gap-4">
           <div className="nav-user-badge flex-row gap-2">
             <div className="avatar-mini flex-center text-sm font-bold shadow-sm">
                {user.name?.charAt(0) || "U"}
             </div>
             <span className="text-sm font-bold text-heading name-clip">
                {user.name?.split(" ")[0]}
             </span>
           </div>

           <button className="nav-icon-btn btn-secondary flex-center" onClick={handleLogout} title="Logout">
             <LogOut size={16}/>
           </button>
        </div>

      </div>
    </nav>
  );
}
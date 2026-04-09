import { useState, useEffect } from "react";
import { registerStudent } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ShieldCheck, ArrowRight, ShieldPlus, Zap } from "lucide-react";
import styles from './Auth.module.css';

import slide1 from '../assets/slide_auth_1.png';
import slide2 from '../assets/slide_auth_2.png';
import slide3 from '../assets/slide_auth_3.png';

const slideImages = [slide3, slide1, slide2]; 

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slideImages.length); }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert("Incomplete Data Profile");
    setLoading(true);
    try {
      await registerStudent({ name, email, password, role });
      alert("Registration Successful! Please proceed to the Login Portal.");
      navigate("/login");
    } catch { alert("Failed to initialize identity."); }
    finally { setLoading(false); }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 } }
  };

  return (
    <div className={styles.splitViewport}>
      {/* Right Side: Glassmorphic Form (Swapped sides for register) */}
      <div className={styles.formSide} style={{ order: 1 }}>
        <motion.div className={styles.authContainer} initial="hidden" animate="visible" variants={formVariants}>
          <div className={styles.brandHero}>
             <motion.div variants={{ hidden: { opacity:0 }, visible: { opacity: 1 } }}>
               <span className={styles.badge}><ShieldPlus size={14} color="#FF3366"/> NEW IDENTITY</span>
             </motion.div>
             <motion.h1 className="text-gradient" variants={{ hidden: { y: 20, opacity:0 }, visible: { y: 0, opacity: 1 } }}>
               Join Ecosystem
             </motion.h1>
             <motion.p className={styles.subtitle} variants={{ hidden: { opacity:0 }, visible: { opacity: 1 } }}>
               Initialize your profile to gain network access.
             </motion.p>
          </div>

          <form onSubmit={handleRegister} className={styles.authForm}>
            
            <motion.div className={styles.roleSelector} variants={formVariants}>
              <button type="button" className={role === "student" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("student")}>
                <User size={18}/> Student
              </button>
              <button type="button" className={role === "admin" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("admin")}>
                <ShieldCheck size={18}/> Administrator
              </button>
            </motion.div>

            <motion.div className={styles.inputGroup} variants={formVariants}>
              <label><User size={14} /> Full Name</label>
              <input type="text" placeholder="John Doe" onChange={e => setName(e.target.value)} required />
            </motion.div>

            <motion.div className={styles.inputGroup} variants={formVariants}>
              <label><Mail size={14} /> Email</label>
              <input type="email" placeholder="john@uni.edu" onChange={e => setEmail(e.target.value)} required />
            </motion.div>

            <motion.div className={styles.inputGroup} variants={formVariants}>
              <label><Lock size={14} /> Security Passphrase</label>
              <input type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} required />
            </motion.div>

            <motion.button type="submit" className={styles.submitBtn} variants={formVariants} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? <span className={styles.loader}></span> : <><Zap size={16}/> Deploy Identity <ArrowRight size={16}/></>}
            </motion.button>
          </form>

          <motion.p className={styles.switchLink} variants={formVariants}>
            Already initialized? <Link to="/login">Authenticate Here</Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Left Side (Actually right visual order because of order:1 above): Carousel */}
      <div className={styles.carouselSide} style={{ order: 2 }}>
        <AnimatePresence>
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className={styles.slideBg} style={{ backgroundImage: `url(${slideImages[currentSlide]})` }} 
          />
        </AnimatePresence>
        <div className={styles.carouselOverlay}>
          <h2>Accelerate your Journey</h2>
          <p>Gain access to exclusive deployments, track your progress, and build your professional profile.</p>
        </div>
      </div>
    </div>
  );
}
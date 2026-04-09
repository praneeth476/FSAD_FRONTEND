import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { loginStudent, oauthLoginStudent, verifyMfaStudent } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import styles from './Auth.module.css';

import slide1 from '../assets/slide_auth_1.png';
import slide2 from '../assets/slide_auth_2.png';
import slide3 from '../assets/slide_auth_3.png';

const slideImages = [slide1, slide2, slide3];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [role, setRoleState] = useState("student");
  const roleRef = useRef("student"); // Used to fix stale closure during OAuth async flow

  const setRole = (newRole) => {
    setRoleState(newRole);
    roleRef.current = newRole;
  };

  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { instance } = useMsal();

  useEffect(() => {
    const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slideImages.length); }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleOAuthSuccess = async (authEmail, authName, provider) => {
    setLoading(true);
    try {
      if (!authEmail) throw new Error("Google login succeeded but didn't return an email.");
      const activeRole = roleRef.current; // Guarantee fresh role reference
      const user = await oauthLoginStudent({ email: authEmail, name: authName, authProvider: provider, role: activeRole });
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
    } catch (err) { 
      console.error("Full Error:", err);
      alert("Verification Failed: " + err.message); 
    } 
    finally { setLoading(false); }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.data);
        handleOAuthSuccess(userInfo.email, userInfo.name, "GOOGLE");
      } catch (err) {
        console.error("Google Auth Error", err);
      }
    },
  });

  const loginMicrosoft = async () => {
    try {
      const response = await instance.loginPopup({ scopes: ["user.read"] });
      handleOAuthSuccess(response.account.username, response.account.name, "MICROSOFT");
    } catch (err) {
      console.error("Microsoft Auth Error", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mfaRequired) {
        // Step 2: Send OTP
        const user = await verifyMfaStudent({ email, code: mfaCode });
        localStorage.setItem("user", JSON.stringify(user));
        navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
      } else {
        // Step 1: Send Credentials
        const response = await loginStudent({ email, password });
        if (response.mfaRequired) {
          setMfaRequired(true);
        } else {
          localStorage.setItem("user", JSON.stringify(response));
          navigate(response.role === "admin" ? "/admin" : "/student", { replace: true });
        }
      }
    } catch { 
      alert(mfaRequired ? "Incorrect or Expired Security Code." : "Invalid Credentials Detected"); 
    } 
    finally { setLoading(false); }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 } }
  };

  return (
    <div className={styles.splitViewport}>
      {/* Left Side: Advanced Image Carousel */}
      <div className={styles.carouselSide}>
        <AnimatePresence>
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className={styles.slideBg} style={{ backgroundImage: `url(${slideImages[currentSlide]})` }} 
          />
        </AnimatePresence>
        <div className={styles.carouselOverlay}>
          <h2>Welcome back to the Ecosystem</h2>
          <p>Connecting ambition with opportunity in a seamless, professional environment.</p>
        </div>
      </div>

      {/* Right Side: Glassmorphic or Clean Form */}
      <div className={styles.formSide}>
        <motion.div className={styles.authContainer} initial="hidden" animate="visible" variants={formVariants}>
          <div className={styles.brandHero}>
             <motion.div variants={{ hidden: { opacity:0 }, visible: { opacity: 1 } }}>
               <span className={styles.badge}><ShieldCheck size={14} color="#FF3366"/> SECURE LOGIN</span>
             </motion.div>
             <motion.h1 className="text-gradient" variants={{ hidden: { y: 20, opacity:0 }, visible: { y: 0, opacity: 1 } }}>
               Entrance Portal
             </motion.h1>
             <motion.p className={styles.subtitle} variants={{ hidden: { opacity:0 }, visible: { opacity: 1 } }}>
               Authenticate to resume your session.
             </motion.p>
          </div>

          <motion.div className={styles.roleSelector} variants={formVariants}>
            <button type="button" className={role === "student" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("student")}>Student</button>
            <button type="button" className={role === "admin" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("admin")}>Admin</button>
          </motion.div>

          <motion.div className={styles.oauthContainer} variants={formVariants}>
            <motion.button type="button" onClick={() => loginGoogle()} className={`${styles.oauthBtn} ${styles.googleBtn}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="18" /> Continue with Google
            </motion.button>

            <motion.button type="button" onClick={() => loginMicrosoft()} className={`${styles.oauthBtn} ${styles.microsoftBtn}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
               <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" width="18" /> Continue with Microsoft
            </motion.button>

            <div className={styles.divider}>
              <span>or enter via email</span>
            </div>
          </motion.div>

          <form onSubmit={handleLogin} className={styles.authForm}>
            <AnimatePresence mode="wait">
              {!mfaRequired ? (
                <motion.div key="credentials" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                  <div className={styles.inputGroup}>
                    <label><Mail size={14} /> Email Address</label>
                    <input type="email" placeholder="identifier@domain.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>

                  <div className={styles.inputGroup} style={{marginTop: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                      <label style={{marginBottom: 0}}><Lock size={14} /> Security Passphrase</label>
                      <Link to="/forgot-password" style={{fontSize: '0.8rem', color: '#FF3366', textDecoration: 'none'}}>Forgot Password?</Link>
                    </div>
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="mfa" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                  <div className={styles.inputGroup}>
                    <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'1.5rem', textAlign:'center', lineHeight:'1.5'}}>
                      An authorization code has been dispatched. <br/>Enter it below to securely resume your session.
                    </p>
                    <label><ShieldCheck size={14} /> 6-DIGIT CODE</label>
                    <input type="text" placeholder="XXXXXX" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value)} required style={{textAlign:'center', letterSpacing:'4px', fontSize:'1.2rem', fontWeight:'bold'}}/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" className={styles.submitBtn} variants={formVariants} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{marginTop: '2rem'}}>
              {loading ? <span className={styles.loader}></span> : <><Zap size={16}/> {mfaRequired ? "VERIFY IDENTITY" : "AUTHENTICATE"} <ArrowRight size={16}/></>}
            </motion.button>
          </form>

          <motion.p className={styles.switchLink} variants={formVariants}>
            Unregistered Identity? <Link to="/register">Initialize Account</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
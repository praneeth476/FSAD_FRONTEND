import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendForgotPasswordOtp, resetPasswordWithOtp } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import styles from './Auth.module.css';

import slide1 from '../assets/slide_auth_1.png';
import slide2 from '../assets/slide_auth_2.png';
import slide3 from '../assets/slide_auth_3.png';

const slideImages = [slide1, slide2, slide3];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % slideImages.length); }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendForgotPasswordOtp({ email });
      setOtpSent(true);
    } catch (err) {
      alert("No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp({ email, code: otpCode, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      alert("Invalid or Expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h2>Secure Password Recovery</h2>
          <p>Regain access to your ecosystem and continue your journey seamlessly.</p>
        </div>
      </div>

      {/* Right Side: Glassmorphic or Clean Form */}
      <div className={styles.formSide}>
        <motion.div className={styles.authContainer} initial="hidden" animate="visible" variants={formVariants}>
          <div className={styles.brandHero}>
             <motion.div variants={{ hidden: { opacity:0 }, visible: { opacity: 1 } }}>
               <span className={styles.badge}><ShieldCheck size={14} color="#FF3366"/> SECURE RECOVERY</span>
             </motion.div>
             <motion.h1 className="text-gradient" variants={{ hidden: { y: 20, opacity:0 }, visible: { y: 0, opacity: 1 } }}>
               Reset Credential
             </motion.h1>
             <motion.p className={styles.subtitle} variants={{ hidden: { opacity:0 }, visible: { opacity: 1 } }}>
               {otpSent && !success ? "An authorization code has been dispatched to your email." : "Provide your identity to generate a secure code."}
             </motion.p>
          </div>

          {!otpSent && !success ? (
            <form onSubmit={handleSendOtp} className={styles.authForm}>
              <motion.div key="step1" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                <div className={styles.inputGroup}>
                  <label><Mail size={14} /> Registered Address</label>
                  <input type="email" placeholder="identifier@domain.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </div>
                
                <motion.button type="submit" className={styles.submitBtn} variants={formVariants} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{marginTop: '2rem'}}>
                  {loading ? <span className={styles.loader}></span> : <><Zap size={16}/> SEND SECURE CODE <ArrowRight size={16}/></>}
                </motion.button>
              </motion.div>
            </form>
          ) : success ? (
            <motion.div key="success" initial={{opacity:0, scale: 0.9}} animate={{opacity:1, scale: 1}} className={styles.successMessage} style={{textAlign: "center", padding: "2rem 0"}}>
              <ShieldCheck size={48} color="#00E676" style={{ margin: "0 auto", marginBottom: "1rem" }}/>
              <h3 style={{color: "rgba(255,255,255,0.9)", marginBottom: "0.5rem"}}>Credential Updated</h3>
              <p style={{color: "rgba(255,255,255,0.6)", fontSize: "0.9rem"}}>Taking you back to the entrance portal...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className={styles.authForm}>
              <motion.div key="step2" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}}>
                <div className={styles.inputGroup}>
                  <label><ShieldCheck size={14} /> 6-DIGIT CODE</label>
                  <input type="text" placeholder="XXXXXX" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} required disabled={loading} style={{textAlign:'center', letterSpacing:'4px', fontSize:'1.2rem', fontWeight:'bold'}}/>
                </div>

                <div className={styles.inputGroup} style={{marginTop: '1rem'}}>
                  <label><Lock size={14} /> New Security Passphrase</label>
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={loading} minLength={6} />
                </div>

                <div className={styles.inputGroup} style={{marginTop: '1rem'}}>
                  <label><Lock size={14} /> Confirm Security Passphrase</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} minLength={6}/>
                </div>
                
                <motion.button type="submit" className={styles.submitBtn} variants={formVariants} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{marginTop: '2rem'}}>
                  {loading ? <span className={styles.loader}></span> : <><Zap size={16}/> ACTIVATE CREDENTIAL <ArrowRight size={16}/></>}
                </motion.button>
              </motion.div>
            </form>
          )}

          <motion.p className={styles.switchLink} variants={formVariants}>
            Remembered your identity? <Link to="/login">Return to Portal</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

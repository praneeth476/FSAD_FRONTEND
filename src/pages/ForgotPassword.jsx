import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendForgotPasswordOtp, resetPasswordWithOtp } from "../services/api";
import { message } from "antd";
import styles from './Login.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendForgotPasswordOtp({ email });
      setOtpSent(true);
      message.success("Authorization code dispatched to your email.");
    } catch (err) {
      message.error("No account found with this email.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      message.warning("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp({ email, code: otpCode, newPassword });
      setSuccess(true);
      message.success("Credential updated successfully.");
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      message.error("Invalid or Expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.centeredViewport}>
      <div className={styles.authContainer}>
        
        {/* Brand Link back to home */}
        <Link to="/" className={`${styles.brandHero} ${styles.brandGroup}`} style={{textDecoration: 'none'}}>
          <div className={styles.logoOrb}>💼</div>
          <span className={styles.brandTitle}>WorkStudy</span>
        </Link>

        <div className={styles.brandHero}>
           <h1>Reset Password</h1>
           <p>{otpSent && !success ? "We sent a secure code to your email." : success ? "Password successfully changed" : "Enter your email to receive a recovery code."}</p>
        </div>

        {!otpSent && !success ? (
          <form onSubmit={handleSendOtp} className={styles.authForm}>
            
            <div className={styles.inputGroup}>
              <label htmlFor="emailInput">Registered Email</label>
              <input id="emailInput" type="email" placeholder="name@university.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.loader}></span> : "Send Recovery Code"}
            </button>
          </form>
        ) : success ? (
          <div style={{textAlign: "center", padding: "1rem 0"}}>
            <span style={{fontSize: "48px", color: "#10b981", display: 'block', marginBottom: '1rem'}}>✓</span>
            <p style={{color: "var(--text-muted)", fontSize: "var(--text-sm)"}}>Taking you back to the login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className={styles.authForm}>
            
            <div className={styles.inputGroup}>
              <label htmlFor="otpInput">6-Digit Code</label>
              <input id="otpInput" type="text" placeholder="XXXXXX" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} required disabled={loading} style={{textAlign:'center', letterSpacing:'4px', fontSize:'18px', fontWeight:'700'}}/>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input id="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required disabled={loading} minLength={6} />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} minLength={6}/>
            </div>
            
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.loader}></span> : "Activate New Password"}
            </button>
          </form>
        )}

        <p className={styles.switchLink}>
          Back to login? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

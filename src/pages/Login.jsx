import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { loginStudent, oauthLoginStudent, verifyMfaStudent } from "../services/api";
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { message, Checkbox } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRoleState] = useState("student");
  const roleRef = useRef("student"); // Used to fix stale closure during OAuth async flow

  const setRole = (newRole) => {
    setRoleState(newRole);
    roleRef.current = newRole;
  };

  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleOAuthSuccess = async (authEmail, authName, provider) => {
    setLoading(true);
    try {
      if (!authEmail) throw new Error("Google login succeeded but didn't return an email.");
      const activeRole = roleRef.current; // Guarantee fresh role reference
      const user = await oauthLoginStudent({ email: authEmail, name: authName, authProvider: provider, role: activeRole });
      login(user, user.token, rememberMe);
      navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
    } catch (err) { 
      console.error("Full Error:", err);
      message.error("Verification Failed: " + err.message); 
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
        login(user, user.token, rememberMe);
        message.success("Identity Verified.");
        navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
      } else {
        // Step 1: Send Credentials
        const response = await loginStudent({ email, password });
        if (response.mfaRequired) {
          setMfaRequired(true);
        } else {
          login(response, response.token, rememberMe);
          message.success("Authentication Success");
          navigate(response.role === "admin" ? "/admin" : "/student", { replace: true });
        }
      }
    } catch { 
      message.error(mfaRequired ? "Incorrect or Expired Security Code." : "Invalid credentials. Please verify your email and password."); 
    } 
    finally { setLoading(false); }
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
           <h1>Sign in to your account</h1>
           <p>Enter your credentials to continue</p>
        </div>

        <div className={styles.roleSelector}>
          <button type="button" className={role === "student" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("student")}>Student</button>
          <button type="button" className={role === "admin" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("admin")}>Administrator</button>
        </div>

        <div className={styles.oauthContainer}>
          <button type="button" onClick={() => loginGoogle()} className={styles.oauthBtn}>
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="16" /> Continue with Google
          </button>
          <button type="button" onClick={() => loginMicrosoft()} className={styles.oauthBtn}>
             <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" width="16" /> Continue with Microsoft
          </button>
        </div>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <form onSubmit={handleLogin} className={styles.authForm}>
          {!mfaRequired ? (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="emailInput">Email</label>
                <input id="emailInput" type="email" placeholder="name@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="passwordInput">
                  Password
                  <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                </label>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <input id="passwordInput" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', paddingRight: '40px'}} />
                  <div onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)'}}>
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </div>
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>Remember my session</Checkbox>
              </div>
            </>
          ) : (
            <div className={styles.inputGroup}>
              <label>Authentication Code</label>
              <input type="text" placeholder="123456" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value)} required style={{textAlign:'center', letterSpacing:'4px', fontSize:'18px'}}/>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.loader}></span> : <>{mfaRequired ? "Verify Code" : "Sign In"}</>}
          </button>
        </form>

        <p className={styles.switchLink}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
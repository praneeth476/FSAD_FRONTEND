import { useState } from "react";
import { registerStudent } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import styles from './Login.module.css';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return message.warning("Please fill in all fields.");
    
    setLoading(true);
    try {
      await registerStudent({ name, email, password, role });
      message.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch { 
      message.error("Failed to create account. Email might already be registered."); 
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
           <h1>Create an account</h1>
           <p>Enter your details to get started</p>
        </div>

        <div className={styles.roleSelector}>
          <button type="button" className={role === "student" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("student")}>Student</button>
          <button type="button" className={role === "admin" ? styles.roleActive : styles.roleBtn} onClick={() => setRole("admin")}>Administrator</button>
        </div>

        <form onSubmit={handleRegister} className={styles.authForm}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="nameInput">Full Name</label>
            <input id="nameInput" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="emailInput">Email</label>
            <input id="emailInput" type="email" placeholder="name@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="passwordInput">Password</label>
            <input id="passwordInput" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.loader}></span> : "Create Account"}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
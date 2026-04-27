import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";
import { Modal, Typography, Button, Space } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Search, Briefcase, MousePointerClick, Clock, CalendarCheck, CheckCircle, MessageSquare, Database, ArrowRight } from "lucide-react";

const { Title, Paragraph } = Typography;

export default function Landing() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // Handle scroll detection for the floating header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const promptAuth = () => {
    setIsAuthModalVisible(true);
  };

  const onSearch = () => {
    promptAuth();
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1. FLOATING HEADER */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className={styles.logoOrb}>💼</div>
            <span className={styles.brandTitle}>WorkStudy</span>
          </div>

          <nav className={styles.navLinks}>
            <span className={styles.navLink} onClick={() => scrollToSection('how-it-works')}>How it Works</span>
            <span className={styles.navLink} onClick={() => scrollToSection('features')}>Features</span>
            <span className={styles.navLink} onClick={promptAuth}>Find Jobs</span>
          </nav>

          <div className={styles.authGroup}>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Log In</button>
            <button className={styles.registerBtn} onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </header>

      {/* 2. SPLIT HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroSplitLayout}>
          
          {/* Left Column: Copy & Actions */}
          <div className={styles.heroTextCol}>
            <div className={styles.heroBadge}>
              <span className={styles.badgePulse}></span>
              WorkStudy OS 2.0 Now Live
            </div>
            
            <h1 className={styles.heroTitle}>
              Launch your <span className={styles.titleHighlight}>career</span> right on campus.
            </h1>
            
            <p className={styles.heroSubtitle}>
              The premium platform for proactive students. Discover valuable on-campus roles, seamlessly log your hours, and connect with universities instantly.
            </p>

            <div className={styles.heroSearchBox}>
              <Search className={styles.searchIcon} size={22} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search 'IT Assistant', 'Library'..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
              />
              <button className={styles.searchHeroBtn} onClick={onSearch}>Search</button>
            </div>

            <div className={styles.heroMetrics}>
              <div className={styles.metricItem}>
                <strong>50+</strong>
                <span>Departments</span>
              </div>
              <div className={styles.metricDivider}></div>
              <div className={styles.metricItem}>
                <strong>12k+</strong>
                <span>Hours Logged</span>
              </div>
              <div className={styles.metricDivider}></div>
              <div className={styles.metricItem}>
                <strong>4.9/5</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>
          
          {/* Right Column: Dashboard Graphic Preview */}
          <div className={styles.heroMediaCol}>
            <div className={styles.mediaWrap}>
              <img src="/hero_dashboard.png" alt="WorkStudy Dashboard Preview" className={styles.dashImage} />
            </div>
          </div>
          
        </div>
      </section>

      {/* 3. TRUST BANNER */}
      <section className={styles.trustSection}>
        <p className={styles.trustLabel}>TRUSTED BY TOP CAMPUS DEPARTMENTS</p>
        <div className={styles.trustLogos}>
          <span>Information Technology</span>
          <span className={styles.dot}>•</span>
          <span>Campus Library</span>
          <span className={styles.dot}>•</span>
          <span>Admissions</span>
          <span className={styles.dot}>•</span>
          <span>Athletics</span>
          <span className={styles.dot}>•</span>
          <span>Student Affairs</span>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className={styles.stepSection}>
        <div className={styles.sectionHeader}>
          <h2>From application to paycheck in three steps.</h2>
          <p>We designed the entire process to be completely frictionless, letting you focus on your studies.</p>
        </div>

        <div className={styles.stepGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepIconWrap}><Briefcase size={32} /></div>
            <div className={styles.stepBadge}>Step 1</div>
            <h3>Build Your Profile</h3>
            <p>Create a standout student profile highlighting your major, skills, and availability. Let departments see your potential.</p>
          </div>
          
          <div className={styles.stepCard}>
            <div className={styles.stepIconWrap}><MousePointerClick size={32} /></div>
            <div className={styles.stepBadge}>Step 2</div>
            <h3>Apply in One Click</h3>
            <p>Browse our live campus job board. Found a match? Send your verified profile securely with a single button press.</p>
          </div>
          
          <div className={styles.stepCard}>
            <div className={styles.stepIconWrap}><Clock size={32} /></div>
            <div className={styles.stepBadge}>Step 3</div>
            <h3>Track Your Hours</h3>
            <p>Once hired, use our intuitive digital ledger to punch in, track pending approvals, and ensure you get paid on time.</p>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES GRID */}
      <section id="features" className={styles.featureSection}>
        <div className={styles.featureLayout}>
          <div className={styles.featureTextCol}>
            <h2>Everything you need, nothing you don't.</h2>
            <p>WorkStudy OS combines powerful administrative tools with a consumer-grade student interface.</p>
            
            <button className={styles.outlineBtn} onClick={promptAuth}>
              Explore Platform <ArrowRight size={18} />
            </button>
          </div>
          
          <div className={styles.featureGridCol}>
            <div className={styles.featureItem}>
              <CalendarCheck size={24} className={styles.fIcon} />
              <h4>Smart Scheduling</h4>
              <p>Easily match your work shifts against your academic timetable automatically.</p>
            </div>
            
            <div className={styles.featureItem}>
              <CheckCircle size={24} className={styles.fIcon} />
              <h4>Instant Approvals</h4>
              <p>Administrators can bulk-approve timesheets, meaning zero delays in payroll processing.</p>
            </div>
            
            <div className={styles.featureItem}>
              <MessageSquare size={24} className={styles.fIcon} />
              <h4>Direct Messaging</h4>
              <p>Communicate directly with your department supervisors directly within the platform.</p>
            </div>
            
            <div className={styles.featureItem}>
              <Database size={24} className={styles.fIcon} />
              <h4>Seamless Ledger</h4>
              <p>An immutable, transparent record of all your working history on campus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>Ready to balance work and study?</h2>
          <p>Join thousands of students turning their campus hours into real-world career experience.</p>
          <div className={styles.ctaActions}>
            <button className={styles.registerBtnLarge} onClick={() => navigate('/register')}>Create Free Account</button>
            <button className={styles.loginBtnLarge} onClick={() => navigate('/login')}>Log In</button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.brandGroup} style={{marginBottom: '1rem'}}>
              <div className={styles.logoOrb}>💼</div>
              <span className={styles.brandTitle}>WorkStudy</span>
            </div>
            <p className={styles.footerDesc}>Empowering the next generation of professionals through a premium on-campus employment experience.</p>
          </div>
          
          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <div className={styles.footerLinks}>
              <span className={styles.footerLink} onClick={promptAuth}>Find Jobs</span>
              <span className={styles.footerLink} onClick={() => scrollToSection('features')}>Features</span>
              <span className={styles.footerLink}>For Admins</span>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Resources</h4>
            <div className={styles.footerLinks}>
              <span className={styles.footerLink}>Help Center</span>
              <span className={styles.footerLink}>Career Advice</span>
              <span className={styles.footerLink}>System Status</span>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <div className={styles.footerLinks}>
              <span className={styles.footerLink}>Privacy Policy</span>
              <span className={styles.footerLink}>Terms of Service</span>
              <span className={styles.footerLink}>Security</span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 WorkStudy OS. All rights reserved.</p>
          <div className={styles.socialLinks}>
            <span className={styles.footerLink}>Twitter</span>
            <span className={styles.footerLink}>LinkedIn</span>
          </div>
        </div>
      </footer>

      {/* Auth Prompt Modal */}
      <Modal 
         open={isAuthModalVisible} 
         onCancel={() => setIsAuthModalVisible(false)} 
         footer={null}
         centered
         aria-labelledby="auth-modal-title"
      >
         <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 64, height: 64, background: 'var(--color-primary-glow)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <LockOutlined style={{ fontSize: 24, color: 'var(--color-primary-base)' }} />
            </div>
            <Title id="auth-modal-title" level={3} style={{ marginBottom: 16 }}>Authentication Required</Title>
            <Paragraph style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>
               {searchTerm ? `Sign in to discover roles related to "${searchTerm}".` : 'Please sign in or create a student account to explore the database.'}
            </Paragraph>
            <Space size="middle" direction="vertical" style={{ width: '100%' }}>
               <Button type="primary" size="large" block onClick={() => navigate('/login')} style={{ height: 48, borderRadius: 8, background: 'var(--color-primary-base)', borderColor: 'var(--color-primary-base)' }}>
                  Log In to WorkStudy
               </Button>
               <Button size="large" block onClick={() => navigate('/register')} style={{ height: 48, borderRadius: 8 }}>
                  Create Free Account
               </Button>
            </Space>
         </div>
      </Modal>

    </div>
  );
}

import { useEffect, useState } from "react";
import { getJobs, applyJob, getStudentApps } from "../services/api";
import { useNavigate } from "react-router-dom";
import styles from "./Jobs.module.css";

export default function Jobs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [files, setFiles] = useState({}); // Tracking files properly
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    loadData();
  }, []);

  const loadData = async () => {
    const jobsData = await getJobs();
    const appsData = await getStudentApps(user.id);
    setJobs(jobsData || []);
    setApps(appsData || []);
  };

  const handleFileChange = (jobId, file) => {
    setFiles((prev) => ({ ...prev, [jobId]: file }));
  };

  const apply = async (id) => {
    if (!files[id]) {
      alert("Please upload your resume first.");
      return;
    }

    setLoading(true);
    try {
      await applyJob(user.id, id, files[id]);
      alert("Application sent successfully!");
      loadData(); // Refresh to show applied status
    } catch (err) {
      alert("Application failed. You might have already applied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageViewport}>
      <div className={styles.glowOrb}></div>

      <div className={styles.container}>
        {/* SIDEBAR NAVIGATION */}
        <aside className={styles.sidebar}>
          <div className={styles.logo} onClick={() => navigate("/student")}>✦ StudentHub</div>
          <nav className={styles.nav}>
            <button onClick={() => navigate("/student")}>🏠 Dashboard</button>
            <button className={styles.active}>🔍 Browse Jobs</button>
            <button onClick={() => navigate("/hours")}>⏱ Log Hours</button>
          </nav>
          <div className={styles.sidebarBottom}>
             <button className={styles.logoutBtn} onClick={() => {
               localStorage.removeItem("user");
               navigate("/login");
             }}>Logout</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={styles.content}>
          <header className={styles.header}>
            <div>
              <h1>Available Positions</h1>
              <p>Find the perfect work-study opportunity for your schedule.</p>
            </div>
          </header>

          <div className={styles.grid}>
            {jobs.map((j) => {
              const alreadyApplied = apps.find(a => a.job.id === j.id);
              
              return (
                <div key={j.id} className={styles.glassCard}>
                  <div className={styles.cardInfo}>
                    <span className={styles.categoryBadge}>Work-Study</span>
                    <h3>{j.title}</h3>
                    <p>{j.description}</p>
                  </div>

                  <div className={styles.cardActions}>
                    {!alreadyApplied ? (
                      <>
                        <label className={styles.fileUpload}>
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx" 
                            onChange={(e) => handleFileChange(j.id, e.target.files[0])}
                          />
                          {files[j.id] ? `📄 ${files[j.id].name}` : "Upload Resume (PDF)"}
                        </label>
                        <button 
                          className={styles.applyBtn} 
                          onClick={() => apply(j.id)}
                          disabled={loading}
                        >
                          Apply Now
                        </button>
                      </>
                    ) : (
                      <div className={styles.appliedStatus}>
                        ✓ Applied ({alreadyApplied.status})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
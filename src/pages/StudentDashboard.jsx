import React, { useEffect, useState } from "react";
import { getRecommendedJobs, uploadMasterResume, getStudentApps, applyJob, deleteAccount } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Menu, Typography, Button, Space, Row, Col,
  Avatar, Tag, Timeline, ConfigProvider, Progress, Input, Dropdown, message, Skeleton
} from "antd";
import {
  HomeOutlined, CompassOutlined, HistoryOutlined, UserOutlined,
  LogoutOutlined, UploadOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, SyncOutlined, ArrowRightOutlined,
  WarningOutlined, StarOutlined, SearchOutlined, HeartOutlined, HeartFilled,
  BellOutlined, InfoCircleOutlined, FileTextOutlined, ClockCircleOutlined,
  ProjectOutlined, StarFilled
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import styles from "./StudentDashboard.module.css";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [files, setFiles] = useState({});
  const [tab, setTab] = useState("discovery"); // Default to discovery
  const [searchTerm, setSearchTerm] = useState("");
  const [savedJobs, setSavedJobs] = useState(JSON.parse(localStorage.getItem(`saved_${user?.id}`) || "[]"));
  
  // UX Features
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingActionId, setLoadingActionId] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
    load();
  }, [user, navigate]);

  const load = async () => {
    setLoadingFeed(true);
    try {
      const jobsData = await getRecommendedJobs(user.id);
      const appsData = await getStudentApps(user.id);
      setJobs(jobsData || []);
      setApps(appsData || []);
    } catch (e) {
      console.warn("Failed to retrieve dashboard meshes:", e);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleApply = async (id) => {
    if (!files[id]) return message.warning("Please attach a master resume PDF to continue.");
    setLoadingActionId(id);
    try {
      await applyJob(user.id, id, files[id]);
      message.success("Application successfully transmitted!");
      load();
    } catch (err) { 
      message.error("Failed to transmit application. Network disruption detected."); 
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSaveJob = (id) => {
    const newSaved = savedJobs.includes(id) ? savedJobs.filter(j => j !== id) : [...savedJobs, id];
    setSavedJobs(newSaved);
    localStorage.setItem(`saved_${user?.id}`, JSON.stringify(newSaved)); // Non-critical local data, fine for localStorage
  };

  const windowVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  const menuItems = [
    { key: "discovery", label: "Dashboard", icon: <HomeOutlined /> },
    { key: "history", label: "Applied", icon: <HistoryOutlined /> },
    { key: "saved", label: "Saved Jobs", icon: <HeartOutlined /> },
    { key: "hours", label: "Log Hours", icon: <SyncOutlined /> }
  ];

  const handleMenuClick = (e) => {
    if (e.key === "hours") {
      navigate('/hours');
    } else {
      setTab(e.key);
    }
  };

  const profileMenuItems = [
     { key: "profile", label: "Settings", icon: <UserOutlined /> },
     { type: "divider" },
     { key: "logout", label: "Sign out", icon: <LogoutOutlined />, danger: true }
  ];

  const onProfileMenuClick = (e) => {
     if (e.key === "logout") handleLogout();
     else if (e.key === "profile") setTab("profile");
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const savedJobData = jobs.filter(j => savedJobs.includes(j.id));
  const suggestedJobs = jobs.slice(0, 3);

  const themeConfig = {
    token: {
      colorPrimary: '#000000', // Crisp stark contrast
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e5e7eb',
      borderRadius: 6,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Menu: {
        itemBg: 'transparent',
        itemActiveBg: 'transparent',
        itemSelectedBg: 'transparent',
        itemSelectedColor: '#000000',
      }
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className={styles.dashboardLayout}>
        {/* Strict SaaS Top Navbar */}
        <Header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.brandGroup} onClick={() => setTab('discovery')}>
              <span className={styles.logoBadge}>💼</span>
              <span className={styles.brandTitle}>WorkStudy</span>
            </div>

            <Menu 
              mode="horizontal" 
              selectedKeys={[tab]} 
              onClick={handleMenuClick} 
              items={menuItems} 
              className={styles.menu}
            />

            <Space className={styles.profileTools} size="middle">
              <BellOutlined style={{fontSize: '18px', color: 'var(--text-muted)', cursor: 'pointer'}} onClick={() => message.info("Notification center is currently idle.")} />
              <Dropdown menu={{ items: profileMenuItems, onClick: onProfileMenuClick }} trigger={['click']}>
                 <Space style={{cursor: 'pointer'}}>
                   <Avatar style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-heading)' }} icon={<UserOutlined />} />
                 </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className={styles.content}>
           <div className={styles.pageGrid}>
              
              {/* 1. LEFT COLUMN (Profile & Actions) */}
              <div className={styles.leftColumn}>
                 <div className={`${styles.saasCard}`}>
                    <div className={styles.profileHeader}>
                       <Avatar size={64} style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '28px', marginBottom: '12px' }} icon={<UserOutlined />} />
                       <Title level={5} style={{ margin: '0 0 4px 0', color: 'var(--text-heading)'}}>{user?.name}</Title>
                       <Paragraph style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)'}}>{user?.email}</Paragraph>
                    </div>
                    
                    <div style={{marginTop: '20px'}}>
                       <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: 'var(--text-heading)', fontWeight: 600}}>
                          <span>Profile Completion</span>
                          <span style={{color: '#10b981'}}>70%</span>
                       </div>
                       <Progress percent={70} showInfo={false} strokeColor="#10b981" size="small" />
                    </div>

                    <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                       <Button block onClick={() => setTab('profile')}>Update Profile</Button>
                       <input type="file" id="sidebarMasterResume" style={{display:'none'}} onChange={async (e) => {
                           try {
                             message.loading({content: "Uploading identity document...", key: "uploadRes"});
                             await uploadMasterResume(user.id, e.target.files[0]);
                             message.success({content: 'Identity document secured!', key: "uploadRes", duration: 3});
                             load();
                           } catch(err) { 
                             message.error({content: 'Data transmission failed.', key: "uploadRes", duration: 3}); 
                           }
                       }} />
                       <Button block onClick={() => document.getElementById("sidebarMasterResume").click()} icon={<UploadOutlined />}>Upload Resume</Button>
                    </div>
                 </div>

                 <div className={`${styles.saasCard} ${styles.saasCardHoverable}`} style={{padding: '16px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                       <Text strong style={{fontSize: '14px'}}>Saved Jobs</Text>
                       <Tag color="blue">{savedJobs.length}</Tag>
                    </div>
                 </div>
              </div>

              {/* 2. CENTER COLUMN (Main Feed & Analytics) */}
              <div className={styles.mainColumn}>
                 {/* Top Persistent SaaS Stats */}
                 <div className={styles.topStatsGrid}>
                    <div className={styles.saasCard}>
                       <Skeleton loading={loadingFeed} active paragraph={{ rows: 1 }} title={false}>
                          <div className={styles.statMetric}>
                             <div className={styles.statIconRow}>
                               <ProjectOutlined className={styles.sIcon} />
                             </div>
                             <span className={styles.sValue}>{jobs.length}</span>
                             <span className={styles.sLabel}>Total Jobs</span>
                          </div>
                       </Skeleton>
                    </div>
                    <div className={styles.saasCard}>
                       <Skeleton loading={loadingFeed} active paragraph={{ rows: 1 }} title={false}>
                          <div className={styles.statMetric}>
                             <div className={styles.statIconRow}>
                               <FileTextOutlined className={styles.sIcon} />
                             </div>
                             <span className={styles.sValue}>{apps.length}</span>
                             <span className={styles.sLabel}>Applied</span>
                          </div>
                       </Skeleton>
                    </div>
                    <div className={styles.saasCard}>
                       <Skeleton loading={loadingFeed} active paragraph={{ rows: 1 }} title={false}>
                          <div className={styles.statMetric}>
                             <div className={styles.statIconRow}>
                               <StarFilled style={{color: '#f59e0b'}} className={styles.sIcon} />
                             </div>
                             <span className={styles.sValue}>{savedJobs.length}</span>
                             <span className={styles.sLabel}>Saved Roles</span>
                          </div>
                       </Skeleton>
                    </div>
                    <div className={styles.saasCard}>
                       <Skeleton loading={loadingFeed} active paragraph={{ rows: 1 }} title={false}>
                          <div className={styles.statMetric}>
                             <div className={styles.statIconRow}>
                               <ClockCircleOutlined className={styles.sIcon} />
                             </div>
                             <span className={styles.sValue}>0</span>
                             <span className={styles.sLabel}>Hrs Tracked</span>
                          </div>
                       </Skeleton>
                    </div>
                 </div>

                <AnimatePresence mode="wait">
                  {/* DISCOVERY / SEARCH */}
                  {tab === "discovery" && (
                    <motion.div key="discovery" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <div className={`${styles.saasCard} ${styles.searchBarContainer}`}>
                         <Input 
                            bordered={false}
                            size="large" 
                            placeholder="🔍 Search jobs by title, department, or keyword..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                      </div>

                      <div className={styles.listContainer}>
                        {loadingFeed ? (
                           <>
                              <div className={styles.saasCard} style={{ marginBottom: '16px' }}><Skeleton active avatar paragraph={{ rows: 3 }} /></div>
                              <div className={styles.saasCard} style={{ marginBottom: '16px' }}><Skeleton active avatar paragraph={{ rows: 3 }} /></div>
                              <div className={styles.saasCard} style={{ marginBottom: '16px' }}><Skeleton active avatar paragraph={{ rows: 3 }} /></div>
                           </>
                        ) : filteredJobs.length === 0 ? (
                           <div className={styles.emptyState}>No jobs found matching your search matrix.</div>
                        ) : filteredJobs.map((j) => {
                          const applied = apps.find(a => a.job.id === j.id);
                          const isSaved = savedJobs.includes(j.id);

                          return (
                            <div key={j.id} className={`${styles.saasCard} ${styles.saasCardHoverable}`} style={{ marginBottom: '16px' }}>
                                <div className={styles.jobFeedHeader}>
                                   <div>
                                     <Title level={5} style={{ margin: 0, color: 'var(--text-heading)' }}>{j.title}</Title>
                                     <Text type="secondary" style={{fontSize: '13px'}}>WorkStudy Dept • On Campus</Text>
                                   </div>
                                   <div onClick={() => toggleSaveJob(j.id)} style={{cursor: 'pointer'}}>
                                      {isSaved ? <StarFilled style={{color: '#f59e0b', fontSize: '18px'}} /> : <StarOutlined style={{color: '#9ca3af', fontSize: '18px'}} />}
                                   </div>
                                </div>
                                <div style={{marginTop: '12px', marginBottom: '16px'}}>
                                   <Text style={{color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.5'}}>
                                      {j.description}
                                   </Text>
                                   {j.matchScore !== undefined && j.matchScore !== null && (
                                      <div style={{marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                                        <Tag color={j.matchScore >= 70 ? "green" : (j.matchScore >= 40 ? "orange" : "default")} style={{border: 'none'}}>
                                          Match Score: {j.matchScore}%
                                        </Tag>
                                      </div>
                                   )}
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px'}}>
                                  {applied ? (
                                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '6px 12px', fontSize: '13px', margin: 0 }}>
                                      Applied
                                    </Tag>
                                  ) : (
                                    <>
                                      <input 
                                        type="file" 
                                        id={`file-${j.id}`} 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => setFiles(p => ({ ...p, [j.id]: e.target.files[0] }))}
                                      />
                                      <Button onClick={() => document.getElementById(`file-${j.id}`).click()}>
                                        {files[j.id] ? "Resume Attached ✓" : "Attach Resume"}
                                      </Button>
                                      <Button type="primary" loading={loadingActionId === j.id} onClick={() => handleApply(j.id)} style={{ fontWeight: 600 }}>
                                        Easy Apply
                                      </Button>
                                    </>
                                  )}
                                </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* HISTORY / TRACKING */}
                  {tab === "history" && (
                    <motion.div key="history" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <div className={styles.saasCard}>
                        <Title level={4} style={{ marginBottom: '24px' }}>Application History</Title>
                        {loadingFeed ? <Skeleton active /> : apps.length === 0 ? (
                          <div className={styles.emptyState}>No activity detected. Apply to jobs to see them here.</div>
                        ) : (
                          <Timeline
                            mode="left"
                            items={apps.map(a => ({
                              color: a.status === 'APPROVED' ? 'green' : (a.status === 'REJECTED' ? 'red' : 'blue'),
                              children: (
                                <div style={{paddingBottom: '16px'}}>
                                   <Text strong style={{ fontSize: '15px' }}>{a.job.title}</Text>
                                   <br/>
                                   <Tag color={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'error' : 'processing'} style={{ marginTop: '8px' }}>
                                     {a.status}
                                   </Tag>
                                   <span style={{marginLeft: '8px', fontSize: '12px', color: 'var(--text-muted)'}}>Last updated recently</span>
                                </div>
                              )
                            }))}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* SAVED JOBS */}
                  {tab === "saved" && (
                    <motion.div key="saved" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Title level={4} style={{ marginBottom: '16px' }}>Saved Requisitions</Title>
                      <div className={styles.listContainer}>
                        {loadingFeed ? (
                           <>
                             <div className={styles.saasCard} style={{marginBottom: '16px'}}><Skeleton active /></div>
                             <div className={styles.saasCard} style={{marginBottom: '16px'}}><Skeleton active /></div>
                           </>
                        ) : savedJobData.length === 0 ? <div className={styles.emptyState}>You have no saved jobs.</div>
                        : savedJobData.map((j) => {
                          const applied = apps.find(a => a.job.id === j.id);
                          return (
                            <div key={j.id} className={`${styles.saasCard} ${styles.saasCardHoverable}`} style={{ marginBottom: '16px' }}>
                                <div className={styles.jobFeedHeader}>
                                   <div>
                                     <Title level={5} style={{ margin: 0 }}>{j.title}</Title>
                                     <Text type="secondary">WorkStudy Dept</Text>
                                   </div>
                                   <div onClick={() => toggleSaveJob(j.id)} style={{cursor: 'pointer'}}>
                                      <StarFilled style={{color: '#f59e0b', fontSize: '18px'}} />
                                   </div>
                                </div>
                                <div style={{marginTop: '12px', marginBottom: '16px'}}>
                                   <Text type="secondary" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{j.description}</Text>
                                </div>
                                <div>
                                  {applied ? (
                                    <Tag icon={<CheckCircleOutlined />} color="success">Applied</Tag>
                                  ) : (
                                    <Button type="primary" onClick={() => { setTab('discovery'); }}>Go to Feed to Apply</Button>
                                  )}
                                </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* PROFILE SETTINGS */}
                  {tab === "profile" && (
                    <motion.div key="profile" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <div className={styles.saasCard}>
                         <Title level={4} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Profile Settings</Title>
                         <Row gutter={[0, 16]} style={{marginTop: '24px'}}>
                             <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Full Name</Text>
                               <Text strong>{user?.name}</Text>
                             </Col>
                             <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Email Address</Text>
                               <Text strong>{user?.email}</Text>
                             </Col>
                             <Col span={24} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Authentication</Text>
                               <Tag color="default">{user?.authProvider || "Native Local"}</Tag>
                             </Col>
                         </Row>
                         <div style={{ marginTop: '32px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                               <WarningOutlined style={{ color: '#dc2626', fontSize: '24px' }} />
                               <div style={{ textAlign: 'left', flex: 1 }}>
                                  <Text strong style={{ display: 'block', color: '#dc2626' }}>Delete Account</Text>
                                  <Text type="secondary" style={{ color: '#991b1b', fontSize: '12px' }}>Permanently erase your data.</Text>
                               </div>
                               <Button danger onClick={() => { 
                                  if (window.confirm("Initialize complete system memory wipe?")) {
                                     deleteAccount(user.id).then(() => {
                                        message.success("Identity completely wiped alongside data vectors.");
                                        navigate("/login");
                                     }).catch(() => message.error("Disconnection error occurred."));
                                  }
                               }}>
                                 Delete Data
                               </Button>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* 3. RIGHT COLUMN (Insights/Notifications) */}
              <div className={styles.rightColumn}>
                 
                 <div className={styles.saasCard} style={{padding: '20px 16px'}}>
                    <h3 className={styles.widgetTitle}>Recent Activity</h3>
                    <div className={styles.notificationItem}>
                      <div className={styles.notifIcon}><CheckCircleOutlined style={{color: '#10b981'}}/></div>
                      <div className={styles.notifContent}>
                        <p>Your profile matched with <strong>IT Assistant</strong> role.</p>
                        <span className={styles.notifTime}>2 hours ago</span>
                      </div>
                    </div>
                    <div className={styles.notificationItem}>
                      <div className={styles.notifIcon}><InfoCircleOutlined style={{color: 'var(--color-primary-base)'}}/></div>
                      <div className={styles.notifContent}>
                        <p>Welcome to WorkStudy OS 2.0! Explore the new job feed.</p>
                        <span className={styles.notifTime}>1 day ago</span>
                      </div>
                    </div>
                 </div>

                 <div className={styles.saasCard} style={{padding: '20px 16px'}}>
                    <h3 className={styles.widgetTitle}>Campus Notices</h3>
                    <div className={styles.announcementBlock}>
                      <h4>💼 Spring Hiring Fair</h4>
                      <p>Meet with department heads in the Student Union building this Friday at 2PM.</p>
                    </div>
                    <div className={styles.announcementBlock}>
                      <h4>📝 Timesheet Deadline</h4>
                      <p>All timesheets for the current pay period must be submitted by Friday 5PM.</p>
                    </div>
                 </div>

                 <div className={styles.tipBlock}>
                   <SafetyCertificateOutlined style={{fontSize: '20px', color: 'var(--color-primary-base)'}} />
                   <p><strong>Pro Tip:</strong> Ensure your Master Resume is up to date to increase AI matching scores.</p>
                 </div>

              </div>

           </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
import React, { useEffect, useState } from "react";
import { getRecommendedJobs, uploadMasterResume, getStudentApps, applyJob, deleteAccount } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Menu, Typography, Card, Button, Space, Row, Col,
  Statistic, Avatar, Tag, Timeline, ConfigProvider, Progress, Input, Dropdown
} from "antd";
import {
  HomeOutlined, CompassOutlined, HistoryOutlined, UserOutlined,
  LogoutOutlined, UploadOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, SyncOutlined, ArrowRightOutlined,
  WarningOutlined, StarOutlined, SearchOutlined, HeartOutlined, HeartFilled
} from "@ant-design/icons";
import styles from "./StudentDashboard.module.css";
import heroStudent from "../assets/hero_student.png";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [files, setFiles] = useState({});
  const [tab, setTab] = useState("discovery"); // Default to discovery a la Naukri
  const [searchTerm, setSearchTerm] = useState("");
  const [savedJobs, setSavedJobs] = useState(JSON.parse(localStorage.getItem(`saved_${user?.id}`) || "[]"));

  useEffect(() => {
    if (!user) navigate("/login");
    load();
  }, [user, navigate]);

  const load = async () => {
    const jobsData = await getRecommendedJobs(user.id);
    const appsData = await getStudentApps(user.id);
    setJobs(jobsData || []);
    setApps(appsData || []);
  };

  const handleApply = async (id) => {
    if (!files[id]) return alert("Attach a resume PDF first");
    try {
      await applyJob(user.id, id, files[id]);
      alert("Application successfully transmitted!");
      load();
    } catch { alert("Failed to transmit application."); }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSaveJob = (id) => {
    const newSaved = savedJobs.includes(id) ? savedJobs.filter(j => j !== id) : [...savedJobs, id];
    setSavedJobs(newSaved);
    localStorage.setItem(`saved_${user?.id}`, JSON.stringify(newSaved));
  };

  const windowVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  const menuItems = [
    { key: "discovery", label: "Jobs", icon: <SearchOutlined /> },
    { key: "overview", label: "Dashboard", icon: <HomeOutlined /> },
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
     { key: "profile", label: "View Profile", icon: <UserOutlined /> },
     { type: "divider" },
     { key: "logout", label: "Logout", icon: <LogoutOutlined />, danger: true }
  ];

  const onProfileMenuClick = (e) => {
     if (e.key === "logout") handleLogout();
     else if (e.key === "profile") setTab("profile");
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const savedJobData = jobs.filter(j => savedJobs.includes(j.id));
  const suggestedJobs = jobs.slice(0, 3); // Mock suggestion

  const themeConfig = {
    token: {
      colorPrimary: '#275df5', // Naukri Blue
      colorBgContainer: 'var(--bg-surface)',
      colorBorderSecondary: '#f3f4f6',
      borderRadius: 8,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Card: {
        headerBg: 'var(--bg-surface-glass)',
        boxShadowCard: '0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      Menu: {
        itemBg: 'transparent',
        itemActiveBg: 'transparent',
        itemSelectedBg: 'transparent',
        itemSelectedColor: '#275df5',
      }
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className={styles.dashboardLayout}>
        {/* Top Navbar */}
        <Header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.brandGroup} onClick={() => setTab('discovery')}>
              <span className={styles.logoBadge}>💼</span>
              <span className={styles.brandTitle}>Work<span style={{fontWeight: 400, color: 'var(--text-muted)'}}>Study</span></span>
            </div>

            <Menu 
              mode="horizontal" 
              selectedKeys={[tab]} 
              onClick={handleMenuClick} 
              items={menuItems} 
              className={styles.menu}
            />

            <Space className={styles.profileTools} size="large">
              <Dropdown menu={{ items: profileMenuItems, onClick: onProfileMenuClick }} trigger={['click']}>
                 <Space style={{cursor: 'pointer'}}>
                   <Avatar style={{ backgroundColor: '#275df5' }} icon={<UserOutlined />} />
                   <div style={{display: 'flex', flexDirection: 'column', lineHeight: 1.2}}>
                     <span className={styles.headerGreeting}>{user?.name?.split(' ')[0] || "User"}</span>
                     <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>Profile</span>
                   </div>
                 </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className={styles.content}>
           <div className={styles.pageGrid}>
              
              {/* Left Sidebar (Profile Widget) */}
              <div className={styles.leftColumn}>
                 <Card className={styles.profileWidget} bordered={false}>
                    <div style={{textAlign: 'center', marginBottom: '16px'}}>
                       <Avatar size={80} style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)', fontSize: '32px' }} icon={<UserOutlined />} />
                    </div>
                    <Title level={5} style={{textAlign: 'center', margin: '0 0 4px 0'}}>{user?.name}</Title>
                    <Paragraph type="secondary" style={{textAlign: 'center', fontSize: '13px'}}>{user?.email}</Paragraph>
                    
                    <div style={{marginTop: '24px'}}>
                       <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px'}}>
                          <Text strong>Profile completed</Text>
                          <Text style={{color: '#10b981'}}>70%</Text>
                       </div>
                       <Progress percent={70} showInfo={false} strokeColor="#10b981" size="small" />
                       <Button type="link" size="small" style={{padding: 0, marginTop: '8px'}} onClick={() => setTab('profile')}>Update profile</Button>
                    </div>

                    <div className={styles.statLinks} style={{marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '16px'}}>
                       <div className={styles.statBlock} onClick={() => setTab('history')}>
                          <Text strong style={{fontSize: '16px'}}>{apps.length}</Text>
                          <Text type="secondary" style={{fontSize: '13px'}}>Applied Jobs</Text>
                       </div>
                       <div className={styles.statBlock} onClick={() => setTab('saved')}>
                          <Text strong style={{fontSize: '16px'}}>{savedJobs.length}</Text>
                          <Text type="secondary" style={{fontSize: '13px'}}>Saved Jobs</Text>
                       </div>
                    </div>
                 </Card>

                 {tab === 'discovery' && (
                    <Card title="Recommended Jobs" bordered={false} className={styles.recommendedWidget} style={{marginTop: '24px'}}>
                       <Space direction="vertical" style={{width: '100%'}}>
                          {suggestedJobs.map(job => (
                             <div key={job.id} className={styles.recItem}>
                                <Text strong style={{display: 'block', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{job.title}</Text>
                                <Text type="secondary" style={{fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{job.description}</Text>
                             </div>
                          ))}
                       </Space>
                    </Card>
                 )}
              </div>

              {/* Main Feed Content */}
              <div className={styles.mainColumn}>
                <AnimatePresence mode="wait">
                  
                  {/* DISCOVERY / SEARCH */}
                  {tab === "discovery" && (
                    <motion.div key="discovery" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <div className={styles.searchBarContainer}>
                         <Input 
                            size="large" 
                            placeholder="Search jobs by title or skills..." 
                            prefix={<SearchOutlined style={{color: '#9ca3af'}} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ borderRadius: '24px' }}
                         />
                      </div>

                      <div className={styles.listContainer}>
                        {filteredJobs.length === 0 && <div className={styles.emptyState}>No jobs found matching your search.</div>}
                        {filteredJobs.map((j) => {
                          const applied = apps.find(a => a.job.id === j.id);
                          const isSaved = savedJobs.includes(j.id);

                          return (
                            <motion.div key={j.id} whileHover={{ y: -2 }} style={{ marginBottom: '16px' }}>
                              <Card bordered={false} className={styles.jobFeedCard}>
                                <div className={styles.jobFeedHeader}>
                                   <div>
                                     <Title level={5} style={{ margin: 0, color: 'var(--text-heading)' }}>{j.title}</Title>
                                     <Text type="secondary" style={{fontSize: '13px'}}>WorkStudy Dept</Text>
                                   </div>
                                   <div onClick={() => toggleSaveJob(j.id)} style={{cursor: 'pointer'}}>
                                      {isSaved ? <HeartFilled style={{color: '#ef4444', fontSize: '18px'}} /> : <HeartOutlined style={{color: '#9ca3af', fontSize: '18px'}} />}
                                   </div>
                                </div>
                                 <div style={{marginTop: '12px', marginBottom: '16px'}}>
                                    <Text type="secondary" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                       {j.description}
                                    </Text>
                                    {j.matchScore !== undefined && j.matchScore !== null && (
                                       <div style={{marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                                         <Tag color={j.matchScore >= 70 ? "green" : (j.matchScore >= 40 ? "orange" : "red")}>
                                           AI Match: {j.matchScore}%
                                         </Tag>
                                         {j.missingSkills && (
                                           <Text type="secondary" style={{fontSize: '12px', color: '#dc2626'}}><WarningOutlined /> Missing: {j.missingSkills}</Text>
                                         )}
                                       </div>
                                    )}
                                 </div>
                                <div className={styles.jobActionRow}>
                                  {applied ? (
                                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: '4px' }}>
                                      Applied
                                    </Tag>
                                  ) : (
                                    <Space>
                                      <input 
                                        type="file" 
                                        id={`file-${j.id}`} 
                                        style={{ display: 'none' }} 
                                        onChange={(e) => setFiles(p => ({ ...p, [j.id]: e.target.files[0] }))}
                                      />
                                      <Button 
                                        onClick={() => document.getElementById(`file-${j.id}`).click()}
                                        style={{ borderRadius: '4px' }}
                                      >
                                        {files[j.id] ? "Resume Attached" : "Attach Resume"}
                                      </Button>
                                      <Button type="primary" onClick={() => handleApply(j.id)} style={{ borderRadius: '4px' }}>
                                        Apply
                                      </Button>
                                    </Space>
                                  )}
                                </div>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* SAVED JOBS */}
                  {tab === "saved" && (
                    <motion.div key="saved" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Title level={3} style={{ fontWeight: 600 }}>Saved Jobs</Title>
                      <div className={styles.listContainer}>
                        {savedJobData.length === 0 && <div className={styles.emptyState}>You have no saved jobs.</div>}
                        {savedJobData.map((j) => {
                          const applied = apps.find(a => a.job.id === j.id);
                          return (
                            <motion.div key={j.id} whileHover={{ y: -2 }} style={{ marginBottom: '16px' }}>
                              <Card bordered={false} className={styles.jobFeedCard}>
                                <div className={styles.jobFeedHeader}>
                                   <div>
                                     <Title level={5} style={{ margin: 0, color: 'var(--text-heading)' }}>{j.title}</Title>
                                     <Text type="secondary" style={{fontSize: '13px'}}>WorkStudy Dept</Text>
                                   </div>
                                   <div onClick={() => toggleSaveJob(j.id)} style={{cursor: 'pointer'}}>
                                      <HeartFilled style={{color: '#ef4444', fontSize: '18px'}} />
                                   </div>
                                </div>
                                <div style={{marginTop: '12px', marginBottom: '16px'}}>
                                   <Text type="secondary" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{j.description}</Text>
                                </div>
                                <div className={styles.jobActionRow}>
                                  {applied ? (
                                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: '4px' }}>Applied</Tag>
                                  ) : (
                                    <Button type="primary" onClick={() => { setTab('discovery'); }} style={{ borderRadius: '4px' }}>Go to Apply</Button>
                                  )}
                                </div>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* OVERVIEW / ANALYTICS */}
                  {tab === "overview" && (
                    <motion.div key="overview" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                          <Card bordered={false} className={styles.metricCard}>
                            <Statistic title="Total Applications" value={apps.length} prefix={<UploadOutlined style={{color: '#275df5'}} />} />
                          </Card>
                        </Col>
                        <Col xs={24} md={12}>
                          <Card bordered={false} className={styles.metricCard}>
                            <Statistic title="Available Opportunities" value={jobs.length} prefix={<CompassOutlined style={{color: '#10b981'}} />} />
                          </Card>
                        </Col>
                      </Row>
                      
                      <Card bordered={false} className={styles.heroFeature} style={{marginTop: '16px'}}>
                        <Row align="middle">
                           <Col xs={24} md={16}>
                             <Title level={3} style={{margin: 0}}>Accelerate your career</Title>
                             <Paragraph style={{color: '#4b5563', marginTop: '8px'}}>Complete your profile, search for relevant opportunities, and land your ideal on-campus job.</Paragraph>
                             <Button type="primary" size="large" onClick={() => setTab('discovery')} style={{marginTop: '16px', borderRadius: '4px'}}>Explore Jobs</Button>
                           </Col>
                        </Row>
                      </Card>
                    </motion.div>
                  )}

                  {/* HISTORY / TRACKING */}
                  {tab === "history" && (
                    <motion.div key="history" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Title level={3} style={{ fontWeight: 600 }}>Application History</Title>
                      
                      <Card bordered={false} className={styles.itemCard}>
                        {apps.length === 0 ? (
                          <div className={styles.emptyState}>No activity detected. Apply to jobs to see them here.</div>
                        ) : (
                          <Timeline
                            mode="left"
                            items={apps.map(a => ({
                              color: a.status === 'APPROVED' ? 'green' : (a.status === 'REJECTED' ? 'red' : 'blue'),
                              children: (
                                <div>
                                   <Text strong style={{ fontSize: '15px' }}>{a.job.title}</Text>
                                   <br/>
                                   <Tag bordered={false} color={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'error' : 'processing'} style={{ marginTop: '8px', borderRadius: '4px' }}>
                                     {a.status}
                                   </Tag>
                                   <span style={{marginLeft: '8px', fontSize: '12px', color: '#9ca3af'}}>Updates will reflect here</span>
                                </div>
                              )
                            }))}
                          />
                        )}
                      </Card>
                    </motion.div>
                  )}

                  {/* PROFILE SETTINGS */}
                  {tab === "profile" && (
                    <motion.div key="profile" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Card bordered={false} className={styles.itemCard}>
                         <Title level={4} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>Profile Details</Title>
                         
                         <Row gutter={[0, 16]} style={{marginTop: '24px'}}>
                             <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Full Name</Text>
                               <Text strong>{user?.name}</Text>
                             </Col>
                             <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Email Address</Text>
                               <Text strong>{user?.email}</Text>
                             </Col>
                             <Col span={24} style={{ borderBottom: '1px solid var(--bg-app)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Authentication</Text>
                               <Tag bordered={false} color="default">{user?.authProvider || "Native Local"}</Tag>
                             </Col>
                             <Col span={24} style={{ paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Master Resume</Text>
                               <Space>
                                 <input type="file" id="masterResumeFile" style={{display:'none'}} onChange={async (e) => {
                                   try {
                                     await uploadMasterResume(user.id, e.target.files[0]);
                                     alert('Master Resume uploaded successfully! Job recommendations have been updated.');
                                     load();
                                   } catch(err) {
                                     alert('Failed to upload master resume');
                                   }
                                 }} />
                                 <Button onClick={() => document.getElementById("masterResumeFile").click()}>Upload PDF for AI Match</Button>
                               </Space>
                             </Col>
                         </Row>

                         <div style={{ marginTop: '32px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                               <WarningOutlined style={{ color: '#dc2626', fontSize: '24px' }} />
                               <div style={{ textAlign: 'left', flex: 1 }}>
                                  <Text strong style={{ display: 'block', color: '#dc2626' }}>Delete Account</Text>
                                  <Text type="secondary" style={{ color: '#991b1b', fontSize: '12px' }}>Permanently erase your data.</Text>
                               </div>
                               <Button danger onClick={() => { if (window.confirm("Initialize complete system memory wipe?")) deleteAccount(user.id).then(() => navigate("/login")) }} style={{ borderRadius: '4px' }}>
                                 Delete
                               </Button>
                            </div>
                         </div>
                      </Card>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Right Column (Ads/Banners) */}
              <div className={styles.rightColumn}>
                 <Card bordered={false} className={styles.adCard}>
                    <div style={{height: '250px', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', borderRadius: '4px'}}>
                       Space reserved for university notices
                    </div>
                 </Card>
              </div>

           </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
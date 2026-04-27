import React, { useEffect, useState } from "react";
import { getApplications, approveApp, addJob, getJobs, deleteJob, getAllHours, approveHours, payHours } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Menu, Typography, Card, Button, Input, Table,
  Badge, Tag, Statistic, Avatar, Space, Row, Col, Modal, ConfigProvider,
  Popconfirm, Dropdown, Segmented, Select, Form, Checkbox, Divider, message, Skeleton
} from "antd";
import {
  AppstoreOutlined, ProjectOutlined, TeamOutlined,
  ClockCircleOutlined, UserOutlined, LogoutOutlined,
  PlusOutlined, DeleteOutlined, CheckCircleOutlined,
  CloseCircleOutlined, FilePdfOutlined, ArrowRightOutlined,
  ThunderboltOutlined, BuildOutlined, FilterOutlined, WarningOutlined,
  CreditCardOutlined, BankOutlined, WalletOutlined, BellOutlined,
  SettingOutlined, SearchOutlined
} from "@ant-design/icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import styles from "./AdminDashboard.module.css";
import { useAuth } from "../context/AuthContext";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [hours, setHours] = useState([]);
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reqSkills, setReqSkills] = useState("");
  const [tab, setTab] = useState("overview");
  const [appFilter, setAppFilter] = useState("ALL");
  
  // UX Enhancements
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [actionLocks, setActionLocks] = useState({}); // Tracking loading states for buttons
  
  // Payment Gateway Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentHoursId, setPaymentHoursId] = useState(null);
  const [paymentGateway, setPaymentGateway] = useState('stripe');
  const [paymentForm] = Form.useForm();
  
  // Professional Modal Additional State
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedCard, setSelectedCard] = useState('new');

  useEffect(() => { 
    load();
  }, []);

  const load = async () => {
    setLoadingFeed(true);
    try {
      const [a, j, h] = await Promise.all([getApplications(), getJobs(), getAllHours()]);
      setApps(a || []); setJobs(j || []); setHours(h || []);
    } catch {
      message.error("Failed to sync system matrices. Gateway may be unreachable.");
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const lockAction = (id, bool) => setActionLocks(prev => ({ ...prev, [id]: bool }));

  const createJob = async () => {
    if (!title || !desc) {
      message.warning('Validation Error: Please fill all assignment fields.');
      return;
    }
    lockAction('create_job', true);
    try {
      await addJob({ title, description: desc, requiredSkills: reqSkills });
      message.success("Assignment successfully deployed.");
      setTitle(""); setDesc(""); setReqSkills(""); load();
      setTab("jobs");
    } catch (e) {
      message.error("Failed to deploy assignment.");
    } finally {
      lockAction('create_job', false);
    }
  };

  const removeJob = async (id) => {
    lockAction(`delete_${id}`, true);
    try {
      await deleteJob(id); 
      message.success("Assignment forcefully revoked.");
      load();
    } catch(e) {
      message.error("Revocation failed.");
    } finally {
      lockAction(`delete_${id}`, false);
    }
  };

  const handleApproveApp = async (id, status) => {
    lockAction(`app_${id}`, true);
    try {
      await approveApp(id, status);
      message.success(`Application structurally ${status.toLowerCase()}.`);
      load();
    } catch (e) {
      message.error("Review transmission failed.");
    } finally {
      lockAction(`app_${id}`, false);
    }
  };

  const handleApproveHours = async (id) => {
    lockAction(`hours_${id}`, true);
    try {
      await approveHours(id);
      message.success("Operation hours verified & approved.");
      load();
    } catch (e) { 
      message.error("Approval rejected by server"); 
    } finally {
      lockAction(`hours_${id}`, false);
    }
  };

  const processMockPayment = async () => {
    try {
      if (selectedCard === 'new') {
         await paymentForm.validateFields();
      }
      lockAction('pay_modal', true);
      await payHours(paymentHoursId);
      message.success(`Payment Processed Successfully`);
      setPaymentModalVisible(false);
      paymentForm.resetFields();
      load();
    } catch (e) {
      if(e.errorFields) return;
      message.error("Failed to process payment");
    } finally {
      lockAction('pay_modal', false);
    }
  };

  const totalHours = hours.reduce((s, h) => s + (h.hours || 0), 0);
  const pendingApps = apps.filter(a => a.status === "PENDING");
  
  // Calculate Top Performers
  const studentMap = {};
  hours.forEach(h => {
     if (h.student && h.student.name) {
       if (!studentMap[h.student.name]) studentMap[h.student.name] = { name: h.student.name, total: 0 };
       studentMap[h.student.name].total += (h.hours || 0);
     }
  });
  const topPerformers = Object.values(studentMap).sort((a,b) => b.total - a.total).slice(0, 5);

  const windowVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  const menuItems = [
    { key: "overview", label: "Dashboard", icon: <AppstoreOutlined /> },
    { key: "jobs", label: "Assignments", icon: <ProjectOutlined /> },
    { key: "apps", label: "Applications", icon: <TeamOutlined /> },
    { key: "hours", label: "Global Ledger", icon: <ClockCircleOutlined /> }
  ];

  const handleMenuClick = (e) => setTab(e.key);

  const profileMenuItems = [
     { key: "profile", label: "View Profile", icon: <UserOutlined /> },
     { type: "divider" },
     { key: "logout", label: "Logout", icon: <LogoutOutlined />, danger: true }
  ];

  const onProfileMenuClick = (e) => {
     if (e.key === "logout") handleLogout();
     else if (e.key === "profile") setTab("profile");
  };

  const chartData = [
    { name: 'Active Jobs', value: jobs.length },
    { name: 'Pending Apps', value: pendingApps.length },
    { name: 'Total Apps', value: apps.length }
  ];

  const filterSegmentOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  const filteredApps = apps.filter(a => appFilter === 'ALL' || a.status === appFilter);

  const themeConfig = {
    token: {
      colorPrimary: '#1d4ed8', // Enterprise Blue
      colorBgContainer: 'var(--bg-surface)',
      colorBorderSecondary: '#e5e7eb',
      borderRadius: 6,
      fontFamily: "'Inter', sans-serif",
    },
    components: {
      Card: {
        headerBg: 'var(--bg-surface-glass)',
        boxShadowCard: '0 2px 6px rgba(0, 0, 0, 0.05)',
      },
      Menu: {
        itemBg: 'transparent',
        itemActiveBg: 'transparent',
        itemSelectedBg: 'transparent',
        itemSelectedColor: '#1d4ed8',
      }
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className={styles.dashboardLayout}>
        {/* Top Navbar */}
        <Header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.brandGroup} onClick={() => setTab('overview')}>
              <span className={styles.logoBadge}><BuildOutlined style={{color: '#1d4ed8'}} /></span>
              <span className={styles.brandTitle}>Admin<span style={{fontWeight: 400, color: 'var(--text-muted)'}}>OS</span></span>
            </div>

            <Menu 
              mode="horizontal" 
              selectedKeys={[tab]} 
              onClick={handleMenuClick} 
              items={menuItems} 
              className={styles.menu}
            />

            <Space className={styles.profileTools} size="large" align="center">
              <div style={{display: 'flex', alignItems: 'center', background: 'var(--bg-app)', padding: '4px 12px', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--border-color)'}}>
                 <SearchOutlined style={{color: 'var(--text-muted)'}} />
                 <input placeholder="Search records..." style={{border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', fontSize: 'var(--text-sm)', width: '150px'}} />
              </div>
              
              <Badge count={pendingApps.length} size="small" offset={[-2, 6]}>
                 <Button type="text" icon={<BellOutlined style={{fontSize: 'var(--text-lg)', color: 'var(--text-heading)'}} />} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} />
              </Badge>
              
              <Button type="text" icon={<SettingOutlined style={{fontSize: 'var(--text-lg)', color: 'var(--text-heading)'}} />} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} />

              <Dropdown menu={{ items: profileMenuItems, onClick: onProfileMenuClick }} trigger={['click']}>
                 <Space style={{cursor: 'pointer', marginLeft: 'var(--space-2)'}}>
                   <Avatar style={{ backgroundColor: '#1d4ed8' }} icon={<UserOutlined />} />
                   <div style={{display: 'flex', flexDirection: 'column', lineHeight: 1.2}}>
                     <span className={styles.headerGreeting}>{user?.name?.split(" ")[0] || "Admin"}</span>
                     <span style={{fontSize: 'var(--text-xs)', color: 'var(--text-muted)'}}>Workspace</span>
                   </div>
                 </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className={styles.content}>
           <div className={styles.pageGrid}>
              
              {/* Left Column (Quick Actions) */}
              <div className={styles.leftColumn}>
                 <Card title="Quick Deploy" bordered={false} className={styles.quickActionCard}>
                    <Space direction="vertical" style={{width: '100%'}}>
                       <Input placeholder="Assignment Title" value={title} onChange={e => setTitle(e.target.value)} />
                       <Input.TextArea placeholder="Assignment Details..." value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{resize: 'none'}} />
                       <Input placeholder="Required Skills (e.g. Java, React, SQL)" value={reqSkills} onChange={e => setReqSkills(e.target.value)} />
                       <Button type="primary" block icon={<PlusOutlined />} loading={actionLocks['create_job']} onClick={createJob}>
                         Deploy Task
                       </Button>
                    </Space>
                 </Card>

                 <Card title="Top Performers" bordered={false} style={{marginTop: '24px'}} className={styles.metricCard}>
                    {loadingFeed ? <Skeleton active paragraph={{rows: 4}} title={false} /> : topPerformers.length === 0 ? <Text type="secondary" style={{fontSize: '12px'}}>No hours logged yet.</Text> : topPerformers.map((p, idx) => (
                       <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6'}}>
                           <Space>
                              <Avatar size="small" style={{backgroundColor: idx === 0 ? '#fbbf24' : '#1d4ed8'}}>{idx + 1}</Avatar>
                              <Text strong style={{fontSize: '13px'}}>{p.name}</Text>
                           </Space>
                           <Tag color="blue">{p.total}h</Tag>
                       </div>
                    ))}
                 </Card>
              </div>

              {/* Main Content Pane */}
              <div className={styles.mainColumn}>
                <AnimatePresence mode="wait">
                  {tab === "overview" && (
                    <motion.div key="overview" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <Card bordered={false} className={styles.metricCard}>
                            <Skeleton loading={loadingFeed} active paragraph={{rows: 1}} title={false}>
                               <Statistic title="Active Assignments" value={jobs.length} prefix={<ProjectOutlined style={{color: '#1d4ed8'}} />} />
                            </Skeleton>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card bordered={false} className={styles.metricCard}>
                            <Skeleton loading={loadingFeed} active paragraph={{rows: 1}} title={false}>
                               <Statistic title="Awaiting Review" value={pendingApps.length} prefix={<TeamOutlined style={{color: '#f59e0b'}} />} />
                            </Skeleton>
                          </Card>
                        </Col>
                        <Col xs={24} md={8}>
                          <Card bordered={false} className={styles.metricCard}>
                            <Skeleton loading={loadingFeed} active paragraph={{rows: 1}} title={false}>
                              <Statistic title="Total Hours Logged" value={totalHours} prefix={<ClockCircleOutlined style={{color: '#10b981'}} />} suffix="h" />
                            </Skeleton>
                          </Card>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                        <Col xs={24} lg={14}>
                          <Card bordered={false} title="System Activity Feed" className={styles.itemCard} style={{height: '100%'}}>
                             {loadingFeed ? <Skeleton active paragraph={{rows: 8}} /> : apps.length === 0 ? <Text type="secondary">System feed idle.</Text> : apps.slice(0, 5).map((a, idx) => (
                                <div key={idx} style={{display: 'flex', margin: '12px 0', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6'}}>
                                   <Avatar size="large" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', marginRight: '16px' }}>{a.student?.name?.charAt(0) || "U"}</Avatar>
                                   <div>
                                      <Text strong>{a.student?.name || "Unknown"}</Text> applied for <Text strong>{a.job?.title || "a job"}</Text>
                                      <div style={{marginTop: '4px'}}>
                                         <Tag color={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'error' : 'warning'}>{a.status}</Tag>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </Card>
                        </Col>
                        <Col xs={24} lg={10}>
                          <Card bordered={false} className={styles.chartCard} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Title level={5} style={{ marginBottom: '20px' }}>System Metrics</Title>
                            <div style={{ flex: 1, minHeight: '220px' }}>
                              {!loadingFeed && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} barSize={25} />
                                  </BarChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </motion.div>
                  )}

                  {tab === "jobs" && (
                    <motion.div key="jobs" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Title level={3} style={{ fontWeight: 600 }}>Deployment Matrix</Title>
                      <Paragraph type="secondary" style={{ marginBottom: '24px' }}>Active assignments available into the gateway.</Paragraph>

                      <Row gutter={[16, 16]}>
                        {loadingFeed ? (
                           <>
                             <Col xs={24} md={12}><Card className={styles.itemCard}><Skeleton active paragraph={{rows: 3}} /></Card></Col>
                             <Col xs={24} md={12}><Card className={styles.itemCard}><Skeleton active paragraph={{rows: 3}} /></Card></Col>
                           </>
                        ) : jobs.map(j => (
                          <Col xs={24} md={12} key={j.id}>
                            <motion.div whileHover={{ y: -2 }}>
                              <Card 
                                bordered={false} 
                                className={styles.itemCard}
                                actions={[
                                  <Popconfirm title="Delete this assignment?" onConfirm={() => removeJob(j.id)}>
                                    <Button type="text" danger icon={<DeleteOutlined />} loading={actionLocks[`delete_${j.id}`]}>Revoke</Button>
                                  </Popconfirm>
                                ]}
                              >
                                <Card.Meta 
                                  title={<span style={{color: 'var(--text-heading)'}}>{j.title}</span>} 
                                  description={<span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{j.description}</span>} 
                                />
                              </Card>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </motion.div>
                  )}

                  {tab === "apps" && (
                    <motion.div key="apps" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                         <div>
                            <Title level={3} style={{ fontWeight: 600, margin: 0 }}>Approval Queue</Title>
                            <Paragraph type="secondary" style={{ margin: 0 }}>Review student transmissions.</Paragraph>
                         </div>
                         <div>
                            <Segmented options={filterSegmentOptions} value={appFilter} onChange={setAppFilter} />
                         </div>
                      </div>

                      <Row gutter={[16, 16]}>
                        {loadingFeed ? (
                           <>
                             <Col xs={24} md={12}><Card className={styles.itemCard}><Skeleton active avatar paragraph={{rows: 3}} /></Card></Col>
                             <Col xs={24} md={12}><Card className={styles.itemCard}><Skeleton active avatar paragraph={{rows: 3}} /></Card></Col>
                           </>
                        ) : filteredApps.length === 0 ? <div style={{width: '100%', textAlign: 'center', padding: '40px'}}><Text type="secondary">No applications found in this queue.</Text></div> 
                        : filteredApps.map(a => (
                          <Col xs={24} md={12} key={a.id}>
                             <motion.div whileHover={{ y: -2 }}>
                              <Card bordered={false} className={styles.itemCard}>
                                <div className={styles.appHeader}>
                                  <Avatar size="large" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>
                                    {a.student?.name ? a.student.name.charAt(0) : "?"}
                                  </Avatar>
                                  <div style={{ flex: 1, marginLeft: '12px' }}>
                                    <Text strong style={{ display: 'block', fontSize: '15px' }}>{a.student?.name || "Unknown Student"}</Text>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>{a.job?.title || "Deleted Job"}</Text>
                                  </div>
                                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                                    <Tag bordered={false} color={a.status === 'APPROVED' ? 'success' : a.status === 'REJECTED' ? 'error' : 'warning'} style={{ borderRadius: '6px', margin: 0 }}>
                                      {a.status}
                                    </Tag>
                                    {a.matchScore !== undefined && a.matchScore !== null && (
                                       <Tag color={a.matchScore >= 70 ? "green" : (a.matchScore >= 40 ? "orange" : "red")} style={{margin: 0}}>
                                         Match: {a.matchScore}%
                                       </Tag>
                                    )}
                                  </div>
                                </div>
                                
                                {a.missingSkills && (
                                   <div style={{padding: '12px 16px 0', fontSize: '12px', color: '#dc2626'}}>
                                       <WarningOutlined style={{marginRight:'4px'}} /> Missing: {a.missingSkills}
                                   </div>
                                )}

                                <div className={styles.appTools}>
                                  <Button type="link" icon={<FilePdfOutlined />} href={`http://localhost:8080/api/applications/resume/${a.id}`} target="_blank" style={{ padding: 0, color: '#1d4ed8', fontWeight: 500 }}>
                                    Review Resume
                                  </Button>
                                  {a.status === "PENDING" && (
                                    <Space style={{ marginTop: '16px', display: 'flex', width: '100%', justifyContent: 'space-between' }} size="small">
                                      <Button type="primary" style={{ background: '#10b981', borderColor: '#10b981', flex: 1, borderRadius: '4px' }} icon={<CheckCircleOutlined />} loading={actionLocks[`app_${a.id}`]} onClick={() => { handleApproveApp(a.id, "APPROVED"); }}>
                                        Approve
                                      </Button>
                                      <Button danger type="primary" icon={<CloseCircleOutlined />} style={{ flex: 1, borderRadius: '4px' }} loading={actionLocks[`app_${a.id}`]} onClick={() => { handleApproveApp(a.id, "REJECTED"); }}>
                                        Decline
                                      </Button>
                                    </Space>
                                  )}
                                </div>
                              </Card>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </motion.div>
                  )}

                  {tab === "hours" && (
                    <motion.div key="hours" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <Title level={3} style={{ fontWeight: 600 }}>Global Ledger</Title>
                      <Paragraph type="secondary">System-wide operational hours report.</Paragraph>

                      <Card bordered={false} className={styles.tableCard} style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
                         <Table 
                           dataSource={hours} 
                           rowKey="id" 
                           loading={loadingFeed}
                           pagination={{ pageSize: 12 }}
                           columns={[
                             { title: 'Student Identity', dataIndex: ['student', 'name'], key: 'student', render: text => <Text strong>{text || 'Unknown'}</Text> },
                             { title: 'Assignment Link', dataIndex: ['job', 'title'], key: 'job', render: text => <Text type="secondary">{text || 'Unknown'}</Text> },
                             { title: 'Date', dataIndex: 'date', key: 'date', render: text => <Text type="secondary">{text || 'N/A'}</Text> },
                             { title: 'Logged Duration', dataIndex: 'hours', key: 'hours', render: h => <Tag color="blue" bordered={false} style={{ fontWeight: 600, fontSize: '13px' }}>{h} hr</Tag> },
                             { title: 'Earnings', key: 'earnings', render: (_, record) => <Text strong style={{ color: 'var(--text-heading)' }}>${(record.hours * (record.job?.hourlyRate || 15)).toFixed(2)}</Text> },
                             { title: 'Status', dataIndex: 'status', key: 'status', render: status => {
                                 let color = 'default';
                                 if (status === 'APPROVED') color = 'processing';
                                 else if (status === 'PAID') color = 'success';
                                 else if (status === 'PENDING') color = 'warning';
                                 return <Tag color={color}>{status || 'PENDING'}</Tag>;
                             }},
                             { title: 'Action', key: 'action', render: (_, record) => {
                                 if (record.status === 'PENDING' || !record.status) {
                                   return <Button size="small" type="primary" loading={actionLocks[`hours_${record.id}`]} style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => handleApproveHours(record.id)}>Approve</Button>;
                                 } else if (record.status === 'APPROVED') {
                                   return <Button size="small" type="primary" style={{ background: '#1d4ed8' }} onClick={() => { setPaymentHoursId(record.id); setPaymentAmount(record.hours * (record.job?.hourlyRate || 15)); setPaymentModalVisible(true); }}>Pay Student</Button>;
                                 }
                                 return <Text type="secondary">Settled</Text>;
                             }}
                           ]}
                         />
                      </Card>
                    </motion.div>
                  )}

                  {tab === "profile" && (
                    <motion.div key="profile" variants={windowVariants} initial="initial" animate="animate" exit="exit">
                      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
                        <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', marginBottom: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                        <Title level={4} style={{ marginBottom: 4, fontWeight: 700 }}>{user?.name || "Root Admin"}</Title>
                        <Tag bordered={false} color="processing" style={{ borderRadius: '6px', padding: '2px 12px' }}>System Administrator</Tag>
                        
                        <Card bordered={false} className={styles.itemCard} style={{ marginTop: '2.5rem', textAlign: 'left', borderRadius: '12px' }}>
                          <Row gutter={[0, 16]}>
                             <Col span={24} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Admin Tag</Text>
                               <Text strong>{user?.email}</Text>
                             </Col>
                             <Col span={24} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Security Protocol</Text>
                               <Tag bordered={false} color="default" style={{margin: 0}}>{user?.authProvider || "Local Vault"}</Tag>
                             </Col>
                             <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <Text type="secondary">Assigned Permissions</Text>
                               <Text strong style={{ color: '#1d4ed8' }}>Full</Text>
                             </Col>
                          </Row>
                        </Card>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </Content>

        {/* Professional Checkout Modal */}
        <Modal
          open={paymentModalVisible}
          onCancel={() => { setPaymentModalVisible(false); paymentForm.resetFields(); setSelectedCard('new'); }}
          footer={null}
          destroyOnClose
          width={500}
          closable={false}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ fontWeight: 700, color: '#4b5563', margin: 0 }}>Payment</Title>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
             <Text style={{ color: '#3b82f6', fontWeight: 600, fontSize: '13px' }}>Your Card</Text>
             <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                {/* Mock Card 1 */}
                <div onClick={() => setSelectedCard('card1')} style={{ border: selectedCard === 'card1' ? '2px solid #3b82f6' : '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', width: '90px', transition: 'all 0.2s' }}>
                   <div style={{display: 'flex', justifyContent: 'center', marginBottom: '8px'}}>
                     <div style={{width: 24, height: 24, borderRadius: '50%', background: '#ef4444', marginRight: -8, opacity: 0.9}}></div>
                     <div style={{width: 24, height: 24, borderRadius: '50%', background: '#f59e0b', opacity: 0.9}}></div>
                   </div>
                   <Text type="secondary" style={{fontSize: '11px'}}>***3137</Text>
                </div>
                {/* Mock Card 2 */}
                <div onClick={() => setSelectedCard('card2')} style={{ border: selectedCard === 'card2' ? '2px solid #3b82f6' : '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', width: '90px', transition: 'all 0.2s' }}>
                   <div style={{color: '#1d4ed8', fontWeight: 900, fontSize: '16px', paddingBottom: '3px', marginTop: '5px', fontStyle: 'italic', letterSpacing: '-1px'}}>VISA</div>
                   <Text type="secondary" style={{fontSize: '11px'}}>***6482</Text>
                </div>
                {/* Mock Card 3 */}
                <div onClick={() => setSelectedCard('card3')} style={{ border: selectedCard === 'card3' ? '2px solid #3b82f6' : '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', width: '90px', transition: 'all 0.2s' }}>
                   <div style={{color: '#1d4ed8', fontWeight: 900, fontSize: '16px', paddingBottom: '3px', marginTop: '5px', fontStyle: 'italic', letterSpacing: '-1px'}}>VISA</div>
                   <Text type="secondary" style={{fontSize: '11px'}}>***2390</Text>
                </div>
             </div>
          </div>

          <Text style={{ color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }} onClick={() => setSelectedCard('new')}>Add New Card</Text>
          
          <div style={{ marginTop: '16px', opacity: selectedCard === 'new' ? 1 : 0.5, pointerEvents: selectedCard === 'new' ? 'auto' : 'none', transition: 'all 0.3s' }}>
             <Form form={paymentForm} layout="vertical">
                <Form.Item label={<Text type="secondary" style={{fontSize:'12px'}}>Card Holder Name</Text>} name="cardName" rules={[{required: selectedCard === 'new', message: 'Name Required'}]}>
                   <Input style={{ borderRadius: '4px', padding: '8px 12px' }} />
                </Form.Item>
                <Form.Item label={<Text type="secondary" style={{fontSize:'12px'}}>Card number</Text>} name="cardNumber" rules={[{required: selectedCard === 'new', message: 'Card Number Required'}]}>
                   <Input style={{ borderRadius: '4px', padding: '8px 12px' }} />
                </Form.Item>
                
                <Row gutter={16}>
                   <Col span={8}>
                     <Form.Item label={<Text type="secondary" style={{fontSize:'12px'}}>Expiry Date</Text>} rules={[{required: selectedCard === 'new'}]}>
                        <div style={{ display: 'flex' }}>
                           <Input style={{ width: '50%', textAlign: 'center', borderRadius: '4px 0 0 4px', borderRight: '1px solid transparent', padding: '4px 2px' }} placeholder="Month" />
                           <Input style={{ width: '50%', textAlign: 'center', borderRadius: '0 4px 4px 0', borderLeft: '1px solid #e5e7eb', padding: '4px 2px' }} placeholder="Year" />
                        </div>
                     </Form.Item>
                   </Col>
                   <Col span={8}>
                     <Form.Item label={<Text type="secondary" style={{fontSize:'12px'}}>CVV</Text>} name="cvc" rules={[{required: selectedCard === 'new', message: 'CVV!'}]}>
                        <Input style={{ borderRadius: '4px' }} suffix={<div style={{background: '#e5e7eb', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold'}}>?</div>} />
                     </Form.Item>
                   </Col>
                   <Col span={8}>
                     <Form.Item label={<Text type="secondary" style={{fontSize:'12px'}}>Card Type</Text>}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <div style={{ border: '1px solid #e5e7eb', padding: '5px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '32px' }}>
                             <div style={{display: 'flex', alignItems: 'center'}}>
                               <div style={{width: 14, height: 14, borderRadius: '50%', background: '#ef4444', marginRight: -6, opacity: 0.9}}></div>
                               <div style={{width: 14, height: 14, borderRadius: '50%', background: '#f59e0b', opacity: 0.9}}></div>
                             </div>
                           </div>
                           <div style={{ border: '1px solid #e5e7eb', padding: '5px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', color: '#1d4ed8', fontWeight: 900, fontStyle: 'italic', fontSize: '10px', height: '32px' }}>
                             VISA
                           </div>
                        </div>
                     </Form.Item>
                   </Col>
                </Row>

                <Form.Item name="saveCard" valuePropName="checked" style={{ marginBottom: '16px' }}>
                   <Checkbox><Text type="secondary" style={{fontSize:'12px'}}>Save my details for future payment</Text></Checkbox>
                </Form.Item>
             </Form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
             <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Total</Text>
                <div style={{ color: '#60a5fa', fontSize: '28px', fontWeight: 600 }}>{paymentAmount.toFixed(1)}$</div>
             </div>
             <Button type="primary" loading={actionLocks['pay_modal']} onClick={processMockPayment} style={{ background: '#3b82f6', borderColor: '#3b82f6', height: '48px', padding: '0 48px', fontSize: '16px', fontWeight: 500, borderRadius: '6px' }}>
                Pay Now
             </Button>
          </div>
        </Modal>

      </Layout>
    </ConfigProvider>
  );
}
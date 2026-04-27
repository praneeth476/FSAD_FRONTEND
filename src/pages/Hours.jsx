import React, { useEffect, useState } from "react";
import { getStudentApps, addHours, getStudentHours } from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layout, Menu, Typography, Card, Button, Space, Row, Col,
  Statistic, Avatar, Tag, ConfigProvider, Dropdown, Table, InputNumber, Select, message
} from "antd";
import { useAuth } from "../context/AuthContext";
import {
  HomeOutlined, HistoryOutlined, UserOutlined,
  LogoutOutlined, SearchOutlined, HeartOutlined,
  SyncOutlined, ClockCircleOutlined, PlusOutlined
} from "@ant-design/icons";
import styles from "./StudentDashboard.module.css"; // Reuse styling for identical top bar

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function Hours() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [apps, setApps] = useState([]);
  const [records, setRecords] = useState([]);
  const [hours, setHours] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    load();
  }, [user, navigate]);

  const load = async () => {
    if (!user) return;
    try {
      const [appsData, hoursData] = await Promise.all([getStudentApps(user.id), getStudentHours(user.id)]);
      setApps(appsData || []); 
      setRecords(hoursData || []);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async () => {
    if (!hours || !jobId) return message.warning("Select an approved deployment and specify hours.");
    setLoading(true);
    try {
      await addHours(user.id, jobId, hours);
      setHours(null); setJobId(null); 
      message.success("Time block successfully processed."); 
      load();
    } catch { message.error("Failed to log time block."); } 
    finally { setLoading(false); }
  };

  const totalLogged = records.reduce((s, r) => s + parseFloat(r.hours || 0), 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { key: "discovery", label: "Jobs", icon: <SearchOutlined /> },
    { key: "overview", label: "Dashboard", icon: <HomeOutlined /> },
    { key: "history", label: "Applied", icon: <HistoryOutlined /> },
    { key: "saved", label: "Saved Jobs", icon: <HeartOutlined /> },
    { key: "hours", label: "Log Hours", icon: <SyncOutlined /> }
  ];

  const handleMenuClick = (e) => {
    if (e.key !== "hours") {
      navigate('/student'); // Redirect to student dashboard where state handle other tabs
    }
  };

  const profileMenuItems = [
     { key: "profile", label: "View Profile", icon: <UserOutlined /> },
     { type: "divider" },
     { key: "logout", label: "Logout", icon: <LogoutOutlined />, danger: true }
  ];

  const onProfileMenuClick = (e) => {
     if (e.key === "logout") handleLogout();
     else if (e.key === "profile") navigate("/student"); 
  };

  const windowVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
  };

  const themeConfig = {
    token: {
      colorPrimary: '#275df5', // Naukri Blue
      colorBgContainer: 'var(--bg-surface)',
      colorBorderSecondary: 'var(--bg-app)',
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

  const approvedApps = apps.filter(a => a.status === "APPROVED");

  const columns = [
    { title: 'Assignment', dataIndex: ['job', 'title'], key: 'job', render: text => <Text strong>{text}</Text> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: text => <Text type="secondary">{text || new Date().toLocaleDateString()}</Text> },
    { title: 'Volume', dataIndex: 'hours', key: 'hours', render: h => <Tag color="blue">{h} HRS</Tag> },
    { title: 'Rate', dataIndex: ['job', 'hourlyRate'], key: 'rate', render: rate => <Text type="secondary">${rate || 15}/hr</Text> },
    { title: 'Earnings', key: 'earnings', render: (_, record) => <Text strong style={{ color: 'var(--text-heading)' }}>${(record.hours * (record.job?.hourlyRate || 15)).toFixed(2)}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: status => {
        let color = 'default';
        if (status === 'APPROVED') color = 'processing';
        else if (status === 'PAID') color = 'success';
        else if (status === 'PENDING') color = 'warning';
        return <Tag color={color}>{status || 'PENDING'}</Tag>;
    }}
  ];

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className={styles.dashboardLayout}>
        <Header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.brandGroup} onClick={() => navigate('/student')}>
              <span className={styles.logoBadge}>💼</span>
              <span className={styles.brandTitle}>Work<span style={{fontWeight: 400, color: 'var(--text-muted)'}}>Study</span></span>
            </div>

            <Menu 
              mode="horizontal" 
              selectedKeys={["hours"]} 
              onClick={handleMenuClick} 
              items={menuItems} 
              className={styles.menu}
            />

            <Space className={styles.profileTools} size="large">
              <Dropdown menu={{ items: profileMenuItems, onClick: onProfileMenuClick }} trigger={['click']}>
                 <Space style={{cursor: 'pointer'}}>
                   <Avatar style={{ backgroundColor: '#275df5' }} icon={<UserOutlined />} />
                   <div style={{display: 'flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'left'}}>
                     <span className={styles.headerGreeting}>{user?.name?.split(' ')[0] || "User"}</span>
                     <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>Profile</span>
                   </div>
                 </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content className={styles.content}>
           <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <AnimatePresence mode="wait">
                <motion.div variants={windowVariants} initial="initial" animate="animate" exit="exit">
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={3} style={{ margin: 0, fontWeight: 600 }}>Time Compute</Title>
                    <Paragraph type="secondary">Synchronize your deployment tracking with the central ledger.</Paragraph>
                  </div>

                  <Row gutter={[24, 24]}>
                     <Col xs={24} md={8}>
                        <Card title="Initialize Sync" bordered={false} className={styles.itemCard}>
                           <Space direction="vertical" style={{width: '100%'}} size="large">
                              <div>
                                 <div style={{marginBottom: 8}}><Text strong>Target Deployment</Text></div>
                                 <Select 
                                   style={{ width: '100%' }} 
                                   placeholder="Select active assignment..."
                                   value={jobId}
                                   onChange={setJobId}
                                   size="large"
                                 >
                                    {approvedApps.map(a => (
                                       <Option key={a.job.id} value={a.job.id}>{a.job.title}</Option>
                                    ))}
                                 </Select>
                                 {approvedApps.length === 0 && <Text type="secondary" style={{fontSize: 12}}>No approved assignments available.</Text>}
                              </div>

                              <div>
                                 <div style={{marginBottom: 8}}><Text strong>Time Delta (Hours)</Text></div>
                                 <InputNumber 
                                   style={{ width: '100%' }}
                                   placeholder="e.g. 4.5"
                                   step={0.5}
                                   min={0.1}
                                   value={hours}
                                   onChange={setHours}
                                   size="large"
                                 />
                              </div>

                              <Button 
                                type="primary" 
                                block 
                                size="large" 
                                icon={<PlusOutlined />} 
                                onClick={handleAdd}
                                loading={loading}
                              >
                                Push Authorization
                              </Button>
                           </Space>
                        </Card>
                        
                        <Card bordered={false} className={styles.metricCard} style={{marginTop: '24px'}}>
                            <Statistic title="Total Hours Synced" value={totalLogged} precision={1} prefix={<ClockCircleOutlined style={{color: 'var(--text-heading)'}} />} suffix="HRS" />
                        </Card>
                     </Col>

                     <Col xs={24} md={16}>
                        <Card title="Immutable Ledger" bordered={false} className={styles.itemCard} styles={{ body: { padding: 0 } }}>
                           <Table 
                             dataSource={records} 
                             columns={columns} 
                             rowKey="id"
                             pagination={{ pageSize: 8 }}
                             locale={{ emptyText: 'Ledger is empty.' }}
                           />
                        </Card>
                     </Col>
                  </Row>
                </motion.div>
              </AnimatePresence>
           </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
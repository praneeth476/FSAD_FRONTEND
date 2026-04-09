import axios from 'axios';

const BASE = "/api";
const api = axios.create({ baseURL: BASE });

/* ================= REGISTER ================= */

export const registerStudent = async (data) => {
  try {
    const res = await api.post("/students/register", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Registration failed");
  }
};

/* ================= LOGIN ================= */

export const loginStudent = async (data) => {
  try {
    const res = await api.post("/students/login", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Invalid login");
  }
};

export const oauthLoginStudent = async (data) => {
  try {
    const res = await api.post("/students/oauth-login", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "OAuth login failed");
  }
};

export const verifyMfaStudent = async (data) => {
  try {
    const res = await api.post("/students/verify-mfa", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Invalid MFA code");
  }
};

export const sendForgotPasswordOtp = async (data) => {
  try {
    const res = await api.post("/students/forgot-password-otp", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Could not send OTP");
  }
};

export const resetPasswordWithOtp = async (data) => {
  try {
    const res = await api.put("/students/reset-password", data);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Could not verify OTP or reset password");
  }
};

export const uploadMasterResume = async (studentId, file) => {
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await api.post(`/students/${studentId}/master-resume`, form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Upload failed");
  }
};

/* ================= JOBS ================= */

export const getJobs = async () => {
  const res = await api.get("/jobs");
  return res.data;
};

export const getRecommendedJobs = async (studentId) => {
  try {
    const res = await api.get(`/jobs/recommendations/${studentId}`);
    return res.data;
  } catch (err) {
    console.warn("Backend not yet restarted for AI features. Falling back to all jobs:", err);
    return getJobs();
  }
};

export const addJob = async (job) => {
  try {
    const res = await api.post("/jobs", job);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Job creation failed");
  }
};

export const deleteJob = async(id) => {
  try {
    await api.delete(`/jobs/${id}`);
  } catch (err) {
    throw new Error(err.response?.data?.message || "Delete job failed");
  }
};

/* ================= APPLICATIONS ================= */

export const applyJob = async (sid, jid, file) => {
  const form = new FormData();
  form.append("studentId", sid);
  form.append("jobId", jid);
  form.append("resume", file);

  try {
    const res = await api.post("/applications/apply", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Apply failed");
  }
};

export const getApplications = async () => {
  const res = await api.get("/applications");
  return res.data;
};

export const approveApp = async (id, status="APPROVED") => {
  try {
    await api.put(`/applications/${id}?status=${status}`);
  } catch (err) {
    throw new Error(err.response?.data?.message || "Approve failed");
  }
};

export const getStudentApps = async (sid) => {
  const res = await api.get(`/applications/student/${sid}`);
  return res.data;
};

/* ================= HOURS ================= */

export const addHours = async (sid, jid, hours) => {
  try {
    const res = await api.post(`/hours?studentId=${sid}&jobId=${jid}&hours=${hours}`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Add hours failed");
  }
};

export const getStudentHours = async (sid) => {
  const res = await api.get(`/hours/student/${sid}`);
  return res.data;
};

export const getAllHours = async () => {
  const res = await api.get("/hours");
  return res.data;
};

export const approveHours = async (id) => {
  try {
    const res = await api.put(`/hours/${id}/approve`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to approve hours");
  }
};

export const payHours = async (id) => {
  try {
    const res = await api.post(`/hours/${id}/pay`);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to process payment");
  }
};

/* ================= DELETE ACCOUNT ================= */

export const deleteAccount = async(id) => {
  try {
    await api.delete(`/students/${id}`);
  } catch (err) {
    throw new Error(err.response?.data?.message || "Delete failed");
  }
};

export const getStudents = async () => {
  try {
    const res = await api.get("/students");
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to fetch students");
  }
};

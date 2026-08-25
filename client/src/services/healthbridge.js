import api, { setAccessToken, clearAccessToken } from './api.js';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.data.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAccessToken();
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },
};

export const patientService = {
  async getMyProfile() {
    const res = await api.get('/patients/me');
    return res.data.data.patient;
  },

  async updateMyProfile(data) {
    const res = await api.put('/patients/me', data);
    return res.data.data.patient;
  },

  async getMySummary() {
    const res = await api.get('/patients/me/summary');
    return res.data.data;
  },

  async getMyTimeline(params = {}) {
    const res = await api.get('/patients/me/timeline', { params });
    return res.data.data;
  },

  async getPatientById(patientId) {
    const res = await api.get(`/patients/${patientId}`);
    return res.data.data.patient;
  },

  async searchPatients(query = '') {
    const res = await api.get('/patients/search', { params: { q: query } });
    return res.data.data.patients;
  },
};

export const consentService = {
  async getMyConsents(params = {}) {
    const res = await api.get('/consents', { params });
    return res.data.data.consents;
  },

  async getConsentById(id) {
    const res = await api.get(`/consents/${id}`);
    return res.data.data.consent;
  },

  async approveConsent(id, durationDays = 30) {
    const res = await api.post(`/consents/${id}/approve`, { durationDays });
    return res.data.data.consent;
  },

  async rejectConsent(id, reason) {
    const res = await api.post(`/consents/${id}/reject`, { reason });
    return res.data.data.consent;
  },

  async revokeConsent(id, reason) {
    const res = await api.post(`/consents/${id}/revoke`, { reason });
    return res.data.data.consent;
  },

  async requestAccess(patientId, data) {
    const res = await api.post(`/consents/request/${patientId}`, data);
    return res.data.data.consent;
  },

  async getDoctorConsents(params = {}) {
    const res = await api.get('/consents/doctor', { params });
    return res.data.data.consents;
  },
};

export const recordsService = {
  async getMyRecords(resourceType, params = {}) {
    const res = await api.get(`/records/me/${resourceType}`, { params });
    return res.data;
  },

  async getDoctorPatientView(patientId) {
    const res = await api.get(`/records/patient/${patientId}/view`);
    return res.data.data;
  },

  async requestEmergencyAccess(patientId, emergencyReason) {
    const res = await api.post(`/records/emergency/${patientId}`, { emergencyReason });
    return res.data.data;
  },
};

export const auditService = {
  async getMyAuditHistory(params = {}) {
    const res = await api.get('/audit/me', { params });
    return res.data;
  },

  async getAllAuditEvents(params = {}) {
    const res = await api.get('/audit/all', { params });
    return res.data;
  },
};

export { intakeService } from './intakeService.js';

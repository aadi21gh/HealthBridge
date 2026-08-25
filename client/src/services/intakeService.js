import api from './api.js';

export const intakeService = {
  // ── Patient Identification ──
  async searchPatient(data) {
    const res = await api.post('/intake/patient-search', data);
    return res.data.data.patients;
  },

  // ── Session Lifecycle ──
  async startSession(sessionData) {
    const res = await api.post('/intake/sessions', sessionData);
    return res.data.data;
  },

  async getSession(sessionId) {
    const res = await api.get(`/intake/sessions/${sessionId}`);
    return res.data.data;
  },

  async submitAnswer(sessionId, data) {
    const res = await api.post(`/intake/sessions/${sessionId}/answer`, data);
    return res.data.data;
  },

  async uploadDocument(sessionId, formData) {
    const res = await api.post(`/intake/sessions/${sessionId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async completeSession(sessionId) {
    const res = await api.post(`/intake/sessions/${sessionId}/complete`);
    return res.data.data;
  },

  async abandonSession(sessionId, reason) {
    const res = await api.post(`/intake/sessions/${sessionId}/abandon`, { reason });
    return res.data.data;
  },

  // ── Question Bank & Translations ──
  async getQuestions(language = 'en') {
    const res = await api.get(`/intake/questions/${language}`);
    return res.data.data;
  },

  // ── AYUSH Intake ──
  async getAyushModule(discipline) {
    const res = await api.get(`/intake/ayush/${discipline}`);
    return res.data.data.module;
  },

  async submitAyushAssessment(discipline, data) {
    const res = await api.post(`/intake/ayush/${discipline}/assessment`, data);
    return res.data.data.assessment;
  },

  // ── Voice STT / TTS ──
  async transcribeVoice(formData) {
    const res = await api.post('/intake/voice/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async synthesizeVoice(text, language = 'en', voiceGender = 'neutral') {
    const res = await api.post('/intake/voice/synthesize', { text, language, voiceGender });
    return res.data.data;
  },

  // ── Doctor Verification Workflow ──
  async getDoctorBriefing(sessionId) {
    const res = await api.get(`/intake/doctor/briefing/${sessionId}`);
    return res.data.data;
  },

  async verifyFact(factId, data) {
    const res = await api.post(`/intake/doctor/facts/${factId}/verify`, data);
    return res.data.data;
  },

  async finalizeAndPromote(sessionId, data = {}) {
    const res = await api.post(`/intake/doctor/sessions/${sessionId}/finalize`, data);
    return res.data.data;
  },

  // ── Analytics ──
  async getIntakeAnalytics() {
    const res = await api.get('/intake/analytics');
    return res.data.data;
  },

  // ── Kiosk Hardware Management ──
  async listKiosks(params = {}) {
    const res = await api.get('/kiosks', { params });
    return res.data;
  },

  async registerKiosk(data) {
    const res = await api.post('/kiosks/register', data);
    return res.data.data;
  },

  async updateKiosk(id, data) {
    const res = await api.patch(`/kiosks/${id}`, data);
    return res.data.data;
  },

  async disableKiosk(id, reason) {
    const res = await api.post(`/kiosks/${id}/disable`, { reason });
    return res.data.data;
  },

  async getKioskActivity(id) {
    const res = await api.get(`/kiosks/${id}/activity`);
    return res.data.data;
  },
};

export default intakeService;

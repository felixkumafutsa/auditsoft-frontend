// --- src/services/api.ts ---

const getBaseUrl = () => {
  let apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  // Remove trailing slash if present to avoid double slashes
  if (apiUrl.endsWith('/')) {
    apiUrl = apiUrl.slice(0, -1);
  }
  return `${apiUrl}/api`;
};

const BASE_URL = getBaseUrl();

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Debugging: Log API URL to help troubleshoot cloud connection issues
    console.log('AuditSoft API Client Initialized. Base URL:', BASE_URL);

    // You could load the token from localStorage here if persisting
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }
    return response.json();
  }

  // --- Generic Request Methods ---
  private async get(endpoint: string): Promise<any> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  private async post(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  private async put(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  private async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  private async upload(endpoint: string, formData: FormData): Promise<any> {
    const headers: any = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    // Content-Type header is not set manually for FormData to allow browser to set boundary
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  // --- Auth ---
  async login(email: string, pass: string): Promise<any> {
    const user = await this.post('/auth/login', { email, pass });
    if (user && user.token) { // Assuming backend sends a token
      this.token = user.token;
      localStorage.setItem('token', user.token);
    }
    return user;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // --- Roles ---
  getRoles = () => this.get('/roles');
  getRole = (id: number) => this.get(`/roles/${id}`);
  createRole = (data: { roleName: string, description?: string }) => this.post('/roles', data);
  updateRole = (id: number, data: { roleName?: string, description?: string }) => this.put(`/roles/${id}`, data);
  deleteRole = (id: number) => this.delete(`/roles/${id}`);

  // --- Users ---
  getUsers = () => this.get('/users');
  getUser = (id: number) => this.get(`/users/${id}`);
  getProfile = () => this.get('/users/me');
  createUser = (data: any) => this.post('/users', data); // Define a proper DTO later
  updateUser = (id: number, data: any) => this.put(`/users/${id}`, data);
  updateProfile = (formData: FormData) => this.upload('/users/me', formData);
  deleteUser = (id: number) => this.delete(`/users/${id}`);
  assignRoleToUser = (userId: number, roleId: number) => this.post(`/users/${userId}/roles/${roleId}`, {});
  removeRoleFromUser = (userId: number, roleId: number) => this.delete(`/users/${userId}/roles/${roleId}`);

  // --- Audits ---
  getAudits = () => this.get('/audits');
  getOwnerAudits = () => this.get('/audits/owner');
  getAuditTemplates = () => this.get('/audits/templates');
  getAudit = (id: number) => this.get(`/audits/${id}`);
  createAudit = (data: any) => this.post('/audits', data); // Define a proper DTO later
  updateAudit = (id: number, data: any) => this.put(`/audits/${id}`, data);
  deleteAudit = (id: number) => this.delete(`/audits/${id}`);

  exportAuditsExcel = () => {
    return fetch(`${BASE_URL}/audits/export/excel`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error('Failed to export audits');
      return response.blob();
    });
  };

  importAudits = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return this.upload('/audits/import', formData);
  };

  assignAuditors = (id: number, auditorIds: number[]) =>
    this.post(`/audits/${id}/assign`, { auditorIds });
  transitionAudit = (id: number, toStatus: string, userRole?: string) =>
    this.post(`/audits/${id}/transition`, { toStatus, userRole });
  getAllowedTransitionsAudit = (id: number) =>
    this.get(`/audits/${id}/allowed-transitions`);

  // --- Audit Comments ---
  getAuditComments = (auditId: number) => this.get(`/audits/${auditId}/comments`);
  addAuditComment = (auditId: number, data: any) => this.post(`/audits/${auditId}/comments`, data);

  // --- Audit Programs ---
  getAllAuditPrograms = () => this.get('/audit-programs');
  getAuditPrograms = (auditId: number) => this.get(`/audits/${auditId}/programs`);
  getAuditProgram = (id: number) => this.get(`/audit-programs/${id}`);
  createAuditProgram = (data: any) => this.post('/audit-programs', data);
  updateAuditProgram = (id: number, data: any) => this.put(`/audit-programs/${id}`, data);
  deleteAuditProgram = (id: number) => this.delete(`/audit-programs/${id}`);

  // --- Evidence ---
  getEvidenceList = (programId: number) => this.get(`/audit-programs/${programId}/evidence`);
  getAllEvidence = (status?: string) => this.get(`/evidence${status ? `?status=${status}` : ''}`);
  uploadEvidence = (programId: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auditProgramId', programId.toString());
    if (description) formData.append('description', description);
    return this.upload('/evidence', formData);
  };
  uploadEvidenceVersion = (id: number, file: File, changeDescription?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (changeDescription) formData.append('changeDescription', changeDescription);
    return this.upload(`/evidence/${id}/versions`, formData);
  };
  getEvidenceDetails = (id: number) => this.get(`/evidence/${id}`);
  deleteEvidence = (id: number) => this.delete(`/evidence/${id}`);
  transitionEvidence = (id: number, toStatus: string, userRole?: string) =>
    this.post(`/evidence/${id}/transition`, { toStatus, userRole });
  getAllowedEvidenceTransitions = (id: number) =>
    this.get(`/evidence/${id}/allowed-transitions`);

  downloadEvidence = (id: number) => {
    return fetch(`${BASE_URL}/evidence/${id}/file`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error('Failed to download evidence');
      return response.blob();
    });
  };

  // --- Findings & Remediation ---
  getFindings = () => this.get('/findings');
  getAuditFindings = (auditId: number) => this.get(`/audits/${auditId}/findings`);
  getFinding = (id: number) => this.get(`/findings/${id}`);
  createFinding = (data: any) => this.post('/findings', data);
  updateFinding = (id: number, data: any) => this.put(`/findings/${id}`, data);
  deleteFinding = (id: number) => this.delete(`/findings/${id}`);
  transitionFinding = (id: number, toStatus: string, userRole?: string) =>
    this.post(`/findings/${id}/transition`, { toStatus, userRole });
  getAllowedTransitions = (id: number) =>
    this.get(`/findings/${id}/allowed-transitions`);
  escalateFinding = (id: number, reason: string, escalatedTo: string) =>
    this.post(`/findings/${id}/escalate`, { reason, escalatedTo });
  getCriticalFindings = () => this.get('/findings/critical');
  getOverdueFindings = () => this.get('/findings/overdue');

  // --- Action Plans ---
  getActionPlans = (findingId: number) => this.get(`/findings/${findingId}/action-plans`);
  getOverdueActionPlans = () => this.get('/action-plans/overdue');
  createActionPlan = (data: any) => this.post('/action-plans', data);
  updateActionPlan = (id: number, data: any) => this.put(`/action-plans/${id}`, data);
  deleteActionPlan = (id: number) => this.delete(`/action-plans/${id}`);

  // --- Compliance & Frameworks ---
  getFrameworks = () => this.get('/compliance-frameworks');
  getFramework = (id: number) => this.get(`/compliance-frameworks/${id}`);
  createFramework = (data: any) => this.post('/compliance-frameworks', data);
  updateFramework = (id: number, data: any) => this.put(`/compliance-frameworks/${id}`, data);
  deleteFramework = (id: number) => this.delete(`/compliance-frameworks/${id}`);
  getCoverageStats = () => this.get('/compliance-stats');

  getControlMappings = (programId: number) => this.get(`/audit-programs/${programId}/controls`);
  createControlMapping = (data: any) => this.post('/control-mappings', data);
  updateControlMapping = (id: number, data: any) => this.put(`/control-mappings/${id}`, data);
  deleteControlMapping = (id: number) => this.delete(`/control-mappings/${id}`);

  // --- Risk Management ---
  getRisks = () => this.get('/risks');
  getRisk = (id: number) => this.get(`/risks/${id}`);
  createRisk = (data: any) => this.post('/risks', data);
  updateRisk = (id: number, data: any) => this.patch(`/risks/${id}`, data);
  deleteRisk = (id: number) => this.delete(`/risks/${id}`);

  getKris = () => this.get('/risks/kri/all');
  getKri = (id: number) => this.get(`/risks/kri/${id}`);
  createKri = (data: any) => this.post('/risks/kri', data);
  updateKri = (id: number, data: any) => this.patch(`/risks/kri/${id}`, data);
  deleteKri = (id: number) => this.delete(`/risks/kri/${id}`);

  // --- Reports & Analytics ---
  getDashboardStats = () => this.get('/reports/dashboard');
  getExecutiveReport = () => this.get('/reports/executive');
  getOperationalReports = () => this.get('/reports/operational');
  getReportsList = () => this.get('/reports/list');
  getRiskHeatmap = () => this.get('/reports/risk-heatmap');

  downloadAuditReportPDF = (auditId: number) => {
    return fetch(`${BASE_URL}/reports/audit/${auditId}/pdf`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      });
  };

  downloadAuditReportWord = (auditId: number) => {
    return fetch(`${BASE_URL}/reports/audit/${auditId}/docx`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      });
  };

  previewAuditReport = (auditId: number) => {
    return fetch(`${BASE_URL}/reports/audit/${auditId}/preview`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error('Failed to preview audit report');
      return response.blob();
    });
  };

  downloadStoredAuditReport = (auditId: number) => {
    return fetch(`${BASE_URL}/reports/audit/${auditId}/file`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    }).then(response => {
      if (!response.ok) throw new Error('Failed to download stored audit report');
      return response.blob();
    });
  };

  // --- Tasks & Alerts ---
  getMyTasks = () => this.get('/users/me/tasks');

  // --- Audit Logs ---
  getAuditLogs = () => this.get('/audit-logs');
  deleteAuditLog = (id: number) => this.delete(`/audit-logs/${id}`);

  // --- Administration ---
  getSystemStats = () => this.get('/admin/system-stats');

  // --- Integrations ---
  getIntegrations = () => this.get('/integrations');
  getIntegration = (id: number) => this.get(`/integrations/${id}`);
  createIntegration = (data: any) => this.post('/integrations', data);
  updateIntegration = (id: number, data: any) => this.put(`/integrations/${id}`, data);
  deleteIntegration = (id: number) => this.delete(`/integrations/${id}`);
  syncIntegration = (id: number) => this.post(`/integrations/${id}/sync`, {});

  // --- Notifications ---
  getNotifications = () => this.get('/notifications');
  createNotification = (data: { userId: number, title: string, message: string, type: string }) => this.post('/notifications', data);
  getUnreadNotificationCount = () => this.get('/notifications/unread-count');
  markNotificationAsRead = (id: number) => this.patch(`/notifications/${id}/read`, {});
  markAllNotificationsAsRead = () => this.patch('/notifications/read-all', {});

  // --- Messaging ---
  getConversations = () => this.get('/messages/conversations');
  getMessages = (contactId: number) => this.get(`/messages/${contactId}`);
  sendMessage = (receiverId: number, content: string) => this.post('/messages', { receiverId, content });
  markMessagesAsRead = (contactId: number) => this.patch(`/messages/${contactId}/read`, {});
  deleteConversation = (contactId: number) => this.delete(`/messages/${contactId}`);

  // --- Audit Universe ---
  getAuditUniverse = () => this.get('/audit-universe');
  getAuditUniverseItem = (id: number) => this.get(`/audit-universe/${id}`);
  createAuditUniverse = (data: any) => this.post('/audit-universe', data);
  updateAuditUniverse = (id: number, data: any) => this.patch(`/audit-universe/${id}`, data);
  deleteAuditUniverse = (id: number) => this.delete(`/audit-universe/${id}`);

  // --- Continuous Auditing ---
  getAutomatedControls = () => this.get('/continuous-audit/controls');
  createAutomatedControl = (data: any) => this.post('/continuous-audit/controls', data);
  updateAutomatedControl = (id: number, data: any) => this.put(`/continuous-audit/controls/${id}`, data);
  deleteAutomatedControl = (id: number) => this.delete(`/continuous-audit/controls/${id}`);
  getControlRuns = (id: number) => this.get(`/continuous-audit/controls/${id}/runs`);
  runControl = (id: number) => this.post(`/continuous-audit/controls/${id}/run`, {});

  // --- Workflow ---
  getWorkflowConfig = () => this.get('/workflow/audit/config');

  // --- Helper to handle PATCH requests ---
  private async patch(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }
}

const api = new ApiClient();
export default api;

// --- src/services/api.ts ---

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Debugging: Log API URL to help troubleshoot cloud connection issues
    console.log('AuditSoft API Client Initialized. Base URL:', BASE_URL);

    // You could load the token from localStorage here if persisting
    const storedToken = localStorage.getItem('authToken');
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
      localStorage.setItem('authToken', user.token);
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
  createUser = (data: any) => this.post('/users', data); // Define a proper DTO later
  updateUser = (id: number, data: any) => this.put(`/users/${id}`, data);
  deleteUser = (id: number) => this.delete(`/users/${id}`);
  assignRoleToUser = (userId: number, roleId: number) => this.post(`/users/${userId}/roles/${roleId}`, {});
  removeRoleFromUser = (userId: number, roleId: number) => this.delete(`/users/${userId}/roles/${roleId}`);

  // --- Audits ---
  getAudits = () => this.get('/audits');
  getAudit = (id: number) => this.get(`/audits/${id}`);
  createAudit = (data: any) => this.post('/audits', data); // Define a proper DTO later
  updateAudit = (id: number, data: any) => this.put(`/audits/${id}`, data);
  deleteAudit = (id: number) => this.delete(`/audits/${id}`);
  transitionAudit = (id: number, toStatus: string, userRole?: string) => 
    this.post(`/audits/${id}/transition`, { toStatus, userRole });
  getAllowedTransitionsAudit = (id: number) => 
    this.get(`/audits/${id}/allowed-transitions`);

  // --- Audit Universe ---
  getAuditUniverse = () => this.get('/audit-universe');
  getAuditUniverseItem = (id: number) => this.get(`/audit-universe/${id}`);
  createAuditUniverseItem = (data: any) => this.post('/audit-universe', data);
  updateAuditUniverseItem = (id: number, data: any) => this.put(`/audit-universe/${id}`, data);
  deleteAuditUniverseItem = (id: number) => this.delete(`/audit-universe/${id}`);

  // --- Audit Programs ---
  getAuditPrograms = (auditId: number) => this.get(`/audits/${auditId}/programs`);
  getAuditProgram = (id: number) => this.get(`/audit-programs/${id}`);
  createAuditProgram = (data: any) => this.post('/audit-programs', data);
  updateAuditProgram = (id: number, data: any) => this.put(`/audit-programs/${id}`, data);
  deleteAuditProgram = (id: number) => this.delete(`/audit-programs/${id}`);

  // --- Evidence ---
  getEvidenceList = (programId: number) => this.get(`/audit-programs/${programId}/evidence`);
  uploadEvidence = (programId: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auditProgramId', programId.toString());
    if (description) formData.append('description', description);
    return this.upload('/evidence', formData);
  };
  deleteEvidence = (id: number) => this.delete(`/evidence/${id}`);

  // --- Findings ---
  getFindings = (auditId?: number) => this.get(auditId ? `/audits/${auditId}/findings` : '/findings');
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
  createActionPlan = (data: any) => this.post('/action-plans', data);
  updateActionPlan = (id: number, data: any) => this.put(`/action-plans/${id}`, data);
  deleteActionPlan = (id: number) => this.delete(`/action-plans/${id}`);

  // --- Compliance & Frameworks ---
  getFrameworks = () => this.get('/compliance-frameworks');
  getControlMappings = (programId: number) => this.get(`/audit-programs/${programId}/controls`);

  // --- Risk Management ---
  getRisks = () => this.get('/risks');
  createRisk = (data: any) => this.post('/risks', data);
  updateRisk = (id: number, data: any) => this.put(`/risks/${id}`, data);

  // --- Reports & Analytics ---
  getDashboardStats = () => this.get('/reports/dashboard');
  getExecutiveReport = () => this.get('/reports/executive');
  getRiskHeatmap = () => this.get('/reports/risk-heatmap');

  // --- Tasks & Alerts ---
  getMyTasks = () => this.get('/users/me/tasks');

  // --- Audit Logs ---
  getAuditLogs = (filters?: any) => this.post('/audit-logs/search', filters || {});

  // --- Administration ---
  getSystemStats = () => this.get('/admin/system-stats');

  // --- Integrations ---
  getIntegrations = () => this.get('/integrations');
  syncIntegration = (id: number) => this.post(`/integrations/${id}/sync`, {});
}

const api = new ApiClient();
export default api;

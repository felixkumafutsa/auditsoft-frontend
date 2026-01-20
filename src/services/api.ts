// --- src/services/api.ts ---

const BASE_URL = process.env.REACT_APP_API_URL || '';

class ApiClient {
  private token: string | null = null;

  constructor() {
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
}

const api = new ApiClient();
export default api;

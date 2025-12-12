import { User, WeeklyMetric, Project, PMProfile, TransformationTask, SystemConfig } from '../types';
import { db, INITIAL_CONFIG } from './storage'; 
import { MOCK_METRICS, MOCK_PMS, MOCK_TASKS } from './mockData';

const API_BASE = 'http://localhost:3001/api';

class ApiService {
    private token: string | null = null;
    private user: User | null = null;
    public isOfflineMode: boolean = false;

    constructor() {
        // Hydrate from storage
        const storedUser = localStorage.getItem('user_session_token');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            this.user = parsed.user;
            this.token = parsed.token;
            this.isOfflineMode = parsed.isOfflineMode || false;
        } else {
            this.user = db.getCurrentUser();
        }
    }

    private async request<T>(endpoint: string, options?: RequestInit, fallbackAction?: () => T): Promise<T> {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, options);
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            this.isOfflineMode = false;
            return await res.json();
        } catch (e) {
            this.isOfflineMode = true;
            if (fallbackAction) {
                await new Promise(resolve => setTimeout(resolve, 300)); 
                return fallbackAction();
            }
            throw e;
        }
    }

    // --- AUTH ---
    async login(username: string): Promise<User | null> {
        return this.request(
            '/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            },
            () => {
                const user = db.login(username);
                return user ? { user, token: 'offline-token' } : null;
            }
        ).then(res => {
            if (!res) return null;
            this.token = res.token;
            this.user = res.user;
            localStorage.setItem('user_session_token', JSON.stringify({
                user: this.user, 
                token: this.token,
                isOfflineMode: this.isOfflineMode
            }));
            return this.user;
        });
    }

    logout() {
        this.token = null;
        this.user = null;
        this.isOfflineMode = false;
        localStorage.removeItem('user_session_token');
        db.logout();
    }

    getCurrentUser(): User | null {
        return this.user || db.getCurrentUser();
    }

    // --- READ DATA (with System Config) ---
    async getDashboardData() {
        return this.request(
            '/dashboard',
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'x-user-role': this.user?.role || '',
                    'x-user-name': this.user?.username || ''
                }
            },
            () => ({
                projects: db.getProjects(),
                metrics: db.getMetrics(),
                pms: db.getPMs(),
                tasks: db.getTasks(),
                config: db.getConfig() // NEW
            })
        );
    }

    // --- DATA LOADER ---
    async uploadMetrics(metrics: WeeklyMetric[]): Promise<boolean> {
        return this.request(
            '/upload',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ metrics })
            },
            () => {
                db.saveMetrics(metrics);
                return { success: true };
            }
        ).then(() => true).catch(() => false);
    }

    // --- ADMIN API ---

    // Config
    async updateSystemConfig(config: SystemConfig): Promise<SystemConfig> {
        return this.request('/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
            body: JSON.stringify(config)
        }, () => db.saveConfig(config));
    }

    // PMs (NEW)
    async addPM(pm: PMProfile): Promise<PMProfile> {
        return this.request('/pms', {
             method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
            body: JSON.stringify(pm)
        }, () => db.addPM(pm));
    }

    async deletePM(id: string): Promise<boolean> {
        return this.request('/pms/' + id, {
            method: 'DELETE',
             headers: { 'Authorization': `Bearer ${this.token}` }
        }, () => {
            db.deletePM(id);
            return { success: true };
        }).then(() => true);
    }

    async updatePM(pm: PMProfile): Promise<PMProfile> {
        return this.request('/pms/' + pm.id, {
             method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
            body: JSON.stringify(pm)
        }, () => db.updatePM(pm));
    }

    // Users
    async getUsers(): Promise<User[]> {
        return this.request('/users', { headers: { 'Authorization': `Bearer ${this.token}` } }, () => db.getUsers());
    }

    async addUser(user: User): Promise<User> {
        return this.request('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
            body: JSON.stringify(user)
        }, () => db.addUser(user));
    }

    async deleteUser(id: string): Promise<boolean> {
        return this.request('/users/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
        }, () => {
            db.deleteUser(id);
            return { success: true };
        }).then(() => true);
    }

    // Projects
    async addProject(project: Project): Promise<Project> {
        return this.request('/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
            body: JSON.stringify(project)
        }, () => db.addProject(project));
    }

    async updateProject(project: Project): Promise<Project> {
         return this.request(`/projects/${project.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
            body: JSON.stringify(project)
        }, () => db.updateProject(project));
    }

    async deleteProject(id: string): Promise<boolean> {
        return this.request('/projects/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
        }, () => {
            db.deleteProject(id);
            return { success: true };
        }).then(() => true);
    }
}

export const api = new ApiService();
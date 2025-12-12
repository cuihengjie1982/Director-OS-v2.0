import { Project, WeeklyMetric, PMProfile, TransformationTask, User, SmartLog, ProjectStatus, BusinessType, SystemConfig } from '../types';
import { MOCK_METRICS, MOCK_PMS, MOCK_PROJECTS, MOCK_TASKS, MOCK_LOGS } from './mockData';

// Keys for LocalStorage
const KEYS = {
    PROJECTS: 'DIRECTOR_OS_PROJECTS',
    METRICS: 'DIRECTOR_OS_METRICS',
    PMS: 'DIRECTOR_OS_PMS',
    TASKS: 'DIRECTOR_OS_TASKS',
    LOGS: 'DIRECTOR_OS_LOGS',
    USERS: 'DIRECTOR_OS_USERS',
    CONFIG: 'DIRECTOR_OS_CONFIG', // New Config Key
    USER_SESSION: 'DIRECTOR_OS_USER_SESSION'
};

// Initial Seed Data for Users
export const INITIAL_USERS: User[] = [
    { 
        id: 'u1', 
        username: 'director', 
        name: 'Alex Director', 
        role: 'DIRECTOR', 
        avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Director&background=0D8ABC&color=fff' 
    },
    { 
        id: 'u2', 
        username: 'pm', 
        name: 'Sarah PM', 
        role: 'PM', 
        avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+PM&background=6366f1&color=fff',
        assignedProjectCodes: ['Project_Alpha', 'Project_Sierra']
    }
];

// Initial Config
export const INITIAL_CONFIG: SystemConfig = {
    riskThresholds: {
        revenueGap: 0.05, // 5% default
        turnoverRate: 0.10 // 10% default
    },
    resources: {
        templateUrl: 'https://example.com/templates/weekly_report_v2.xlsx',
        guideUrl: 'https://example.com/docs/director_os_handbook.pdf'
    },
    maintenanceMode: false
};

class StorageService {
    // Initialize DB with Mock Data if empty
    init() {
        if (!localStorage.getItem(KEYS.PROJECTS)) {
            localStorage.setItem(KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
            localStorage.setItem(KEYS.METRICS, JSON.stringify(MOCK_METRICS));
            localStorage.setItem(KEYS.PMS, JSON.stringify(MOCK_PMS));
            localStorage.setItem(KEYS.TASKS, JSON.stringify(MOCK_TASKS));
            localStorage.setItem(KEYS.LOGS, JSON.stringify(MOCK_LOGS));
            localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
            localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
            console.log("Database Initialized with Seed Data");
        }
    }

    // --- GENERIC HELPERS ---
    private getItem<T>(key: string, defaultVal: T): T {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    }

    private setItem<T>(key: string, val: T) {
        localStorage.setItem(key, JSON.stringify(val));
    }

    // --- READ ---
    getProjects(): Project[] { return this.getItem(KEYS.PROJECTS, MOCK_PROJECTS); }
    getMetrics(): WeeklyMetric[] { return this.getItem(KEYS.METRICS, MOCK_METRICS); }
    getPMs(): PMProfile[] { return this.getItem(KEYS.PMS, MOCK_PMS); }
    getTasks(): TransformationTask[] { return this.getItem(KEYS.TASKS, MOCK_TASKS); }
    getUsers(): User[] { return this.getItem(KEYS.USERS, INITIAL_USERS); }
    getConfig(): SystemConfig { return this.getItem(KEYS.CONFIG, INITIAL_CONFIG); }

    // --- WRITE (Metrics) ---
    saveMetrics(newMetrics: WeeklyMetric[]) {
        const current = this.getMetrics();
        // Replace existing metrics for same project/week, append new
        const updated = [
            ...current.filter(c => !newMetrics.find(n => n.projectCode === c.projectCode)),
            ...newMetrics
        ];
        this.setItem(KEYS.METRICS, updated);
        return updated;
    }

    // --- WRITE (Config) ---
    saveConfig(config: SystemConfig) {
        this.setItem(KEYS.CONFIG, config);
        return config;
    }

    // --- ADMIN CRUD OPERATIONS (PMs) ---
    addPM(pm: PMProfile): PMProfile {
        const pms = this.getPMs();
        pms.push(pm);
        this.setItem(KEYS.PMS, pms);
        return pm;
    }

    updatePM(pm: PMProfile): PMProfile {
        let pms = this.getPMs();
        const index = pms.findIndex(p => p.id === pm.id);
        if (index !== -1) {
            pms[index] = pm;
            this.setItem(KEYS.PMS, pms);
        }
        return pm;
    }

    deletePM(id: string): boolean {
        let pms = this.getPMs();
        pms = pms.filter(p => p.id !== id);
        this.setItem(KEYS.PMS, pms);
        return true;
    }

    // --- ADMIN CRUD OPERATIONS (Users) ---
    addUser(user: User): User {
        const users = this.getUsers();
        users.push(user);
        this.setItem(KEYS.USERS, users);
        return user;
    }

    deleteUser(id: string): boolean {
        let users = this.getUsers();
        users = users.filter(u => u.id !== id);
        this.setItem(KEYS.USERS, users);
        return true;
    }

    // --- ADMIN CRUD OPERATIONS (Projects) ---
    addProject(project: Project): Project {
        const projects = this.getProjects();
        projects.push(project);
        this.setItem(KEYS.PROJECTS, projects);
        return project;
    }

    updateProject(project: Project): Project {
        let projects = this.getProjects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            projects[index] = project;
            this.setItem(KEYS.PROJECTS, projects);
        }
        return project;
    }

    deleteProject(id: string): boolean {
        let projects = this.getProjects();
        projects = projects.filter(p => p.id !== id);
        this.setItem(KEYS.PROJECTS, projects);
        return true;
    }

    // --- AUTH ---
    login(username: string): User | null {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        if (user) {
            localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
            return user;
        }
        return null;
    }

    logout() {
        localStorage.removeItem(KEYS.USER_SESSION);
    }

    getCurrentUser(): User | null {
        const stored = localStorage.getItem(KEYS.USER_SESSION);
        return stored ? JSON.parse(stored) : null;
    }
}

export const db = new StorageService();
db.init();
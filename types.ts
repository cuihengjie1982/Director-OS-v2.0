// Database Schema based on PRD

export enum BusinessType {
    BPO = 'BPO',
    HRO = 'HRO',
    RPO = 'RPO'
}

export enum ProjectStatus {
    Running = 'Running',
    RampUp = 'Ramp-up',
    Closed = 'Closed'
}

export type UserRole = 'DIRECTOR' | 'PM';

export interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    assignedProjectCodes?: string[]; // For PMs, restrict access
}

// 1. Project Master
export interface Project {
    id: string;
    projectName: string; // Sensitive
    projectCode: string; // Safe
    businessType: BusinessType;
    pmId: string;
    profitTargetRate: number; // e.g., 0.15 for 15%
    slaTargetRate: number; // e.g., 0.98 for 98%
    status: ProjectStatus;
    // Dynamic Fields (Key-Value)
    customFields?: Record<string, string>; 
}

// 2. Weekly Snapshot
export interface WeeklyMetric {
    id: string;
    projectCode: string;
    reportWeek: string; // ISO Date YYYY-MM-DD
    revenueActual: number;
    revenueTarget: number;
    headcount: number;
    slaAchieved: number;
    turnoverRate: number;
    riskFlag: boolean;
    riskDetails: string;
}

// 3. Transformation Tasks
export type TaskStage = 'Backlog' | 'In Progress' | 'Blocked' | 'Testing' | 'Live';

export interface TransformationTask {
    id: string;
    taskName: string;
    stage: TaskStage;
    progressPercent: number;
    blockerNotes?: string;
}

// 4. PM Profile
export interface PMProfile {
    id: string;
    name: string;
    level: string;
    tags: string[]; // e.g., "Strong Ops", "Weak Innovation"
    avatarUrl?: string;
    // Dynamic Fields (Key-Value)
    customFields?: Record<string, string>;
}

// 5. Smart Log
export type LogTag = 'Achievement' | 'Risk' | 'Idea' | 'PM_Eval';

export interface SmartLog {
    id: string;
    date: string; // ISO DateTime
    content: string;
    tag: LogTag;
    linkedPmId?: string;
    qualityScore?: 'A+' | 'A' | 'B' | 'C';
}

// --- NEW ENTERPRISE TYPES ---

// 6. System Configuration (Dynamic Rules)
export interface SystemConfig {
    riskThresholds: {
        revenueGap: number; // e.g., 0.05 (5%)
        turnoverRate: number; // e.g., 0.10 (10%)
    };
    resources: {
        templateUrl: string;
        guideUrl: string;
    };
    maintenanceMode: boolean;
}

// 7. Global Date Filter
export type TimeRangeOption = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL' | 'CUSTOM';

export interface DateRange {
    option: TimeRangeOption;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    label: string;
}

// Combined Type for Dashboard View
export interface EnrichedProject extends Project {
    currentMetric?: WeeklyMetric;
    pm?: PMProfile;
}
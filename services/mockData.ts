import { BusinessType, PMProfile, Project, ProjectStatus, TransformationTask, WeeklyMetric, SmartLog } from '../types';

export const MOCK_PMS: PMProfile[] = [
    { id: 'pm-1', name: '王莎拉 (Sarah)', level: '高级项目经理', tags: ['运营强', '危机管理'], avatarUrl: 'https://picsum.photos/100/100?random=1' },
    { id: 'pm-2', name: '张伟 (John)', level: '初级项目经理', tags: ['技术控', '沟通较弱'], avatarUrl: 'https://picsum.photos/100/100?random=2' },
    { id: 'pm-3', name: '陈艾米 (Emily)', level: '业务总监', tags: ['战略思维', '创新领头人'], avatarUrl: 'https://picsum.photos/100/100?random=3' },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-1',
        projectName: '招商银行 BPO',
        projectCode: 'Project_Alpha',
        businessType: BusinessType.BPO,
        pmId: 'pm-1',
        profitTargetRate: 0.20,
        slaTargetRate: 0.95,
        status: ProjectStatus.Running
    },
    {
        id: 'proj-2',
        projectName: '特斯拉客服支持',
        projectCode: 'Project_Tango',
        businessType: BusinessType.RPO,
        pmId: 'pm-2',
        profitTargetRate: 0.15,
        slaTargetRate: 0.98,
        status: ProjectStatus.RampUp
    },
    {
        id: 'proj-3',
        projectName: 'Shopee 物流客服',
        projectCode: 'Project_Sierra',
        businessType: BusinessType.BPO,
        pmId: 'pm-1',
        profitTargetRate: 0.10,
        slaTargetRate: 0.99,
        status: ProjectStatus.Running
    },
    {
        id: 'proj-4',
        projectName: '字节跳动内容审核',
        projectCode: 'Project_Gemma',
        businessType: BusinessType.HRO,
        pmId: 'pm-3',
        profitTargetRate: 0.25,
        slaTargetRate: 0.995,
        status: ProjectStatus.Running
    }
];

export const MOCK_METRICS: WeeklyMetric[] = [
    {
        id: 'met-1',
        projectCode: 'Project_Alpha',
        reportWeek: '2023-10-23',
        revenueActual: 45000,
        revenueTarget: 50000, // Missed by 10% (RED)
        headcount: 120,
        slaAchieved: 0.96, // Pass
        turnoverRate: 0.02,
        riskFlag: false,
        riskDetails: '因呼入量低于预测，导致营收未达标。'
    },
    {
        id: 'met-2',
        projectCode: 'Project_Tango',
        reportWeek: '2023-10-23',
        revenueActual: 15500,
        revenueTarget: 15000,
        headcount: 45,
        slaAchieved: 0.92, // Missed Target 0.98 (RED)
        turnoverRate: 0.05,
        riskFlag: true,
        riskDetails: '关键系统宕机导致 SLA 违规。'
    },
    {
        id: 'met-3',
        projectCode: 'Project_Sierra',
        reportWeek: '2023-10-23',
        revenueActual: 82000,
        revenueTarget: 80000,
        headcount: 300,
        slaAchieved: 0.992,
        turnoverRate: 0.01,
        riskFlag: false,
        riskDetails: ''
    },
    {
        id: 'met-4',
        projectCode: 'Project_Gemma',
        reportWeek: '2023-10-23',
        revenueActual: 120000,
        revenueTarget: 120000,
        headcount: 150,
        slaAchieved: 0.999,
        turnoverRate: 0.005,
        riskFlag: true, // Manual Risk Flag (RED)
        riskDetails: '客户潜在政策变更风险。'
    }
];

export const MOCK_TASKS: TransformationTask[] = [
    { id: 'task-1', taskName: '财务 RPA 机器人', stage: 'Testing', progressPercent: 90 },
    { id: 'task-2', taskName: '智能质检系统', stage: 'In Progress', progressPercent: 45 },
    { id: 'task-3', taskName: '新 HR 门户上线', stage: 'Blocked', progressPercent: 20, blockerNotes: '等待 IT 安全审批' },
    { id: 'task-4', taskName: '语音 AI 客服试点', stage: 'Backlog', progressPercent: 0 },
];

export const MOCK_LOGS: SmartLog[] = [
    { id: 'log-1', date: '2023-10-20T10:00:00', content: '莎拉出色地处理了本周的话务高峰。', tag: 'PM_Eval', linkedPmId: 'pm-1', qualityScore: 'A' },
    { id: 'log-2', date: '2023-10-21T14:30:00', content: '需要复盘 Project Tango 的 SLA 未达标细节。', tag: 'Risk', qualityScore: 'B' },
];
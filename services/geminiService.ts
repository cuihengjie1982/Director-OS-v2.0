import { GoogleGenAI } from "@google/genai";
import { Project, WeeklyMetric } from '../types';

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is handled securely
const ai = new GoogleGenAI({ apiKey });

interface SafeReportRequest {
    projects: Project[];
    metrics: WeeklyMetric[];
    focusProjectCodes?: string[];
}

/**
 * Middleware: Masks sensitive data before sending to AI
 */
const maskData = (projects: Project[], metrics: WeeklyMetric[]) => {
    // We only send the Project Code, NEVER the Project Name.
    // We convert absolute revenue to achievement % to hide financial scale.

    const maskedData = metrics.map(m => {
        const project = projects.find(p => p.projectCode === m.projectCode);
        if (!project) return null;

        const achievementRate = (m.revenueActual / m.revenueTarget).toFixed(2);
        
        return {
            projectCode: m.projectCode, // SAFE
            revenueAchievement: `${Number(achievementRate) * 100}%`, // SAFE (Relative)
            slaAchieved: `${(m.slaAchieved * 100).toFixed(1)}%`,
            slaTarget: `${(project.slaTargetRate * 100).toFixed(1)}%`,
            riskFlag: m.riskFlag,
            riskDetails: m.riskDetails, // Assuming risk details are written professionally
            businessType: project.businessType
        };
    }).filter(Boolean);

    return JSON.stringify(maskedData, null, 2);
};

export const generateWeeklyReport = async ({ projects, metrics, focusProjectCodes }: SafeReportRequest): Promise<string> => {
    if (!apiKey) {
        return "错误: 未提供 API Key。请配置 process.env.API_KEY。";
    }

    // Step 1: Mask Data
    const safePayload = maskData(projects, metrics);
    
    // Step 2: Construct Prompt in Chinese
    const systemInstruction = `你是一位资深的 BPO 运营总监。
    请分析提供的 JSON 数据（为了安全已进行脱敏处理）。
    项目代号（如 Project_Alpha）代替了真实的客户名称。
    
    请用中文生成一份简明扼要的高管周报（Markdown 格式）：
    1. **财务综述**：总结整体目标达成情况。
    2. **风险评估**：重点关注 "riskFlag": true 或营收达成率低 (<95%) 的项目。
    3. **运营亮点**：提及表现优秀的项目。
    4. **行动建议**：针对风险点提出 2-3 条战略性建议。
    
    保持专业、直接、以结果为导向。`;

    try {
        const model = 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
            model: model,
            contents: `这是本周的脱敏运营数据: ${safePayload}`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3, // Low temperature for factual reporting
            }
        });

        return response.text || "未生成报告。";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "由于 AI 服务错误，报告生成失败。";
    }
};

/**
 * Helper to "Unmask" the report for the local user viewing (Optional)
 * This replaces Project Codes back to Real Names only on the client side.
 */
export const unmaskReport = (reportText: string, projects: Project[]): string => {
    let unmasked = reportText;
    projects.forEach(p => {
        // Simple regex replacement
        const regex = new RegExp(p.projectCode, 'g');
        unmasked = unmasked.replace(regex, `${p.projectName} (${p.projectCode})`);
    });
    return unmasked;
};
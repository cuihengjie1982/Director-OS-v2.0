import React from 'react';
import { PMProfile, Project, WeeklyMetric, DateRange } from '../types';
import { Mail, Award, BookOpen, Layers } from 'lucide-react';

interface PMScorecardProps {
    pms: PMProfile[];
    projects: Project[];
    metrics: WeeklyMetric[];
    dateRange: DateRange;
}

const PMScorecard: React.FC<PMScorecardProps> = ({ pms, projects, metrics, dateRange }) => {
    
    // Helper to calculate score based on Date Range
    const getPMStats = (pmId: string) => {
        const pmProjects = projects.filter(p => p.pmId === pmId);
        
        // Filter Metrics by PM's Projects AND Date Range
        const pmMetrics = metrics.filter(m => {
            const belongsToPm = pmProjects.some(p => p.projectCode === m.projectCode);
            const isInRange = m.reportWeek >= dateRange.startDate && m.reportWeek <= dateRange.endDate;
            return belongsToPm && isInRange;
        });
        
        const totalProjects = pmProjects.length;
        const riskCount = pmMetrics.filter(m => m.riskFlag).length;
        const avgSla = pmMetrics.length > 0 
            ? pmMetrics.reduce((acc, m) => acc + m.slaAchieved, 0) / pmMetrics.length 
            : 0;

        return { totalProjects, riskCount, avgSla, dataPoints: pmMetrics.length };
    };

    return (
        <div className="p-6 md:p-8 animate-fade-in max-w-[1600px] mx-auto">
             <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-slate-800">PM 人才雷达 (Talent Radar)</h2>
                 <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                     统计区间: {dateRange.label}
                 </span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pms.map(pm => {
                    const stats = getPMStats(pm.id);
                    return (
                        <div key={pm.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={pm.avatarUrl} alt={pm.name} className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{pm.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{pm.level}</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 p-2 rounded-xl">
                                        <Award className="text-amber-500" size={20} />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500">负责项目</span>
                                        <span className="text-slate-800 font-mono font-semibold bg-slate-50 px-2 py-0.5 rounded">{stats.totalProjects}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500">区间平均 SLA</span>
                                        {stats.dataPoints > 0 ? (
                                            <span className={`font-mono font-bold ${stats.avgSla >= 0.98 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                {(stats.avgSla * 100).toFixed(1)}%
                                            </span>
                                        ) : <span className="text-slate-400 text-xs italic">无数据</span>}
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500">红灯风险次数</span>
                                        <span className={`font-mono font-bold ${stats.riskCount > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                                            {stats.riskCount}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {pm.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100 px-2 py-1 rounded-full font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                    {/* Display Dynamic Fields if they exist */}
                                    {pm.customFields && Object.entries(pm.customFields).slice(0,2).map(([k,v]) => (
                                        <span key={k} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full flex items-center gap-1">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                                <button className="text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-2 transition-colors">
                                    <BookOpen size={14} /> 指派 SOP
                                </button>
                                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-2 transition-colors">
                                    <Mail size={14} /> 发送反馈
                                </button>
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
    );
};

export default PMScorecard;
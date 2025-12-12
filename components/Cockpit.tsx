import React, { useMemo } from 'react';
import { Project, WeeklyMetric, TransformationTask, TaskStage, SystemConfig, DateRange } from '../types';
import { AlertTriangle, ArrowUpRight, Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, YAxis, CartesianGrid } from 'recharts';

interface CockpitProps {
    projects: Project[];
    metrics: WeeklyMetric[];
    tasks: TransformationTask[];
    dateRange: DateRange;
    config: SystemConfig;
}

const Cockpit: React.FC<CockpitProps> = ({ projects, metrics, tasks, dateRange, config }) => {

    const filteredMetrics = useMemo(() => {
        return metrics.filter(m => {
            return m.reportWeek >= dateRange.startDate && m.reportWeek <= dateRange.endDate;
        });
    }, [metrics, dateRange]);

    const getProjectStatus = (metric: WeeklyMetric, project: Project) => {
        const revenueGap = (metric.revenueActual - metric.revenueTarget) / metric.revenueTarget;
        const isRevenueRisk = revenueGap < -(config.riskThresholds.revenueGap); 
        const isSlaMiss = metric.slaAchieved < project.slaTargetRate;
        const isTurnoverRisk = metric.turnoverRate > config.riskThresholds.turnoverRate;
        const isRisk = metric.riskFlag || isRevenueRisk || isSlaMiss || isTurnoverRisk;
        return { isRisk, revenueGap, isSlaMiss, isTurnoverRisk };
    };

    const redProjects = useMemo(() => {
        return filteredMetrics.map(m => {
            const p = projects.find(proj => proj.projectCode === m.projectCode);
            if (!p) return null;
            const status = getProjectStatus(m, p);
            if (status.isRisk) {
                return { metric: m, project: p, status };
            }
            return null;
        }).filter(Boolean) as { metric: WeeklyMetric, project: Project, status: any }[];
    }, [filteredMetrics, projects, config]);

    const totalRev = filteredMetrics.reduce((acc, curr) => acc + curr.revenueActual, 0);
    const totalHC = filteredMetrics.reduce((acc, curr) => acc + curr.headcount, 0);

    const stages: TaskStage[] = ['Backlog', 'In Progress', 'Blocked', 'Testing'];
    const stageLabels: Record<TaskStage, string> = {
        'Backlog': '待办',
        'In Progress': '进行中',
        'Blocked': '卡点',
        'Testing': '测试中',
        'Live': '已上线'
    };

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
            {/* Header KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">区间总营收</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
                        ¥{(totalRev / 1000).toFixed(1)}k
                        <span className="text-emerald-600 text-sm font-medium flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={14} className="mr-0.5" /> +2.4%
                        </span>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Users size={20} /></div>
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">累计人力 (HC)</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{totalHC}</div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm transition-shadow ${redProjects.length > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${redProjects.length > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Activity size={20} />
                        </div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${redProjects.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>活跃风险项目</span>
                    </div>
                    <div className={`text-3xl font-bold flex items-center gap-2 ${redProjects.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                        {redProjects.length}
                        {redProjects.length > 0 && <AlertTriangle size={24} className="animate-pulse" />}
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Zap size={20} /></div>
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">数智化转型任务</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{tasks.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Risk Monitoring */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">
                            异常监控 
                            <span className="text-slate-400 font-normal text-sm ml-2">只显示需要关注的问题</span>
                        </h2>
                    </div>
                    
                    {redProjects.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <Activity className="text-emerald-500" />
                            </div>
                            <span className="text-slate-500 font-medium">一切正常，无风险触发。</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {redProjects.map(({ project, metric, status }) => (
                                <div key={metric.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                                    <div className="flex-1 pl-3">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{project.projectName}</h3>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{metric.reportWeek}</span>
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1">
                                            {metric.riskDetails || "检测到 KPI 异常波动，请关注。"}
                                        </div>
                                        {/* Custom Fields Display if any exist for risk */}
                                        {project.customFields && Object.keys(project.customFields).length > 0 && (
                                            <div className="mt-2 flex gap-2">
                                                {Object.entries(project.customFields).slice(0,2).map(([k,v]) => (
                                                    <span key={k} className="text-[10px] bg-slate-50 text-slate-500 border border-slate-100 px-1.5 py-0.5 rounded">{k}: {v}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400 uppercase font-semibold">营收偏差</div>
                                            <div className={`text-base font-bold font-mono ${status.revenueGap < -(config.riskThresholds.revenueGap) ? 'text-red-600' : 'text-slate-700'}`}>
                                                {(status.revenueGap * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-400 uppercase font-semibold">SLA 达成</div>
                                            <div className={`text-base font-bold font-mono ${status.isSlaMiss ? 'text-red-600' : 'text-slate-700'}`}>
                                                {(metric.slaAchieved * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                                            处理
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-80">
                        <h3 className="text-sm font-bold text-slate-800 mb-6">营收达成率分布 (Live)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredMetrics} margin={{top: 0, right: 0, bottom: 20, left: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="projectCode" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `¥${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{fill: '#f8fafc'}}
                                />
                                <Bar dataKey="revenueActual" radius={[6, 6, 0, 0]} barSize={40}>
                                    {filteredMetrics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.revenueActual < entry.revenueTarget * (1 - config.riskThresholds.revenueGap) ? '#f87171' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Kanban */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800">数智化转型</h2>
                    <div className="space-y-4">
                        {stages.map(stage => {
                            const stageTasks = tasks.filter(t => t.stage === stage);
                            return (
                                <div key={stage} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex justify-between">
                                        {stageLabels[stage]}
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{stageTasks.length}</span>
                                    </h4>
                                    <div className="space-y-2">
                                        {stageTasks.map(task => (
                                            <div key={task.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                                                <div className="text-sm text-slate-700 font-medium mb-2">{task.taskName}</div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${task.stage === 'Blocked' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                        style={{ width: `${task.progressPercent}%` }}
                                                    ></div>
                                                </div>
                                                {task.blockerNotes && (
                                                    <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-1.5 rounded border border-red-100 flex items-center gap-1">
                                                        <AlertTriangle size={10} /> {task.blockerNotes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {stageTasks.length === 0 && (
                                            <div className="text-center py-2 text-[10px] text-slate-300 italic">空</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cockpit;
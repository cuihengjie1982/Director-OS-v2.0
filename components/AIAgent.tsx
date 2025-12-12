import React, { useState } from 'react';
import { Project, WeeklyMetric } from '../types';
import { generateWeeklyReport, unmaskReport } from '../services/geminiService';
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles, Copy, FileText, Server, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAgentProps {
    projects: Project[];
    metrics: WeeklyMetric[];
}

const AIAgent: React.FC<AIAgentProps> = ({ projects, metrics }) => {
    const [status, setStatus] = useState<'idle' | 'masking' | 'generating' | 'done'>('idle');
    const [report, setReport] = useState<string>('');
    const [isUnmasked, setIsUnmasked] = useState(false);

    const handleGenerate = async () => {
        setStatus('masking');
        setReport('');
        
        setTimeout(async () => {
            setStatus('generating');
            const result = await generateWeeklyReport({ projects, metrics });
            setReport(result);
            setStatus('done');
        }, 1500);
    };

    const toggleMask = () => {
        setIsUnmasked(!isUnmasked);
    };

    const displayReport = isUnmasked ? unmaskReport(report, projects) : report;

    return (
        <div className="p-6 md:p-12 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="text-purple-600" />
                        AI 安全参谋
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm">基于 Gemini 2.5 Flash 的高管汇报生成器 (PII 自动脱敏)。</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-2 text-emerald-700 text-sm font-medium">
                    <ShieldCheck size={16} />
                    <span>安全层已激活：敏感信息拦截中</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                            <Cpu size={18} className="text-blue-500"/> 生成配置
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-500">数据源</span>
                                <span className="text-slate-800 font-medium">本周实时数据</span>
                            </div>
                             <div className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-slate-500">模型引擎</span>
                                <span className="text-purple-600 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded">gemini-2.5-flash</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={status === 'masking' || status === 'generating'}
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                        >
                            {status === 'masking' ? '正在加密脱敏...' : 
                             status === 'generating' ? 'AI 正在撰写...' : '生成周报'}
                        </button>
                    </div>

                    {/* Middleware Visualization */}
                    {status !== 'idle' && (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck size={80} className="text-white"/>
                            </div>
                            <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-4 font-bold">Middleware Logs</h3>
                            <div className="space-y-4 font-mono text-xs">
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span>数据库提取完毕</span>
                                </div>
                                <div className={`flex items-center gap-3 transition-all duration-500 ${status === 'masking' ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-[-10px]'}`}>
                                    <Lock size={14} className="text-amber-400" /> 
                                    <span className={status === 'masking' ? 'text-white font-bold' : 'text-slate-500'}>
                                        脱敏中: "招商银行" &rarr; "Project_Alpha"
                                    </span>
                                </div>
                                 <div className={`flex items-center gap-3 transition-all duration-500 ${status === 'generating' ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-[-10px]'}`}>
                                    <Sparkles size={14} className="text-purple-400" /> 
                                    <span className={status === 'generating' ? 'text-white font-bold' : 'text-slate-500'}>
                                        Gemini Reasoning...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Report Output */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-2xl min-h-[600px] flex flex-col shadow-sm">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-slate-700 font-bold flex items-center gap-2">
                                <FileText size={18} className="text-slate-500" />
                                高管摘要 (Executive Summary)
                            </h3>
                            
                            {status === 'done' && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={toggleMask}
                                        className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded border transition-colors font-medium
                                            ${isUnmasked 
                                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {isUnmasked ? <EyeOff size={14} /> : <Eye size={14} />}
                                        {isUnmasked ? '重新脱敏' : '还原真实名称'}
                                    </button>
                                    <button className="text-xs flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded transition-colors font-medium">
                                        <Copy size={14} /> 复制全文
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-8 text-slate-800 overflow-y-auto">
                            {status === 'idle' && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                    <div className="p-6 bg-slate-50 rounded-full">
                                        <Sparkles size={48} className="text-slate-300" />
                                    </div>
                                    <p className="font-medium">准备就绪，请点击左侧按钮生成汇报。</p>
                                </div>
                            )}
                            
                            {(status === 'masking' || status === 'generating') && (
                                <div className="h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <p className="text-slate-500 text-sm animate-pulse">正在构建上下文...</p>
                                </div>
                            )}

                            {status === 'done' && (
                                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600">
                                    <ReactMarkdown>{displayReport}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAgent;
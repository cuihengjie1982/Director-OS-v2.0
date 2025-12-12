import React, { useState, useEffect } from 'react';
import { Users, Shield, Activity, Plus, Trash2, Edit2, Check, Server, Save, X, UserPlus, Briefcase, Settings, FileText, AlertTriangle, Layers, ListPlus, MinusCircle } from 'lucide-react';
import { Project, User, BusinessType, ProjectStatus, UserRole, PMProfile, SystemConfig } from '../types';
import { api } from '../services/api';
import { INITIAL_CONFIG } from '../services/storage';

// --- SHARED: DYNAMIC FIELD EDITOR ---
const DynamicFieldsEditor: React.FC<{ 
    fields: Record<string, string>, 
    onChange: (newFields: Record<string, string>) => void 
}> = ({ fields, onChange }) => {
    const [entries, setEntries] = useState<[string, string][]>(Object.entries(fields || {}));

    const updateEntry = (index: number, key: string, value: string) => {
        const newEntries = [...entries];
        newEntries[index] = [key, value];
        setEntries(newEntries);
        onChange(Object.fromEntries(newEntries));
    };

    const removeEntry = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
        onChange(Object.fromEntries(newEntries));
    };

    const addEntry = () => {
        setEntries([...entries, ['', '']]);
    };

    return (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                <Layers size={12}/> 扩展字段 (Dynamic Schema)
            </label>
            <div className="space-y-2">
                {entries.map(([key, value], idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input 
                            placeholder="字段名 (e.g. 所在地)" 
                            className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                            value={key}
                            onChange={e => updateEntry(idx, e.target.value, value)}
                        />
                        <input 
                            placeholder="值" 
                            className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                            value={value}
                            onChange={e => updateEntry(idx, key, e.target.value)}
                        />
                        <button onClick={() => removeEntry(idx)} className="text-slate-400 hover:text-red-500">
                            <MinusCircle size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addEntry} className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                <ListPlus size={14} /> 添加新字段
            </button>
        </div>
    );
};

// --- MODAL COMPONENTS ---

const EditUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (u: User) => void; initialData?: User }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<User>({ id: '', name: '', username: '', role: 'PM' });
    
    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ id: '', name: '', username: '', role: 'PM' });
    }, [initialData, isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-blue-600"/> {initialData ? '编辑用户' : '新增用户'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">真实姓名</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">登录账号</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">权限角色</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                            <option value="PM">项目经理 (PM)</option>
                            <option value="DIRECTOR">业务总监 (Director)</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 mt-6 justify-end pt-4 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">取消</button>
                    <button onClick={() => { 
                        onSave({ 
                            ...formData, 
                            id: formData.id || `u-${Date.now()}`, 
                            avatarUrl: formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random` 
                        }); 
                        onClose(); 
                    }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">保存</button>
                </div>
            </div>
        </div>
    );
};

const EditPMModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: PMProfile) => void; initialData?: PMProfile }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<PMProfile>({ id: '', name: '', level: '初级项目经理', tags: [], customFields: {} });

    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ id: '', name: '', level: '初级项目经理', tags: [], customFields: {} });
    }, [initialData, isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={20} className="text-purple-600"/> {initialData ? '编辑 PM 档案' : '新增 PM 档案'}</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">姓名</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">职级 Title</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                            <option value="初级项目经理">初级项目经理</option>
                            <option value="高级项目经理">高级项目经理</option>
                            <option value="业务总监">业务总监</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">能力标签 (逗号分隔)</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.tags.join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t=>t.trim())})} />
                    </div>
                    
                    {/* DYNAMIC FIELDS */}
                    <DynamicFieldsEditor fields={formData.customFields || {}} onChange={(newFields) => setFormData({...formData, customFields: newFields})} />
                </div>
                <div className="flex gap-3 mt-6 justify-end pt-4 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">取消</button>
                    <button onClick={() => { 
                        onSave({ 
                            ...formData, 
                            id: formData.id || `pm-${Date.now()}`, 
                            avatarUrl: formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random` 
                        }); 
                        onClose(); 
                    }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm">保存档案</button>
                </div>
            </div>
        </div>
    );
};

const EditProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (p: Project) => void; initialData?: Project; pms: PMProfile[] }> = ({ isOpen, onClose, onSave, initialData, pms }) => {
    const [formData, setFormData] = useState<Project>({ id: '', projectName: '', projectCode: '', businessType: 'BPO' as BusinessType, profitTargetRate: 0.15, slaTargetRate: 0.98, pmId: '', status: ProjectStatus.RampUp, customFields: {} });
    
    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ id: '', projectName: '', projectCode: '', businessType: 'BPO' as BusinessType, profitTargetRate: 0.15, slaTargetRate: 0.98, pmId: pms[0]?.id || '', status: ProjectStatus.RampUp, customFields: {} });
    }, [initialData, isOpen, pms]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Briefcase size={20} className="text-emerald-600"/> {initialData ? '编辑项目' : '注册新项目'}</h3>
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">项目名称</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">项目代号 (Safe Code)</label>
                        <input className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" value={formData.projectCode} onChange={e => setFormData({...formData, projectCode: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">业务类型</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none" value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value as BusinessType})}>
                                <option value="BPO">BPO</option>
                                <option value="RPO">RPO</option>
                                <option value="HRO">HRO</option>
                            </select>
                        </div>
                        <div>
                             <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">PM 负责人</label>
                             <select className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none" value={formData.pmId} onChange={e => setFormData({...formData, pmId: e.target.value})}>
                                {pms.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                             </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">利润率目标</label>
                            <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none" value={formData.profitTargetRate} onChange={e => setFormData({...formData, profitTargetRate: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">SLA 目标</label>
                            <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none" value={formData.slaTargetRate} onChange={e => setFormData({...formData, slaTargetRate: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    
                    {/* DYNAMIC FIELDS */}
                    <DynamicFieldsEditor fields={formData.customFields || {}} onChange={(newFields) => setFormData({...formData, customFields: newFields})} />
                </div>
                <div className="flex gap-3 mt-6 justify-end pt-4 border-t border-slate-100">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">取消</button>
                    <button onClick={() => { 
                        onSave({ 
                            ...formData, 
                            id: formData.id || `proj-${Date.now()}` 
                        }); 
                        onClose(); 
                    }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm">保存项目</button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN ADMIN COMPONENT ---

const SystemAdmin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'system' | 'users' | 'pms' | 'projects' | 'config'>('system');
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [pms, setPms] = useState<PMProfile[]>([]);
    const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
    const [loading, setLoading] = useState(true);
    
    // Modal & Edit States
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const [editingPM, setEditingPM] = useState<PMProfile | undefined>(undefined);
    const [isPMModalOpen, setIsPMModalOpen] = useState(false);

    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [u, d] = await Promise.all([api.getUsers(), api.getDashboardData()]);
            setUsers(u);
            setProjects(d.projects);
            setPms(d.pms);
            if(d.config) setConfig(d.config);
        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // --- HANDLERS (CRUD) ---
    const handleSaveUser = async (u: User) => {
        if (users.find(existing => existing.id === u.id)) {
            // Update logic would go here if API supported generic update, for now we assume add logic is enough for demo or replace
            // In a real app: await api.updateUser(u);
             await api.addUser(u); // Mock overwrites
        } else {
            await api.addUser(u);
        }
        loadData();
    };
    const handleDeleteUser = async (id: string) => { if (confirm('确认删除?')) { await api.deleteUser(id); loadData(); } };

    const handleSavePM = async (pm: PMProfile) => {
        if (pms.find(existing => existing.id === pm.id)) await api.updatePM(pm);
        else await api.addPM(pm);
        loadData();
    };
    const handleDeletePM = async (id: string) => { if (confirm('确认删除该 PM 档案?')) { await api.deletePM(id); loadData(); } };

    const handleSaveProject = async (p: Project) => {
        if (projects.find(existing => existing.id === p.id)) await api.updateProject(p);
        else await api.addProject(p);
        loadData();
    };
    const handleDeleteProject = async (id: string) => { if (confirm('确认删除项目?')) { await api.deleteProject(id); loadData(); } };

    const handleConfigUpdate = async () => {
        await api.updateSystemConfig(config);
        alert('系统配置已更新。全局风险阈值及下载链接已生效。');
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Modals */}
            <EditUserModal isOpen={isUserModalOpen} onClose={() => { setIsUserModalOpen(false); setEditingUser(undefined); }} onSave={handleSaveUser} initialData={editingUser} />
            <EditPMModal isOpen={isPMModalOpen} onClose={() => { setIsPMModalOpen(false); setEditingPM(undefined); }} onSave={handleSavePM} initialData={editingPM} />
            <EditProjectModal isOpen={isProjectModalOpen} onClose={() => { setIsProjectModalOpen(false); setEditingProject(undefined); }} onSave={handleSaveProject} initialData={editingProject} pms={pms} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="text-slate-600" />
                        系统管理控制台
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm">全能后台：自定义字段、权限管理、业务规则配置。</p>
                </div>
                <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                    {[
                        { id: 'system', label: '概况', icon: Server },
                        { id: 'config', label: '全局配置', icon: Settings },
                        { id: 'projects', label: '项目库', icon: Briefcase },
                        { id: 'pms', label: 'PM 档案', icon: Briefcase },
                        { id: 'users', label: '用户权限', icon: Users },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="text-center py-20 text-slate-500">Loading system data...</div> : (
                <>
                    {activeTab === 'system' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">System Status</h3>
                                <div className="text-emerald-600 text-xl font-bold flex items-center gap-2"><Check size={20}/> Operational</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Database Stats</h3>
                                <div className="text-slate-800 text-xl font-bold">{users.length} Users / {projects.length} Projects</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Environment</h3>
                                <div className="text-blue-600 text-xl font-bold">{api.isOfflineMode ? 'Local Demo Mode' : 'Live Server'}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20}/> 风险监控规则 (Global Rules)</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 mb-2 block">营收偏差阈值</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" min="0.01" max="0.20" step="0.01" 
                                                value={config.riskThresholds.revenueGap}
                                                onChange={e => setConfig({...config, riskThresholds: {...config.riskThresholds, revenueGap: parseFloat(e.target.value)}})}
                                                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-slate-800 font-mono font-bold w-16">{(config.riskThresholds.revenueGap * 100).toFixed(0)}%</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">当实际营收低于目标的百分比超过此值时，自动标记红灯。</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 mb-2 block">人员流失率警戒线</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" min="0.01" max="0.30" step="0.01" 
                                                value={config.riskThresholds.turnoverRate}
                                                onChange={e => setConfig({...config, riskThresholds: {...config.riskThresholds, turnoverRate: parseFloat(e.target.value)}})}
                                                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-slate-800 font-mono font-bold w-16">{(config.riskThresholds.turnoverRate * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText className="text-blue-600" size={20}/> 资源中心配置</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-slate-500 font-medium mb-1 block">Excel 模板下载链接</label>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            value={config.resources.templateUrl}
                                            onChange={e => setConfig({...config, resources: {...config.resources, templateUrl: e.target.value}})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500 font-medium mb-1 block">操作手册 PDF 链接</label>
                                        <input 
                                            className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                            value={config.resources.guideUrl}
                                            onChange={e => setConfig({...config, resources: {...config.resources, guideUrl: e.target.value}})}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                                    <button 
                                        onClick={handleConfigUpdate}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium"
                                    >
                                        <Save size={18} /> 保存全局配置
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pms' && (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">PM 人才档案库</h3>
                                <button onClick={() => { setEditingPM(undefined); setIsPMModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex gap-2 font-medium transition-colors"><Plus size={16}/> 新增 PM</button>
                            </div>
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-50"><tr><th className="px-6 py-3">姓名</th><th className="px-6 py-3">职级</th><th className="px-6 py-3">扩展字段</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
                                <tbody>
                                    {pms.map(pm => (
                                        <tr key={pm.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-slate-800"><img src={pm.avatarUrl} className="w-8 h-8 rounded-full border border-slate-200"/>{pm.name}</td>
                                            <td className="px-6 py-4">{pm.level}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {pm.customFields && Object.entries(pm.customFields).map(([k,v]) => (
                                                        <span key={k} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{k}:{v}</span>
                                                    ))}
                                                    {(!pm.customFields || Object.keys(pm.customFields).length === 0) && <span className="text-slate-400 text-xs italic">无</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => { setEditingPM(pm); setIsPMModalOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                                                <button onClick={() => handleDeletePM(pm.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">项目注册表</h3>
                                <button onClick={() => { setEditingProject(undefined); setIsProjectModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm flex gap-2 font-medium transition-colors"><Plus size={16}/> 注册新项目</button>
                            </div>
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-50"><tr><th className="px-6 py-3">项目</th><th className="px-6 py-3">负责人</th><th className="px-6 py-3">利润目标</th><th className="px-6 py-3">扩展信息</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
                                <tbody>
                                    {projects.map(p => (
                                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{p.projectName}</div>
                                                <div className="text-xs text-slate-400 font-mono">{p.projectCode}</div>
                                            </td>
                                            <td className="px-6 py-4">{pms.find(pm=>pm.id===p.pmId)?.name || p.pmId}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-slate-700">{(p.profitTargetRate*100).toFixed(0)}%</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {p.customFields && Object.entries(p.customFields).map(([k,v]) => (
                                                        <span key={k} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{k}:{v}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={()=>{ setEditingProject(p); setIsProjectModalOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                                                <button onClick={() => handleDeleteProject(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'users' && (
                         <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">用户权限管理</h3>
                                <button onClick={() => { setEditingUser(undefined); setIsUserModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex gap-2 font-medium transition-colors"><Plus size={16}/> 新增用户</button>
                            </div>
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-50"><tr><th className="px-6 py-3">用户</th><th className="px-6 py-3">角色</th><th className="px-6 py-3 text-right">操作</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-4 flex gap-3 items-center">
                                                <img src={u.avatarUrl} className="w-8 h-8 rounded-full border border-slate-200"/> 
                                                <div>
                                                    <div className="font-medium text-slate-800">{u.name}</div>
                                                    <div className="text-xs text-slate-400">@{u.username}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-xs font-semibold">{u.role}</span></td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                {u.username !== 'director' && (
                                                    <>
                                                        <button onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                                                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SystemAdmin;
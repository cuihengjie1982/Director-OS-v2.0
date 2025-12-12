import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Cockpit from './components/Cockpit';
import DataLoader from './components/DataLoader';
import PMScorecard from './components/PMScorecard';
import AIAgent from './components/AIAgent';
import Login from './components/Login';
import SystemAdmin from './components/SystemAdmin';
import { Menu, CloudOff, Calendar, ChevronDown } from 'lucide-react';
import { api } from './services/api'; 
import { User, Project, WeeklyMetric, PMProfile, TransformationTask, SystemConfig, DateRange, TimeRangeOption } from './types';
import { INITIAL_CONFIG } from './services/storage';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<WeeklyMetric[]>([]);
  const [pms, setPms] = useState<PMProfile[]>([]);
  const [tasks, setTasks] = useState<TransformationTask[]>([]);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);

  // --- Global Filter State ---
  const [dateRange, setDateRange] = useState<DateRange>({
      option: 'YEAR',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      label: '2023 全年'
  });

  // --- UI State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
        const data: any = await api.getDashboardData();
        setProjects(data.projects || []);
        setMetrics(data.metrics || []);
        setPms(data.pms || []);
        setTasks(data.tasks || []);
        if (data.config) setConfig(data.config);
        setIsOffline(api.isOfflineMode);
    } catch (e) {
        console.error("Critical Error", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    await refreshData();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const handleDateOptionChange = (option: TimeRangeOption) => {
      const now = new Date();
      let start = '';
      let end = now.toISOString().split('T')[0];
      let label = '';

      switch(option) {
          case 'WEEK':
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
              start = weekStart.toISOString().split('T')[0];
              label = '本周';
              break;
          case 'MONTH':
              start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
              label = '本月';
              break;
          case 'QUARTER':
              const q = Math.floor(now.getMonth() / 3);
              start = new Date(now.getFullYear(), q * 3, 1).toISOString().split('T')[0];
              label = '本季度';
              break;
          case 'YEAR':
              start = '2023-01-01'; 
              end = '2023-12-31';
              label = '2023 全年';
              break;
          case 'ALL':
              start = '2000-01-01';
              label = '全部时间';
              break;
          case 'CUSTOM':
              start = dateRange.startDate;
              end = dateRange.endDate;
              label = '自定义区间';
              break;
          default:
              label = '自定义';
      }

      setDateRange({ option, startDate: start, endDate: end, label });
  };

  // Handle manual date changes
  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
      const newRange = { ...dateRange, option: 'CUSTOM' as TimeRangeOption, label: '自定义区间' };
      if (field === 'start') newRange.startDate = value;
      else newRange.endDate = value;
      setDateRange(newRange);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Cockpit projects={projects} metrics={metrics} tasks={tasks} dateRange={dateRange} config={config} />;
      case 'loader': return <DataLoader onDataUpdate={refreshData} config={config} />;
      case 'pms': return <PMScorecard pms={pms} projects={projects} metrics={metrics} dateRange={dateRange} />;
      case 'ai': return <AIAgent projects={projects} metrics={metrics} />;
      case 'admin': return user.role === 'DIRECTOR' ? <SystemAdmin /> : <div>无权访问</div>;
      default: return <Cockpit projects={projects} metrics={metrics} tasks={tasks} dateRange={dateRange} config={config} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {isOffline && (
        <div className="fixed bottom-4 right-4 z-50 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
            <CloudOff size={14} />
            本地演示模式
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
             <span className="font-bold text-slate-800">Director OS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        
        {/* Global Toolbar */}
        {!isLoading && (
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                    {activeTab === 'dashboard' && '指挥官驾驶舱'}
                    {activeTab === 'loader' && '数据装载中心'}
                    {activeTab === 'pms' && 'PM 人才雷达'}
                    {activeTab === 'ai' && 'AI 安全参谋'}
                    {activeTab === 'admin' && '系统管理控制台'}
                </h2>
                
                {/* Enhanced Date Picker */}
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 px-2 border-r border-slate-200">
                        <Calendar size={16} className="text-blue-500" />
                        <div className="relative">
                            <select 
                                value={dateRange.option} 
                                onChange={(e) => handleDateOptionChange(e.target.value as TimeRangeOption)}
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none appearance-none pr-6 cursor-pointer"
                            >
                                <option value="WEEK">本周</option>
                                <option value="MONTH">本月</option>
                                <option value="QUARTER">本季度</option>
                                <option value="YEAR">2023 全年</option>
                                <option value="ALL">全部历史</option>
                                <option value="CUSTOM">自由时间选择...</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {dateRange.option === 'CUSTOM' ? (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <input 
                                type="date" 
                                value={dateRange.startDate} 
                                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-slate-400">-</span>
                            <input 
                                type="date" 
                                value={dateRange.endDate} 
                                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    ) : (
                        <div className="px-3 text-xs text-slate-500 font-medium">
                           {dateRange.startDate} ~ {dateRange.endDate}
                        </div>
                    )}
                </div>
            </div>
        )}

        {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">正在同步企业数据...</p>
                </div>
            </div>
        ) : (
            <div className="flex-1 bg-slate-50">
                {renderContent()}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
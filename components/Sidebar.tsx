import React from 'react';
import { LayoutDashboard, FileUp, Users, Bot, Settings, X, LogOut, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose, user, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: '指挥官驾驶舱', icon: <LayoutDashboard size={20} /> },
        { id: 'loader', label: '数据装载中心', icon: <FileUp size={20} /> },
        { id: 'pms', label: 'PM 人才雷达', icon: <Users size={20} /> },
        { id: 'ai', label: 'AI 安全参谋', icon: <Bot size={20} /> },
    ];

    if (user?.role === 'DIRECTOR') {
        menuItems.push({ id: 'admin', label: '系统控制台', icon: <Settings size={20} /> });
    }

    return (
        <div className={`
            fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-slate-200 flex flex-col 
            transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
        `}>
            {/* Logo Area */}
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <span className="text-white font-bold text-lg">D</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Director OS</h1>
                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded-sm mt-1 inline-block">Enterprise</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="md:hidden text-slate-400 hover:text-slate-600 p-1"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Main Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${isActive 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </div>
                            {isActive && <ChevronRight size={14} className="text-blue-500" />}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                {user && (
                    <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                        <img 
                            src={user.avatarUrl} 
                            alt={user.name} 
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-600 rounded-lg text-xs font-medium transition-all"
                >
                    <LogOut size={14} /> 退出系统
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
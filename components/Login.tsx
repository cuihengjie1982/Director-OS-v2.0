import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldAlert, Loader } from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';

interface LoginProps {
    onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // API will automatically fallback to mock user if backend is unreachable
        const user = await api.login(username);
        
        if (user) {
            onLogin(user);
        } else {
            setError('登录失败。用户不存在 (尝试使用: director)');
        }
        setLoading(false);
    };

    const quickLogin = async (name: string) => {
        setUsername(name);
        setLoading(true);
        const user = await api.login(name);
        if (user) onLogin(user);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <ShieldAlert className="text-blue-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wider">Director OS <span className="text-blue-500">v3.0</span></h1>
                    <p className="text-slate-400 mt-2 text-sm">企业级 BPO 业务指挥系统 (API 架构)</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            系统账号
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="text-slate-500" size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="请输入用户名"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                            <Lock size={12} /> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin" size={16} /> : '进入系统'}
                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    
                    <p className="text-[10px] text-slate-500 text-center">
                        *若连接不上后端服务器，系统将自动切换至本地演示模式。
                    </p>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-700">
                    <p className="text-xs text-slate-500 text-center mb-4">模拟环境快速登录：</p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => quickLogin('director')}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                        >
                            总监 (director)
                        </button>
                        <button 
                            onClick={() => quickLogin('pm')}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                        >
                            项目经理 (pm)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
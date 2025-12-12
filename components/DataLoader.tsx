import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, RefreshCw, Server, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { api } from '../services/api';
import { WeeklyMetric, SystemConfig } from '../types';

interface DataLoaderProps {
    onDataUpdate: () => void;
    config: SystemConfig;
}

const DataLoader: React.FC<DataLoaderProps> = ({ onDataUpdate, config }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => { setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); simulateUpload(); };

    const simulateUpload = () => {
        setUploadStatus('parsing');
        setTimeout(async () => {
            setUploadStatus('uploading');
            const newMetrics: WeeklyMetric[] = [
                { id: `met-${Date.now()}-1`, projectCode: 'Project_Alpha', reportWeek: new Date().toISOString().split('T')[0], revenueActual: 52000, revenueTarget: 50000, headcount: 125, slaAchieved: 0.98, turnoverRate: 0.015, riskFlag: false, riskDetails: '' },
                { id: `met-${Date.now()}-2`, projectCode: 'Project_Sierra', reportWeek: new Date().toISOString().split('T')[0], revenueActual: 78000, revenueTarget: 80000, headcount: 305, slaAchieved: 0.995, turnoverRate: 0.01, riskFlag: false, riskDetails: '' }
            ];
            const success = await api.uploadMetrics(newMetrics);
            if (success) { onDataUpdate(); setUploadStatus('success'); } else { setUploadStatus('error'); }
        }, 2000);
    };

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <FileSpreadsheet className="text-emerald-600"/> 数据装载中心
                    </h2>
                    <p className="text-slate-500 text-sm">将本地 Excel 周报解析并同步至云端数据库。</p>
                </div>
                <div className="flex gap-3">
                     <a href={config.resources.guideUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-sm border border-slate-200 transition-colors shadow-sm font-medium">
                        <FileText size={16} /> 查阅操作手册
                    </a>
                    <a href={config.resources.templateUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors shadow-md shadow-emerald-600/20 font-medium">
                        <Download size={16} /> 下载标准周报模板
                    </a>
                </div>
            </div>

            <div 
                className={`
                    border-2 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer bg-white shadow-sm
                    ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                    ${uploadStatus === 'success' ? 'border-emerald-500 bg-emerald-50' : ''}
                    ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
                `}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => uploadStatus !== 'parsing' && uploadStatus !== 'uploading' && simulateUpload()}
            >
                {uploadStatus === 'idle' && (
                    <>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 shadow-sm"><Upload size={32} /></div>
                        <p className="text-xl text-slate-700 font-bold mb-1">点击或将 Excel 文件拖拽至此</p>
                        <p className="text-sm text-slate-400">支持 .xlsx (最大 10MB)</p>
                    </>
                )}
                
                {uploadStatus === 'parsing' && (
                    <>
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg text-slate-700 font-medium">正在解析 Excel 数据...</p>
                        <p className="text-sm text-slate-400 mt-2">校验数据完整性</p>
                    </>
                )}

                {uploadStatus === 'uploading' && (
                    <>
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg text-slate-700 font-medium">正在同步至服务器...</p>
                        <div className="flex items-center gap-2 text-sm text-purple-600 mt-2 font-mono bg-purple-50 px-3 py-1 rounded-full">
                            <Server size={14} /> POST /api/upload
                        </div>
                    </>
                )}

                {uploadStatus === 'success' && (
                    <>
                        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4"><CheckCircle size={32} /></div>
                        <p className="text-xl text-slate-800 font-bold">导入成功</p>
                        <p className="text-slate-500 text-sm mt-1">数据已入库并刷新看板</p>
                        <button onClick={(e) => { e.stopPropagation(); setUploadStatus('idle'); }} className="mt-6 px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm flex items-center gap-2 font-medium shadow-sm transition-colors">
                            <RefreshCw size={14} /> 继续上传
                        </button>
                    </>
                )}

                {uploadStatus === 'error' && (
                    <>
                        <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4"><AlertCircle size={32} /></div>
                        <p className="text-xl text-slate-800 font-bold">上传失败</p>
                        <p className="text-slate-500 text-sm mt-1">请检查文件格式或网络连接</p>
                        <button onClick={(e) => { e.stopPropagation(); setUploadStatus('idle'); }} className="mt-6 px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium shadow-sm">
                            重试
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DataLoader;
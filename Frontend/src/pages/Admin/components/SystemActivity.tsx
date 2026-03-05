import React from 'react';
import { Activity, Server, Database, Shield, Check } from 'lucide-react';
import { Card } from './ui/Card';
import { MOCK_ACTIVITY } from '../constants';
import { useAppContext } from '../context/AppContext';

export const SystemActivity: React.FC = () => {
  const { t } = useAppContext();
  // Generate heatmap data
  const hours = 24;
  const days = 7;
  const heatmapData = Array.from({ length: days * hours }, () => Math.random());

  const getColor = (value: number) => {
    if (value > 0.8) return 'bg-blue-900 dark:bg-blue-600';
    if (value > 0.6) return 'bg-blue-700 dark:bg-blue-700';
    if (value > 0.4) return 'bg-blue-500 dark:bg-blue-800';
    if (value > 0.2) return 'bg-blue-300 dark:bg-blue-900';
    return 'bg-slate-200 dark:bg-slate-700';
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="animate-slide-in">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('activity.title')}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('activity.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics */}
        <Card className="p-6 flex items-center gap-4" delay={0}>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Server size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('activity.serverUptime')}</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">99.99%</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4" delay={100}>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('activity.databaseLoad')}</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">24ms</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4" delay={200}>
          <div className="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('activity.securityStatus')}</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('activity.secure')}</h3>
          </div>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card className="p-6" delay={300}>
        <div className="flex items-center gap-2 mb-4">
           <Activity size={20} className="text-slate-400" />
           <h3 className="font-bold text-slate-800 dark:text-white">{t('activity.trafficIntensity')}</h3>
        </div>
        
        <div className="grid grid-rows-7 grid-flow-col gap-1 h-32 w-full">
          {heatmapData.map((val, i) => (
            <div 
              key={i} 
              className={`w-full h-full rounded-sm ${getColor(val)} transition-all duration-500 hover:scale-125 hover:z-10`}
              title={`Activity: ${Math.round(val * 100)}%`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Mon</span>
          <span>Sun</span>
        </div>
      </Card>

      {/* Live Logs */}
      <Card className="p-0 overflow-hidden" delay={400}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-800 dark:text-white">{t('activity.recentLogs')}</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {MOCK_ACTIVITY.map((log, i) => (
            <div 
              key={log.id} 
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              style={{ animation: `slideIn 0.3s ease-out forwards ${i * 100}ms`, opacity: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.type === 'success' ? 'bg-emerald-500' : 
                  log.type === 'error' ? 'bg-red-500' :
                  log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('activity.by')} {log.user}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">{log.timestamp}</span>
            </div>
          ))}
        </div>
        <div className="p-3 text-center border-t border-slate-100 dark:border-slate-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors">{t('activity.viewAllLogs')}</button>
        </div>
      </Card>
    </div>
  );
};

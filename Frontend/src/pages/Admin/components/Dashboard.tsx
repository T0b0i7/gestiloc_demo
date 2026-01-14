import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Users, CreditCard, AlertCircle, MapPin, Download } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAppContext } from '../context/AppContext';
import { apiService, AdminDashboardStats } from '../../../services/api';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  delay?: number;
  colorClass?: string;
}

const StatCard = ({ title, value, trend, icon: Icon, delay, colorClass }: StatCardProps) => (
  <Card delay={delay} className="p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">{value}</h3>
      <div className="flex items-center text-xs font-medium">
        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded flex items-center">
          <ArrowUpRight size={14} className="mr-1" /> {trend}
        </span>
      </div>
    </div>
    {Icon && (
      <div className={`p-3 rounded-lg ${colorClass} shadow-sm`}>
        <Icon width={24} height={24} className="text-white" />
      </div>
    )}
  </Card>
);

export const Dashboard: React.FC = () => {
  const { t, showToast } = useAppContext();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsStatsLoading(true);
        const data = await apiService.getDashboardStats();
        setStats(data);
        setStatsError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setStatsError('Erreur lors du chargement des données');
        showToast('Erreur lors du chargement des statistiques', 'error');
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  const handleExport = () => {
    showToast(t('common.success'), 'success');
  };

  return (
    <div className="space-y-6 p-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 animate-slide-in">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-violet-600 dark:from-blue-400 dark:to-violet-400 animate-gradient">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="secondary" onClick={handleExport} icon={<Download size={16}/>}>
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalProperties')}
          value={stats?.properties.total_properties || 0}
          trend={`${stats?.properties.new_properties_this_month || 0} ce mois`}
          icon={MapPin}
          delay={0}
          colorClass="bg-blue-600"
        />
        <StatCard
          title={t('dashboard.activeTenants')}
          value={stats?.kpi.total_tenants || 0}
          trend={`${stats?.kpi.user_growth_rate || 0}%`}
          icon={Users}
          delay={100}
          colorClass="bg-violet-600"
        />
        <StatCard
          title={t('dashboard.monthlyRevenue')}
          value={`${(stats?.financial.monthly_collected_rent || 0).toLocaleString()} XOF`}
          trend={`${stats?.financial.revenue_growth_rate || 0}%`}
          icon={CreditCard}
          delay={200}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title={t('dashboard.pendingIssues')}
          value={stats?.maintenance.open_requests || 0}
          trend={`${stats?.maintenance.total_requests || 0} total`}
          icon={AlertCircle}
          delay={300}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card className="p-6 min-h-[400px]" delay={400}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('dashboard.financialPerformance')}</h3>
            <select 
              title="Select time period"
              aria-label="Select time period"
              className="text-sm border-none bg-slate-50 dark:bg-slate-700 rounded-md px-3 py-1 text-slate-600 dark:text-slate-200 focus:ring-0 cursor-pointer"
            >
              <option>{t('dashboard.thisYear')}</option>
              <option>{t('dashboard.lastYear')}</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.charts.revenue_trend || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    color: '#1e293b'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="collected_rent"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>



    </div>
  );
};
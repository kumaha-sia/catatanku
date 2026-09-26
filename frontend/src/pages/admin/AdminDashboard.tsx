import React from 'react';
import { useAdminStats, useAdminActivity, useAdminGrowth, useAdminTopCategories } from '../../hooks/useAdmin';
import { Users, Home, Activity, Wallet, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CustomTooltip = ({ active, payload, label, suffix = 'Transaksi' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border-4 border-text-primary p-3 shadow-[6px_6px_0_0_#171B22]">
        <p className="font-black uppercase text-sm mb-1">{label}</p>
        <p className="font-bold text-income text-lg">{payload[0].value} <span className="text-sm text-text-primary">{suffix}</span></p>
      </div>
    );
  }
  return null;
};

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, isError, error } = useAdminStats();
  const { data: activity, isLoading: loadActivity } = useAdminActivity();
  const { data: growth, isLoading: loadGrowth } = useAdminGrowth();
  const { data: topCat, isLoading: loadTopCat } = useAdminTopCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="text-text-primary text-xl font-black uppercase animate-pulse border-4 border-text-primary p-6 shadow-[4px_4px_0_0_#171B22] bg-surface">
          Memuat Data Sistem...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-error border-4 border-text-primary p-6 shadow-[4px_4px_0_0_#171B22]">
        <h2 className="text-xl font-black uppercase text-surface mb-2">Gagal Memuat Statistik</h2>
        <p className="font-bold text-surface">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="border-b-4 border-text-primary pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Ringkasan Sistem</h1>
          <p className="text-text-secondary font-bold text-sm mt-1 uppercase tracking-widest">Dashboard & Analitik Platform FinBareng</p>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Pengguna" value={stats?.total_users ?? 0} icon={<Users size={24} className="stroke-[3]" />} color="bg-primary" />
        <StatCard title="Total Keluarga" value={stats?.total_households ?? 0} icon={<Home size={24} className="stroke-[3]" />} color="bg-accent" />
        <StatCard title="Transaksi (Bulan Ini)" value={stats?.total_transactions_this_month ?? 0} icon={<Activity size={24} className="stroke-[3]" />} color="bg-income" />
        <StatCard title="Hutang Aktif" value={stats?.total_active_debts ?? 0} icon={<Wallet size={24} className="stroke-[3]" />} color="bg-error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth (Line Chart) */}
        <div className="bg-surface border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b-4 border-text-primary pb-2">
            <TrendingUp size={24} className="stroke-[3] text-primary" />
            <h2 className="text-xl font-black uppercase">Pertumbuhan User (12 Bln)</h2>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            {loadGrowth ? <div className="w-full h-full flex items-center justify-center font-black animate-pulse border-4 border-text-primary bg-surface-muted">Memuat...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E1" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#171B22', fontWeight: 900, fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#171B22', strokeWidth: 4 }} tickMargin={10} />
                  <YAxis tick={{ fill: '#171B22', fontWeight: 900, fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip suffix="User Baru" />} cursor={{ stroke: '#171B22', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Line type="monotone" dataKey="count" stroke="#0C6B58" strokeWidth={4} dot={{ stroke: '#171B22', strokeWidth: 3, r: 6, fill: '#FFFFFF' }} activeDot={{ r: 8, fill: '#FFB43A' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-surface border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] p-6">
          <div className="flex items-center gap-2 mb-6 border-b-4 border-text-primary pb-2">
            <PieChartIcon size={24} className="stroke-[3] text-accent" />
            <h2 className="text-xl font-black uppercase">Kategori Terpopuler</h2>
          </div>
          {loadTopCat ? <div className="animate-pulse font-bold text-center mt-10">Memuat...</div> : (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {topCat?.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-4 border-text-primary p-3 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] transition-all bg-background">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-surface border-4 border-text-primary p-1 md:p-2">{cat.category.icon}</span>
                    <div>
                      <h3 className="font-black uppercase text-sm md:text-base leading-tight">{cat.category.name}</h3>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{cat.count} TRX</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!topCat || topCat.length === 0) && (
                <div className="text-center p-8 border-4 border-dashed border-text-primary font-black uppercase text-text-secondary">Belum ada data</div>
              )}
            </div>
          )}
        </div>

        {/* Activity (Bar Chart) */}
        <div className="bg-surface border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] p-6 md:p-8 lg:col-span-3">
          <div className="flex items-center gap-2 mb-6 border-b-4 border-text-primary pb-2">
            <Activity size={24} className="stroke-[3] text-income" />
            <h2 className="text-xl font-black uppercase">Aktivitas Sistem Terkini (30 Hari)</h2>
          </div>
          <div className="h-64 md:h-80 w-full">
            {loadActivity ? (
              <div className="w-full h-full flex items-center justify-center font-black animate-pulse border-4 border-text-primary bg-surface-muted">Memuat Grafik...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E6E1" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#171B22', fontWeight: 900, fontSize: 12 }} 
                    tickLine={false}
                    axisLine={{ stroke: '#171B22', strokeWidth: 4 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fill: '#171B22', fontWeight: 900, fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip suffix="Transaksi" />} cursor={{ fill: '#F1F2EE' }} />
                  <Bar 
                    dataKey="count" 
                    fill="#12B76A" 
                    stroke="#171B22" 
                    strokeWidth={3} 
                    radius={[2, 2, 0, 0]} 
                    activeBar={{ stroke: '#171B22', strokeWidth: 4, fill: '#FFB43A' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => {
  return (
    <div className={`border-4 border-text-primary p-4 md:p-6 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] shadow-[4px_4px_0_0_#171B22] flex flex-col justify-between h-32 md:h-40 ${color}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-surface font-black uppercase text-xs tracking-wider max-w-[70%]">{title}</h3>
        <div className="text-surface opacity-80">{icon}</div>
      </div>
      <p className="text-3xl md:text-4xl font-black text-surface mt-auto">{value}</p>
    </div>
  );
};

export default AdminDashboard;

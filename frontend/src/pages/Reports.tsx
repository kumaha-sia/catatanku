import React, { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// Dummy data for cashflow
const cashflowData = [
  { name: 'Jan', income: 15000000, expense: 12000000 },
  { name: 'Feb', income: 16500000, expense: 14000000 },
  { name: 'Mar', income: 15000000, expense: 11500000 },
  { name: 'Apr', income: 20000000, expense: 15000000 },
  { name: 'Mei', income: 15500000, expense: 13000000 },
  { name: 'Jun', income: 17000000, expense: 12500000 },
  { name: 'Jul', income: 16000000, expense: 14500000 },
];

// Dummy data for categories
const categoryData = [
  { name: 'Makanan & Minuman', value: 4500000, color: '#FFB43A' }, // Warning
  { name: 'Transportasi', value: 2100000, color: '#3A82FF' }, // Blue
  { name: 'Tagihan & Utilitas', value: 3500000, color: '#FF3A60' }, // Error
  { name: 'Hiburan', value: 1200000, color: '#9D3AFF' }, // Purple
  { name: 'Belanja', value: 2800000, color: '#0C6B58' }, // Primary
];

const formatIDR = (value: number) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${(value / 1000).toFixed(0)}k`;
};

export const Reports = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [reportType, setReportType] = useState<'CASHFLOW' | 'CATEGORY'>('CASHFLOW');

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Laporan & Analitik</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg font-semibold text-xs shadow-sm border border-border">
          <Calendar size={14} />
          Tahun 2026
        </button>
      </div>

      {/* Tabs - Pribadi vs Keluarga */}
      <div className="flex p-1 bg-surface-muted rounded-xl w-full sm:w-64">
        <button 
          onClick={() => setActiveTab('ME')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'ME' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Pribadi
        </button>
        <button 
          onClick={() => setActiveTab('FAMILY')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'FAMILY' ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Keluarga
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-text-secondary mb-1">
            <TrendingUp size={16} className="text-income" />
            <span className="text-xs font-bold uppercase tracking-wider">Total Masuk</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">Rp 115.000.000</p>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-text-secondary mb-1">
            <TrendingDown size={16} className="text-expense" />
            <span className="text-xs font-bold uppercase tracking-wider">Total Keluar</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary">Rp 92.500.000</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-4 border-b border-border">
        <button 
          onClick={() => setReportType('CASHFLOW')}
          className={`pb-3 text-sm font-bold transition-all relative ${reportType === 'CASHFLOW' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Tren Arus Kas
          {reportType === 'CASHFLOW' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setReportType('CATEGORY')}
          className={`pb-3 text-sm font-bold transition-all relative ${reportType === 'CATEGORY' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Kategori Pengeluaran
          {reportType === 'CATEGORY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Chart Area */}
      <div className="bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-sm">
        
        {reportType === 'CASHFLOW' && (
          <>
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Surplus Tahun Ini</h3>
                <p className="text-2xl font-bold text-income mt-1">+ Rp 22.500.000</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={formatIDR} />
                  <RechartsTooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="income" name="Pemasukan" fill="#0C6B58" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#FFB43A" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {reportType === 'CATEGORY' && (
          <>
            <div className="mb-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-muted rounded-lg font-semibold text-xs border border-border">
                Agustus 2026 <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="h-64 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Total']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-semibold text-text-primary">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-text-primary">
                      Rp {item.value.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

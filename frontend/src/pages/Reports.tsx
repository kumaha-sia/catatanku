import { useState } from 'react';
import { TrendingUp, TrendingDown, Scale, Printer } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useHouseholds, useReportSummary, useMembers } from '../hooks/useFinances';

const formatIDR = (value: number) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}k`;
  }
  return `Rp ${value}`;
};

export const Reports = () => {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [periodType, setPeriodType] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  const { data: households } = useHouseholds();
  
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  const joinedHousehold = households?.find((h: any) => h.role !== 'OWNER' && h.status !== 'PENDING');
  const familyHousehold = joinedHousehold || personalHousehold;

  const { data: members } = useMembers(familyHousehold?.id);
  const hasFamily = !!joinedHousehold || (members && members.length > 1);

  const scope = activeTab === 'ME' ? 'PERSONAL' : 'FAMILY';

  const { data: report } = useReportSummary(
    familyHousehold?.id, 
    periodType === 'MONTH' ? String(currentMonth) : 'all',
    String(currentYear),
    scope
  );

  const data = report || { total_income: 0, total_expense: 0, balance: 0, cashflow: [], spending_by_category: [] };
  const savingsRate = data.total_income > 0 ? ((data.balance / data.total_income) * 100).toFixed(0) : '0';

  const handlePrev = () => {
    if (periodType === 'MONTH') {
      if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
      else setCurrentMonth(m => m - 1);
    } else {
      setCurrentYear(y => y - 1);
    }
  };

  const handleNext = () => {
    if (periodType === 'MONTH') {
      if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
      else setCurrentMonth(m => m + 1);
    } else {
      setCurrentYear(y => y + 1);
    }
  };

  const periodLabel = periodType === 'MONTH'
    ? new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : `Tahun ${currentYear}`;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-text-primary uppercase tracking-wide">Laporan</h1>
      </div>

      {/* Period Navigation */}
      <div className="flex flex-col gap-4 no-print">
        {/* Month/Year Selector */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-none"
          >
            &lt;
          </button>
          
          <div className="flex-1 px-4 py-2 bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] font-black uppercase tracking-wider text-sm text-center">
            {periodLabel}
          </div>

          <button 
            onClick={handleNext}
            className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-none"
          >
            &gt;
          </button>
        </div>

        {/* Inline Period Toggle + Tabs Row */}
        <div className="flex gap-3">
          {/* Period Toggle */}
          <div className="flex p-1 bg-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">
            <button 
              onClick={() => setPeriodType('MONTH')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${periodType === 'MONTH' ? 'bg-accent text-text-primary border-2 border-text-primary shadow-[1px_1px_0_0_#171B22]' : 'text-text-secondary border-2 border-transparent'}`}
            >
              Bulanan
            </button>
            <button 
              onClick={() => setPeriodType('YEAR')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${periodType === 'YEAR' ? 'bg-accent text-text-primary border-2 border-text-primary shadow-[1px_1px_0_0_#171B22]' : 'text-text-secondary border-2 border-transparent'}`}
            >
              Tahunan
            </button>
          </div>

          {/* Pribadi / Keluarga */}
          {hasFamily && (
            <div className="flex p-1 bg-surface border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] flex-1">
              <button 
                onClick={() => setActiveTab('ME')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'ME' ? 'bg-primary text-surface border-2 border-text-primary shadow-[1px_1px_0_0_#171B22]' : 'text-text-secondary border-2 border-transparent'}`}
              >
                Pribadi
              </button>
              <button 
                onClick={() => setActiveTab('FAMILY')}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'FAMILY' ? 'bg-primary text-surface border-2 border-text-primary shadow-[1px_1px_0_0_#171B22]' : 'text-text-secondary border-2 border-transparent'}`}
              >
                Keluarga
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Income */}
        <div className="bg-income border-4 border-text-primary p-3 shadow-[4px_4px_0_0_#171B22] flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 bg-surface border-2 border-text-primary flex items-center justify-center shadow-[1px_1px_0_0_#171B22] flex-shrink-0">
              <TrendingUp size={12} className="stroke-[3]" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-text-primary leading-tight">Masuk</span>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate leading-tight">
            Rp {data.total_income.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Expense */}
        <div className="bg-expense border-4 border-text-primary p-3 shadow-[4px_4px_0_0_#171B22] flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 bg-surface border-2 border-text-primary flex items-center justify-center shadow-[1px_1px_0_0_#171B22] flex-shrink-0">
              <TrendingDown size={12} className="stroke-[3]" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-text-primary leading-tight">Keluar</span>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate leading-tight">
            Rp {data.total_expense.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Surplus */}
        <div className={`${data.balance >= 0 ? 'bg-[#A3E635]' : 'bg-[#FFA6A6]'} border-4 border-text-primary p-3 shadow-[4px_4px_0_0_#171B22] flex flex-col`}>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 bg-surface border-2 border-text-primary flex items-center justify-center shadow-[1px_1px_0_0_#171B22] flex-shrink-0">
              <Scale size={12} className="stroke-[3]" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-text-primary leading-tight">Sisa</span>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate leading-tight">
            {data.balance >= 0 ? '+' : '-'}Rp {Math.abs(data.balance).toLocaleString('id-ID')}
          </p>
          <span className="text-[8px] font-black uppercase tracking-widest text-text-primary/70 mt-1">{savingsRate}% Rasio</span>
        </div>
      </div>

      {/* Section: Arus Kas */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 flex-1 bg-text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest text-text-primary">Arus Kas</h2>
          <div className="h-1 flex-1 bg-text-primary" />
        </div>

        <div className="bg-surface border-4 border-text-primary p-4 sm:p-6 shadow-[6px_6px_0_0_#171B22]">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cashflow || []} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171B2240" />
                <XAxis 
                  dataKey="name" 
                  axisLine={{stroke: '#171B22', strokeWidth: 2}} 
                  tickLine={{stroke: '#171B22', strokeWidth: 2}} 
                  tick={{ fontSize: 10, fill: '#171B22', fontWeight: 900 }} 
                  dy={8}
                  interval={0}
                />
                <YAxis 
                  width={50} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#171B22', fontWeight: 900 }} 
                  tickFormatter={(value: number) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                    return String(value);
                  }}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#171B2210' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface border-4 border-text-primary p-3 shadow-[4px_4px_0_0_#171B22] min-w-[140px]">
                          <p className="text-xs font-black uppercase text-text-primary border-b-2 border-text-primary pb-2 mb-2">{label}</p>
                          {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-[10px] font-black py-0.5 gap-4">
                              <span style={{ color: entry.color }} className="uppercase">{entry.name}</span>
                              <span className="text-text-primary">Rp {Number(entry.value).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '11px', paddingTop: '16px', fontWeight: 900 }} />
                <Bar dataKey="income" name="Pemasukan" fill="#0C6B58" stroke="#171B22" strokeWidth={2} maxBarSize={36} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#FFB43A" stroke="#171B22" strokeWidth={2} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section: Distribusi Pengeluaran */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 flex-1 bg-text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest text-text-primary whitespace-nowrap">Pengeluaran</h2>
          <div className="h-1 flex-1 bg-text-primary" />
        </div>

        <div className="bg-surface border-4 border-text-primary p-4 sm:p-6 shadow-[6px_6px_0_0_#171B22]">
          {(data.spending_by_category || []).length === 0 ? (
            <p className="text-center text-text-secondary font-black uppercase tracking-widest text-xs py-8">Belum ada pengeluaran</p>
          ) : (
            <>
              <div className="h-56 w-full relative mb-6">
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                  <PieChart className="focus:outline-none">
                    <Pie
                      data={data.spending_by_category || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#171B22"
                      strokeWidth={2}
                      style={{ outline: 'none' }}
                    >
                      {(data.spending_by_category || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface border-4 border-text-primary p-3 shadow-[4px_4px_0_0_#171B22]">
                              <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">{payload[0].name}</p>
                              <p className="text-sm font-black text-text-primary">Rp {Number(payload[0].value).toLocaleString('id-ID')}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Total</span>
                  <span className="text-lg font-black text-text-primary">{formatIDR(data.total_expense)}</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="flex flex-col gap-3">
                {(data.spending_by_category || [])
                  .sort((a: any, b: any) => b.value - a.value)
                  .map((item: any, index: number) => {
                  const pct = data.total_expense > 0 ? ((item.value / data.total_expense) * 100) : 0;
                  return (
                    <div key={index} className="p-3 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 pr-3">
                          <div className="w-4 h-4 flex-shrink-0 border-2 border-text-primary" style={{ backgroundColor: item.color || '#cccccc' }} />
                          <span className="text-xs font-black text-text-primary uppercase truncate">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-text-primary flex-shrink-0">
                          Rp {item.value.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-surface border-2 border-text-primary relative overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: item.color || '#cccccc' }}
                        />
                      </div>
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-wider mt-1 text-right">{pct.toFixed(0)}%</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { BottomSheet } from '../components/BottomSheet';
import { useHouseholds, useReportSummary } from '../hooks/useFinances';

const formatIDR = (value: number) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  return `Rp ${(value / 1000).toFixed(0)}k`;
};

export const Reports = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [reportType, setReportType] = useState<'CASHFLOW' | 'CATEGORY'>('CASHFLOW');
  
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [periodType, setPeriodType] = useState<'MONTH' | 'YEAR'>('YEAR');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('8'); // 8 = Aug
  
  const [tempType, setTempType] = useState<'MONTH' | 'YEAR'>('YEAR');
  const [tempYear, setTempYear] = useState('2026');
  const [tempMonth, setTempMonth] = useState('8');

  const { data: households } = useHouseholds();
  const currentHousehold = households?.find((h: any) => 
    activeTab === 'ME' ? h.role === 'OWNER' && h.name.includes('Household') : h.role !== 'OWNER' || !h.name.includes('Household')
  );

  const { data: report } = useReportSummary(
    currentHousehold?.id, 
    periodType === 'MONTH' ? selectedMonth : 'all',
    selectedYear
  );

  const handleSavePeriod = () => {
    setPeriodType(tempType);
    setSelectedYear(tempYear);
    setSelectedMonth(tempMonth);
    setIsPeriodOpen(false);
  };

  const periodValueStr = periodType === 'YEAR' ? selectedYear : `${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][parseInt(selectedMonth)-1]} ${selectedYear}`;

  const data = report || { total_income: 0, total_expense: 0, balance: 0, cashflow: [], spending_by_category: [] };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-wide">Laporan</h1>
        <button 
          onClick={() => setIsPeriodOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-none font-black text-xs uppercase tracking-wider border-2 border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
        >
          <Calendar size={14} className="stroke-[3]" />
          {periodType === 'YEAR' ? 'Tahun ' : ''}{periodValueStr}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-surface border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22] w-full sm:w-64">
        <button 
          onClick={() => setActiveTab('ME')}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all border-2 ${activeTab === 'ME' ? 'bg-primary border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22]' : 'bg-transparent border-transparent text-text-primary hover:border-text-primary/50'}`}
        >
          Pribadi
        </button>
        <button 
          onClick={() => setActiveTab('FAMILY')}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all border-2 ${activeTab === 'FAMILY' ? 'bg-accent border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22]' : 'bg-transparent border-transparent text-text-primary hover:border-text-primary/50'}`}
        >
          Keluarga
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-income border-4 border-text-primary p-4 rounded-none shadow-[4px_4px_0_0_#171B22]">
          <div className="flex items-center gap-2 text-text-primary mb-2">
            <div className="w-8 h-8 bg-surface border-2 border-text-primary rounded-none flex items-center justify-center shadow-[2px_2px_0_0_#171B22]">
              <TrendingUp size={16} className="stroke-[3]" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Total Masuk</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-text-primary">Rp {data.total_income.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-expense border-4 border-text-primary p-4 rounded-none shadow-[4px_4px_0_0_#171B22]">
          <div className="flex items-center gap-2 text-text-primary mb-2">
            <div className="w-8 h-8 bg-surface border-2 border-text-primary rounded-none flex items-center justify-center shadow-[2px_2px_0_0_#171B22]">
              <TrendingDown size={16} className="stroke-[3]" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Total Keluar</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-text-primary">Rp {data.total_expense.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-4 border-b-4 border-text-primary">
        <button 
          onClick={() => setReportType('CASHFLOW')}
          className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative ${reportType === 'CASHFLOW' ? 'text-text-primary' : 'text-text-primary/60 hover:text-text-primary'}`}
        >
          Tren Arus Kas
          {reportType === 'CASHFLOW' && <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-text-primary" />}
        </button>
        <button 
          onClick={() => setReportType('CATEGORY')}
          className={`pb-3 text-sm font-black uppercase tracking-wider transition-all relative ${reportType === 'CATEGORY' ? 'text-text-primary' : 'text-text-primary/60 hover:text-text-primary'}`}
        >
          Kategori
          {reportType === 'CATEGORY' && <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-text-primary" />}
        </button>
      </div>

      {/* Chart Area */}
      <div className="bg-surface border-4 border-text-primary rounded-none p-4 sm:p-6 shadow-[8px_8px_0_0_#171B22]">
        
        {reportType === 'CASHFLOW' && (
          <>
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Surplus {periodType === 'YEAR' ? 'Tahun' : 'Bulan'} Ini</h3>
                <p className={`text-3xl font-black mt-2 bg-text-primary inline-block px-3 py-1 ${data.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {data.balance >= 0 ? '+' : '-'} Rp {Math.abs(data.balance).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.cashflow || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171B22" />
                  <XAxis dataKey="name" axisLine={{stroke: '#171B22', strokeWidth: 2}} tickLine={{stroke: '#171B22', strokeWidth: 2}} tick={{ fontSize: 12, fill: '#171B22', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#171B22', fontWeight: 900 }} tickFormatter={formatIDR} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f0f0f0' }}
                    contentStyle={{ borderRadius: '0', border: '4px solid #171B22', boxShadow: '4px 4px 0 0 #171B22', fontWeight: 900 }}
                    formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', fontWeight: 900 }} />
                  <Bar dataKey="income" name="Pemasukan" fill="#0C6B58" stroke="#171B22" strokeWidth={2} barSize={16} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="#FFB43A" stroke="#171B22" strokeWidth={2} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {reportType === 'CATEGORY' && (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-black text-text-primary mb-1 uppercase tracking-wider">Distribusi Pengeluaran</h3>
              <p className="text-xs text-text-primary font-bold">Berdasarkan kategori tertinggi</p>
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.spending_by_category || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#171B22"
                    strokeWidth={2}
                  >
                    {(data.spending_by_category || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '0', border: '4px solid #171B22', boxShadow: '4px 4px 0 0 #171B22', fontWeight: 900 }}
                    formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-text-primary uppercase tracking-widest">Total</span>
                <span className="text-xl font-black text-text-primary">Rp {formatIDR(data.total_expense)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6 border-t-4 border-text-primary pt-4">
              {(data.spending_by_category || []).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22]">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-text-primary" style={{ backgroundColor: item.color || '#cccccc' }} />
                    <span className="text-sm font-black text-text-primary uppercase">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-text-primary">
                    Rp {item.value.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Period Selection Bottom Sheet */}
      <BottomSheet isOpen={isPeriodOpen} onClose={() => setIsPeriodOpen(false)} title="Pilih Periode Laporan">
        <div className="space-y-6 pt-4">
          
          <div className="flex p-1.5 bg-surface border-4 border-text-primary rounded-none shadow-[4px_4px_0_0_#171B22]">
            <button 
              onClick={() => setTempType('MONTH')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all border-2 ${tempType === 'MONTH' ? 'bg-primary border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22]' : 'bg-transparent border-transparent text-text-primary hover:border-text-primary/50'}`}
            >
              Bulanan
            </button>
            <button 
              onClick={() => setTempType('YEAR')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all border-2 ${tempType === 'YEAR' ? 'bg-primary border-text-primary text-text-primary shadow-[2px_2px_0_0_#171B22]' : 'bg-transparent border-transparent text-text-primary hover:border-text-primary/50'}`}
            >
              Tahunan
            </button>
          </div>

          <div>
            <label className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 block">
              Pilih {tempType === 'MONTH' ? 'Bulan' : 'Tahun'}
            </label>
            {tempType === 'MONTH' ? (
              <div className="flex gap-4">
                <select value={tempMonth} onChange={(e) => setTempMonth(e.target.value)} className="w-1/2 bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] appearance-none cursor-pointer">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'].map((m, i) => (
                    <option key={i} value={String(i+1)}>{m}</option>
                  ))}
                </select>
                <select value={tempYear} onChange={(e) => setTempYear(e.target.value)} className="w-1/2 bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] appearance-none cursor-pointer">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            ) : (
              <select value={tempYear} onChange={(e) => setTempYear(e.target.value)} className="w-full bg-surface border-2 border-text-primary rounded-none px-4 py-3 font-black text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] appearance-none cursor-pointer">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            )}
          </div>

          <button 
            onClick={handleSavePeriod}
            className="w-full py-4 bg-primary text-text-primary border-4 border-text-primary rounded-none font-black text-lg uppercase tracking-wider shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all mt-4"
          >
            Terapkan
          </button>
        </div>
      </BottomSheet>

    </div>
  );
};

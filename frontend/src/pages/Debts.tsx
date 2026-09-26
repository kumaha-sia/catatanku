import { useState } from 'react';
import { Plus, Trash2, ArrowRightLeft, CheckCircle, Wallet } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { useDebts, useCreateDebt, useUpdateDebt, useDeleteDebt, useHouseholds, useWallets, usePayDebt } from '../hooks/useFinances';

export const Debts = () => {
  const [activeTab, setActiveTab] = useState<'ME' | 'FAMILY'>('ME');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [debtType, setDebtType] = useState<'LEND' | 'BORROW'>('LEND');
  const [personName, setPersonName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [debtNote, setDebtNote] = useState('');
  const [walletId, setWalletId] = useState('');
  
  const [selectedDebtId, setSelectedDebtId] = useState('');

  // Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payWalletId, setPayWalletId] = useState('');
  const [payingDebt, setPayingDebt] = useState<any>(null);
  
  const { data: households } = useHouseholds();
  const personalHousehold = households?.find((h: any) => h.role === 'OWNER') || households?.[0];
  const joinedHousehold = households?.find((h: any) => h.role !== 'OWNER' && h.status !== 'PENDING');
  const familyHousehold = joinedHousehold || personalHousehold;

  const currentHouseholdId = activeTab === 'ME' ? undefined : familyHousehold?.id;
  const hasFamily = !!joinedHousehold;

  const { data: debts } = useDebts(currentHouseholdId);
  const { data: walletsData } = useWallets();
  const personalWallets = walletsData?.personal || [];
  const familyWallets = walletsData?.family_members?.flatMap((m: any) => m.wallets) || [];
  const availableWallets = activeTab === 'ME' ? personalWallets : [...personalWallets, ...familyWallets];

  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();
  const payDebt = usePayDebt();

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatNumber = (value: string) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handleSave = async () => {
    if (!walletId && !editMode) {
      window.toast.error('Pilih dompet terlebih dahulu!');
      return;
    }

    try {
      const data: any = {
        household_id: currentHouseholdId || null,
        person_name: personName,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        note: debtNote
      };

      if (editMode && selectedDebtId) {
        // Edit mode doesn't allow changing type, amount, or wallet to prevent messy transaction rewrites
        await updateDebt.mutateAsync({ id: selectedDebtId, data });
        window.toast.success('Perubahan disimpan!');
      } else {
        data.type = debtType;
        data.amount = parseFloat(debtAmount.replace(/\./g, '')) || 0;
        data.wallet_id = walletId;
        await createDebt.mutateAsync(data);
        window.toast.success('Hutang/Piutang berhasil dicatat & masuk ke saldo!');
      }
      setIsModalOpen(false);
    } catch (e: any) {
      console.error(e);
      window.toast.error(e?.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handlePay = async () => {
    if (!payWalletId) {
      window.toast.error('Pilih dompet pembayaran!');
      return;
    }
    const amount = parseFloat(payAmount.replace(/\./g, '')) || 0;
    if (amount <= 0) {
      window.toast.error('Nominal tidak valid!');
      return;
    }

    try {
      await payDebt.mutateAsync({
        id: payingDebt.id,
        data: {
          amount,
          wallet_id: payWalletId,
          note: payNote
        }
      });
      setIsPayModalOpen(false);
      window.toast.success('Pembayaran berhasil diproses!');
    } catch (e: any) {
      console.error(e);
      window.toast.error(e?.response?.data?.message || 'Gagal memproses pembayaran');
    }
  };

  const handleDelete = async () => {
    if (!selectedDebtId) return;
    window.appConfirm('Yakin ingin menghapus catatan ini? Ini juga akan menghapus transaksi mutasi awalnya secara permanen.', async () => {
      await deleteDebt.mutateAsync(selectedDebtId);
      setIsModalOpen(false);
    });
  };

  const openCreateModal = () => {
    setEditMode(false);
    setSelectedDebtId('');
    setPersonName('');
    setDebtAmount('');
    setDueDate('');
    setDebtNote('');
    setDebtType('LEND');
    setWalletId(availableWallets.length > 0 ? availableWallets[0].id : '');
    setIsModalOpen(true);
  };

  const openEditModal = (debt: any) => {
    setEditMode(true);
    setSelectedDebtId(debt.id);
    setPersonName(debt.person_name);
    setDebtAmount(debt.amount.toString());
    setDueDate(debt.due_date ? debt.due_date.substring(0, 10) : '');
    setDebtNote(debt.note || '');
    setDebtType(debt.type);
    setIsModalOpen(true);
  };

  const openPayModal = (debt: any) => {
    setPayingDebt(debt);
    setPayAmount(formatNumber(debt.remaining_amount.toString()));
    setPayNote(`Cicilan ${debt.type === 'BORROW' ? 'Utang' : 'Piutang'} ${debt.person_name}`);
    setPayWalletId(availableWallets.length > 0 ? availableWallets[0].id : '');
    setIsPayModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-text-primary mb-1">Hutang Piutang</h2>
          <p className="text-text-secondary font-medium">Pantau hutang dan pinjaman yang otomatis terintegrasi dengan saldo Dompet.</p>
        </div>
        
        {(activeTab === 'ME' || hasFamily) && (
          <button 
            onClick={openCreateModal}
            className="flex-shrink-0 bg-primary text-surface px-6 py-3 border-2 border-text-primary font-black uppercase tracking-wider hover:bg-accent hover:text-text-primary active:translate-y-1 shadow-[4px_4px_0_0_#171B22] active:shadow-[0px_0px_0_0_#171B22] transition-all flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            Catat Baru
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b-2 border-text-primary pb-2">
        <button 
          onClick={() => setActiveTab('ME')}
          className={`font-black uppercase tracking-wider px-2 py-1 transition-colors ${activeTab === 'ME' ? 'text-text-primary border-b-4 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Pribadi
        </button>
        <button 
          onClick={() => setActiveTab('FAMILY')}
          className={`font-black uppercase tracking-wider px-2 py-1 transition-colors ${activeTab === 'FAMILY' ? 'text-text-primary border-b-4 border-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          Keluarga
        </button>
      </div>

      {!hasFamily && activeTab === 'FAMILY' ? (
        <div className="bg-surface border-2 border-text-primary p-12 flex flex-col items-center justify-center text-center shadow-[8px_8px_0_0_#171B22]">
          <div className="w-20 h-20 bg-warning border-4 border-text-primary flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#171B22]">
            <ArrowRightLeft size={40} className="text-text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-text-primary">Belum Punya Keluarga</h3>
          <p className="text-text-secondary font-medium max-w-md">Catatan keluarga hanya tersedia jika Anda telah membuat atau bergabung dengan Household.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts?.map((debt: any) => (
            <div 
              key={debt.id} 
              className={`bg-surface border-2 border-text-primary p-5 shadow-[4px_4px_0_0_#171B22] flex flex-col transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] ${debt.status === 'PAID' ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 flex items-center justify-center border-2 border-text-primary font-black text-xl shadow-[2px_2px_0_0_#171B22] ${debt.type === 'LEND' ? 'bg-success' : 'bg-error text-surface'}`}>
                    <ArrowRightLeft size={24} strokeWidth={2.5} className={debt.type === 'LEND' ? '' : 'text-surface'} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-lg leading-tight">{debt.person_name}</h3>
                    <span className={`text-xs font-black px-2 py-0.5 border border-text-primary uppercase ${debt.type === 'LEND' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                      {debt.type === 'LEND' ? 'Diutangi (Piutang)' : 'Berhutang'}
                    </span>
                  </div>
                </div>
                {debt.status === 'PAID' && (
                  <span className="bg-success text-text-primary border-2 border-text-primary px-2 py-1 text-xs font-black uppercase">LUNAS</span>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-1">Total {debt.type === 'LEND' ? 'Piutang' : 'Hutang'}</p>
                  <p className="font-medium">{formatRupiah(debt.amount)}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-1">Sisa Belum Dibayar</p>
                  <p className={`text-2xl font-black tracking-tight ${debt.type === 'LEND' ? 'text-success' : 'text-error'}`}>
                    {formatRupiah(debt.remaining_amount)}
                  </p>
                </div>
                {debt.due_date && (
                  <div>
                    <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-1">Jatuh Tempo</p>
                    <p className="font-medium text-text-primary">{new Date(debt.due_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t-2 border-text-primary flex gap-2">
                <button 
                  onClick={() => openEditModal(debt)}
                  className="flex-1 bg-surface border-2 border-text-primary py-2 font-black uppercase tracking-wider text-sm hover:bg-accent transition-colors"
                >
                  Edit
                </button>
                {debt.status === 'ACTIVE' && (
                  <button 
                    onClick={() => openPayModal(debt)}
                    className="flex-1 bg-primary text-surface border-2 border-text-primary py-2 font-black uppercase tracking-wider text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                  >
                    <Wallet size={16} strokeWidth={2.5} /> Bayar / Cicil
                  </button>
                )}
              </div>
            </div>
          ))}

          {(!debts || debts.length === 0) && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-text-secondary bg-surface/50">
               <ArrowRightLeft size={48} className="text-text-secondary mb-4 opacity-50" />
               <p className="text-xl font-black text-text-secondary uppercase tracking-wider">Belum Ada Catatan</p>
               <p className="text-sm font-medium text-text-secondary mt-2 max-w-sm">
                 Jika Anda meminjam uang (Hutang), saldo dompet Anda akan bertambah. 
                 Jika Anda meminjamkan uang (Piutang), saldo dompet Anda akan berkurang.
               </p>
             </div>
          )}
        </div>
      )}

      {/* MODAL CATAT BARU / EDIT */}
      <BottomSheet isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? 'Edit Catatan' : 'Catat Hutang/Piutang'}>
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Jenis Transaksi</label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={editMode}
                onClick={() => setDebtType('LEND')}
                className={`flex-1 py-3 border-2 border-text-primary font-black uppercase tracking-wider transition-all ${debtType === 'LEND' ? 'bg-success text-text-primary shadow-[4px_4px_0_0_#171B22]' : 'bg-surface text-text-secondary hover:bg-accent hover:text-text-primary'} ${editMode && 'opacity-50 cursor-not-allowed'}`}
              >
                Piutang (Kita Pinjamkan)
              </button>
              <button
                type="button"
                disabled={editMode}
                onClick={() => setDebtType('BORROW')}
                className={`flex-1 py-3 border-2 border-text-primary font-black uppercase tracking-wider transition-all ${debtType === 'BORROW' ? 'bg-error text-surface shadow-[4px_4px_0_0_#171B22]' : 'bg-surface text-text-secondary hover:bg-accent hover:text-text-primary'} ${editMode && 'opacity-50 cursor-not-allowed'}`}
              >
                Hutang (Kita Pinjam)
              </button>
            </div>
            {!editMode && (
              <p className="text-[10px] font-bold text-text-secondary mt-2">
                {debtType === 'LEND' ? '* Saldo dompet akan BERKURANG (uang dipinjamkan).' : '* Saldo dompet akan BERTAMBAH (terima pinjaman).'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Nama Pihak Kedua</label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Contoh: Budi, Warung Kopi"
              className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-[4px_4px_0_0_#171B22]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Jumlah Pokok (Rp)</label>
            <input
              type="text"
              disabled={editMode}
              value={debtAmount}
              onChange={(e) => setDebtAmount(formatNumber(e.target.value))}
              placeholder="0"
              className={`w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-[4px_4px_0_0_#171B22] ${editMode && 'opacity-50 cursor-not-allowed'}`}
            />
          </div>

          {!editMode && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Pilih Dompet</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[4px_4px_0_0_#171B22]"
              >
                <option value="">-- Pilih Dompet --</option>
                {availableWallets.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Jatuh Tempo (Opsional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-[4px_4px_0_0_#171B22]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Catatan Keterangan</label>
            <input
              type="text"
              value={debtNote}
              onChange={(e) => setDebtNote(e.target.value)}
              placeholder="Tambahkan catatan singkat"
              className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-[4px_4px_0_0_#171B22]"
            />
          </div>

          <div className="pt-4 flex gap-3">
            {editMode && (
              <button
                onClick={handleDelete}
                className="w-12 h-12 flex-shrink-0 bg-surface border-2 border-text-primary flex items-center justify-center text-error hover:bg-error hover:text-surface transition-colors shadow-[4px_4px_0_0_#171B22] active:translate-y-1 active:shadow-[0px_0px_0_0_#171B22]"
              >
                <Trash2 size={20} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 bg-primary text-surface py-3 border-2 border-text-primary font-black uppercase tracking-wider hover:bg-accent hover:text-text-primary active:translate-y-1 shadow-[4px_4px_0_0_#171B22] active:shadow-[0px_0px_0_0_#171B22] transition-all"
            >
              Simpan {editMode ? 'Perubahan' : 'Catatan'}
            </button>
          </div>
        </div>
      </BottomSheet>


      {/* MODAL BAYAR / CICIL */}
      <BottomSheet isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Bayar / Cicil Hutang">
        {payingDebt && (
          <div className="space-y-4">
            <div className="bg-accent/30 p-4 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] mb-6">
              <p className="text-xs font-black uppercase text-text-secondary mb-1">Sisa {payingDebt.type === 'LEND' ? 'Piutang' : 'Hutang'} ({payingDebt.person_name})</p>
              <p className="text-2xl font-black">{formatRupiah(payingDebt.remaining_amount)}</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Nominal Pembayaran (Rp)</label>
              <input
                type="text"
                value={payAmount}
                onChange={(e) => setPayAmount(formatNumber(e.target.value))}
                placeholder="0"
                className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-[4px_4px_0_0_#171B22]"
              />
              <p className="text-[10px] font-bold text-text-secondary mt-1 flex items-center justify-between">
                <span>Tips: Masukkan angka sesuai yang disetor/dicicil.</span>
                <button type="button" className="text-primary hover:underline" onClick={() => setPayAmount(formatNumber(payingDebt.remaining_amount.toString()))}>Lunas Penuh</button>
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">
                Dompet {payingDebt.type === 'LEND' ? 'Penerima Uang (Masuk)' : 'Sumber Uang (Keluar)'}
              </label>
              <select
                value={payWalletId}
                onChange={(e) => setPayWalletId(e.target.value)}
                className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[4px_4px_0_0_#171B22]"
              >
                <option value="">-- Pilih Dompet --</option>
                {availableWallets.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name} ({formatRupiah(w.balance)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Catatan Transaksi</label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="Keterangan bayar cicilan..."
                className="w-full bg-surface border-2 border-text-primary p-3 font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-[4px_4px_0_0_#171B22]"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handlePay}
                className="w-full bg-primary text-surface py-3 border-2 border-text-primary font-black uppercase tracking-wider hover:bg-accent hover:text-text-primary active:translate-y-1 shadow-[4px_4px_0_0_#171B22] active:shadow-[0px_0px_0_0_#171B22] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} strokeWidth={2.5} />
                Proses Pembayaran
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

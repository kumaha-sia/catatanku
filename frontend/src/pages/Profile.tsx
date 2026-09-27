import React, { useState, useRef } from 'react';
import { Camera, Mail, User, Shield, CheckCircle2, Image as ImageIcon, Trash2, KeyRound, Phone, Smartphone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';

import { useAuthStore } from '../store/authStore';
import { useConfirmStore } from '../store/confirmStore';
import { uploadAvatar, updateProfile, generateWaBindToken, checkWaBindStatus, unbindWa } from '../services/apiServices';
import { API_URL } from '../api';

export const Profile = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const loginAuth = useAuthStore(state => state.login);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [isSaved, setIsSaved] = useState(false);

  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [waBindOpen, setWaBindOpen] = useState(false);
  const [waBindToken, setWaBindToken] = useState<string | null>(null);
  const [isWaLoading, setIsWaLoading] = useState(false);
  

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);

  const openWebcam = async () => {
    setIsAvatarOpen(false);
    setIsWebcamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      window.toast.info('Akses kamera tidak diizinkan atau perangkat tidak ditemukan.');
      setIsWebcamOpen(false);
    }
  };

  const closeWebcam = () => {
    setIsWebcamOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      // Crop to a square for avatar
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Center crop the video
        const sx = (videoRef.current.videoWidth - size) / 2;
        const sy = (videoRef.current.videoHeight - size) / 2;
        ctx.drawImage(videoRef.current, sx, sy, size, size, 0, 0, size, size);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('avatar', file);

            try {
              setIsUploading(true);
              closeWebcam();
              const res = await uploadAvatar(formData);
              
              if (user) {
                const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
                const token = localStorage.getItem('catatu_token') || '';
                loginAuth(updatedUser, token);
              }
            } catch (err) {
              console.error(err);
              window.toast.error('Gagal mengunggah foto profil');
            } finally {
              setIsUploading(false);
            }
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  
  // Polling for WA Binding
  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (waBindOpen && waBindToken) {
      interval = setInterval(async () => {
        try {
          const res = await checkWaBindStatus();
          if (res.status === 'success') {
            clearInterval(interval);
            if (user) {
              const updatedUser = { ...user, whatsapp: res.data.whatsapp };
              const token = localStorage.getItem('catatu_token') || '';
              loginAuth(updatedUser, token);
            }
            window.toast.success('WhatsApp berhasil dihubungkan!');
            setWaBindOpen(false);
            setWaBindToken(null);
          }
        } catch (err: any) {
          if (err.response?.status !== 202) {
            clearInterval(interval);
            window.toast.error('Gagal memverifikasi status. Coba buka ulang.');
            setWaBindOpen(false);
            setWaBindToken(null);
          }
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [waBindOpen, waBindToken, user, loginAuth]);

  const handleOpenWaBind = async () => {
    try {
      setIsWaLoading(true);
      const res = await generateWaBindToken();
      setWaBindToken(res.data.token);
      setWaBindOpen(true);
    } catch (err) {
      window.toast.error('Gagal membuat kode tautan');
    } finally {
      setIsWaLoading(false);
    }
  };

  const handleUnbindWa = () => {
    showConfirm('Yakin ingin memutuskan koneksi WhatsApp ini?', async () => {
      try {
        setIsWaLoading(true);
        await unbindWa();
        if (user) {
          const updatedUser = { ...user, whatsapp: '' };
          const token = localStorage.getItem('catatu_token') || '';
          loginAuth(updatedUser, token);
        }
        window.toast.success('WhatsApp berhasil diputuskan');
      } catch (err) {
        window.toast.error('Gagal memutuskan koneksi WhatsApp');
      } finally {
        setIsWaLoading(false);
      }
    });
  };
  
  const handleSave = async () => {
    try {
      const res = await updateProfile({ name, whatsapp });
      if (user) {
        const updatedUser = { ...user, name: res.data.name, whatsapp: res.data.whatsapp };
        const token = localStorage.getItem('catatu_token') || '';
        loginAuth(updatedUser, token);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      window.toast.error(err.response?.data?.message || 'Gagal menyimpan profil');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        setIsUploading(true);
        const res = await uploadAvatar(formData);
        
        // Update user store with new avatarUrl
        if (user) {
          const updatedUser = { ...user, avatarUrl: res.data.avatarUrl };
          const token = localStorage.getItem('catatu_token') || '';
          loginAuth(updatedUser, token);
        }
        setIsAvatarOpen(false);
      } catch (err) {
        console.error(err);
        window.toast.error('Gagal mengunggah foto profil');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const avatarDisplay = user?.avatarUrl 
    ? <img src={`${API_URL.replace('/api/v1', '')}${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
    : <span className="text-surface text-4xl font-black">{name ? name.charAt(0).toUpperCase() : 'U'}</span>;

  return (
    <div className="space-y-6 animate-fade-in pb-8 max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center bg-surface border-2 border-text-primary rounded-none text-text-primary shadow-[4px_4px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-3xl font-black text-text-primary uppercase tracking-wide">Profil & Akun</h1>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center p-6 bg-surface border-4 border-text-primary rounded-none shadow-[8px_8px_0_0_#171B22] mb-6">
        <div 
          onClick={() => setIsAvatarOpen(true)}
          className="relative group cursor-pointer"
        >
          <div className="w-24 h-24 bg-primary rounded-none flex items-center justify-center border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] overflow-hidden">
            {avatarDisplay}
          </div>
          <div className="absolute inset-0 bg-text-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={24} className="text-surface" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-accent flex items-center justify-center border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] text-text-primary">
            <Camera size={14} />
          
      {/* WA Bind Bottom Sheet */}
      <BottomSheet isOpen={waBindOpen} onClose={() => { setWaBindOpen(false); setWaBindToken(null); }} title="Hubungkan WhatsApp">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-accent border-4 border-text-primary mx-auto flex items-center justify-center shadow-[4px_4px_0_0_#171B22]">
            <Smartphone size={32} className="text-text-primary" />
          </div>
          
          <div>
            <h3 className="font-black text-lg text-text-primary mb-2 uppercase">1-Click Verifikasi</h3>
            <p className="text-sm font-bold text-text-secondary">Tidak perlu mengetik nomor atau kode OTP. Cukup klik tombol di bawah ini untuk mengirim pesan rahasia ke Bot FinBareng.</p>
          </div>

          <div className="p-4 bg-surface-muted border-2 border-text-primary border-dashed mb-4">
            <p className="text-xs font-bold text-text-secondary uppercase mb-1">Kode Sesi Anda</p>
            <p className="text-xl font-black text-text-primary tracking-widest">{waBindToken || '...'}</p>
          </div>

          <a 
            href={`https://wa.me/6287811750971?text=${waBindToken}`} 
            target="_blank" 
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-surface font-black uppercase tracking-widest border-4 border-text-primary shadow-[6px_6px_0_0_#171B22] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#171B22] active:translate-y-1 active:shadow-none transition-all"
          >
            Buka WhatsApp Sekarang
          </a>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-text-secondary">
            <Loader2 size={14} className="animate-spin" />
            Menunggu balasan dari WhatsApp Anda...
          </div>
        </div>
      </BottomSheet>
  
    </div>
  </div>

        <p 
          onClick={() => setIsAvatarOpen(true)}
          className="text-sm font-black text-text-primary mt-4 cursor-pointer hover:underline uppercase tracking-wider"
        >
          {isUploading ? 'Mengunggah...' : 'Ganti Foto Profil'}
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-5">
        <div>
          <label className="text-sm font-black text-text-primary uppercase tracking-wider mb-2 block">Nama Lengkap</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary" size={18} />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border-2 border-text-primary rounded-none pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all"
            />
          </div>
        </div>

                <div>
          <label className="text-sm font-black text-text-primary uppercase tracking-wider mb-2 block">Nomor WhatsApp</label>
          <div className="flex items-center justify-between border-2 border-text-primary p-4 bg-surface shadow-[4px_4px_0_0_#171B22]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] ${user?.whatsapp ? 'bg-[#25D366] text-surface' : 'bg-surface-muted text-text-secondary'}`}>
                <Smartphone size={20} />
              </div>
              <div>
                <p className="font-bold text-text-primary">{user?.whatsapp ? `+62 ${user.whatsapp}` : 'Belum Terhubung'}</p>
                <p className="text-xs font-bold text-text-secondary">{user?.whatsapp ? 'Status: Terverifikasi' : 'Bot AI tidak dapat menghubungi'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={user?.whatsapp ? handleUnbindWa : handleOpenWaBind}
              disabled={isWaLoading}
              className={`px-4 py-2 font-black uppercase text-xs border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] active:translate-y-1 active:shadow-none transition-all ${user?.whatsapp ? 'bg-error text-surface hover:bg-red-600' : 'bg-accent text-text-primary hover:bg-[#FFB43A]'}`}
            >
              {isWaLoading ? 'Memproses...' : user?.whatsapp ? 'Putuskan' : 'Hubungkan'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-black text-text-primary uppercase tracking-wider mb-2 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-muted border-2 border-text-primary rounded-none pl-11 pr-4 py-3.5 font-bold text-text-secondary cursor-not-allowed"
              disabled
            />
          </div>
          <p className="text-xs font-bold text-text-primary mt-2">Email tidak dapat diubah karena terhubung dengan fitur keamanan Keluarga.</p>
        </div>
      </div>

      {/* Security Quick Link */}
      <div className="mt-8">
        <button 
          onClick={() => setIsPasswordOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-surface border-4 border-text-primary rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left group shadow-[4px_4px_0_0_#171B22]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-none flex items-center justify-center border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] text-text-primary">
              <Shield size={18} />
            </div>
            <div>
              <p className="font-black text-text-primary uppercase">Ubah Password</p>
              <p className="text-xs font-bold text-text-primary mt-0.5">Terakhir diubah 3 bulan lalu</p>
            </div>
          </div>
          <svg className="text-text-primary transition-transform group-hover:translate-x-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Save Button */}
      <div className="pt-6">
        <button 
          onClick={handleSave}
          className={`w-full py-4 rounded-none font-black text-lg transition-all flex items-center justify-center gap-2 border-4 border-text-primary uppercase tracking-wider hover:-translate-y-1 active:translate-y-0 active:shadow-none ${
            isSaved 
              ? 'bg-income text-text-primary shadow-[4px_4px_0_0_#171B22] hover:shadow-[6px_6px_0_0_#171B22]' 
              : 'bg-primary text-surface shadow-[4px_4px_0_0_#171B22] hover:shadow-[6px_6px_0_0_#171B22]'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 size={24} className="stroke-[3]" />
              Tersimpan
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </button>
      </div>

      {/* Avatar Bottom Sheet */}
      <BottomSheet isOpen={isAvatarOpen} onClose={() => setIsAvatarOpen(false)} title="Foto Profil">
        <div className="space-y-4 pt-4">
          <input 
            type="file" 
            ref={galleryInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button 
            onClick={openWebcam}
            className="w-full flex items-center gap-4 p-4 bg-surface border-2 border-text-primary rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left"
          >
            <div className="w-12 h-12 bg-primary rounded-none flex items-center justify-center border-2 border-text-primary text-text-primary">
              <Camera size={20} className="stroke-[3]" />
            </div>
            <p className="font-black text-text-primary text-base uppercase">Ambil Foto</p>
          </button>
          
          <button 
            onClick={() => galleryInputRef.current?.click()}
            className="w-full flex items-center gap-4 p-4 bg-surface border-2 border-text-primary rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left"
          >
            <div className="w-12 h-12 bg-accent rounded-none flex items-center justify-center border-2 border-text-primary text-text-primary">
              <ImageIcon size={20} className="stroke-[3]" />
            </div>
            <p className="font-black text-text-primary text-base uppercase">Pilih dari Galeri</p>
          </button>

          <button className="w-full flex items-center gap-4 p-4 bg-error text-text-primary border-2 border-text-primary rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#171B22] active:translate-y-0 active:shadow-none transition-all text-left">
            <div className="w-12 h-12 bg-surface rounded-none flex items-center justify-center border-2 border-text-primary text-text-primary">
              <Trash2 size={20} className="stroke-[3]" />
            </div>
            <p className="font-black text-text-primary text-base uppercase">Hapus Foto</p>
          </button>
        </div>
      </BottomSheet>

      {/* Password Bottom Sheet */}
      <BottomSheet isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} title="Ubah Password">
        <div className="space-y-6 pt-4">
          
          <div>
            <label className="text-sm font-black text-text-primary uppercase tracking-wider mb-2 block">Password Saat Ini</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary" size={18} />
              <input 
                type="password" 
                placeholder="Masukkan password lama"
                className="w-full bg-surface border-2 border-text-primary rounded-none pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t-4 border-text-primary">
            <div>
              <label className="text-sm font-black text-text-primary uppercase tracking-wider mb-2 block">Password Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary" size={18} />
                <input 
                  type="password" 
                  placeholder="Minimal 8 karakter"
                  className="w-full bg-surface border-2 border-text-primary rounded-none pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-black text-text-primary uppercase tracking-wider mb-2 block">Konfirmasi Password Baru</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-primary" size={18} />
                <input 
                  type="password" 
                  placeholder="Ketik ulang password baru"
                  className="w-full bg-surface border-2 border-text-primary rounded-none pl-11 pr-4 py-3.5 font-bold text-text-primary focus:outline-none focus:shadow-[4px_4px_0_0_#FFB43A] transition-all"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsPasswordOpen(false)}
            className="w-full py-4 bg-primary text-surface rounded-none border-4 border-text-primary font-black text-lg shadow-[4px_4px_0_0_#171B22] hover:shadow-[6px_6px_0_0_#171B22] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all uppercase tracking-wider mt-4"
          >
            Perbarui Password
          </button>
        </div>
      </BottomSheet>

      {/* Webcam Bottom Sheet */}
      <BottomSheet isOpen={isWebcamOpen} onClose={closeWebcam} title="Ambil Foto">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[300px] h-[300px] bg-black border-4 border-text-primary rounded-none shadow-[8px_8px_0_0_#171B22] overflow-hidden relative mb-6">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>
          <button 
            onClick={capturePhoto}
            className="w-[80px] h-[80px] rounded-full bg-primary border-4 border-text-primary shadow-[4px_4px_0_0_#171B22] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-[60px] h-[60px] rounded-full bg-surface border-4 border-text-primary" />
          </button>
          <p className="mt-4 font-black uppercase text-sm">Jepret</p>
        </div>
      </BottomSheet>

    </div>
  );
};

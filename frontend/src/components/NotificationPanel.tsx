import React from 'react';
import { BottomSheet } from './BottomSheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/apiServices';
import { Bell, Check, X, AlertTriangle, Info, Mail } from 'lucide-react';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 60000, // Poll every minute
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleNotificationClick = (notif: any) => {
    if (!notif.is_read) {
      markAsReadMutation.mutate(notif.id);
    }
    // Navigate logic based on type could go here
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'INVITATION': return <Mail size={20} />;
      case 'ALERT': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Notifikasi">
      <div className="flex flex-col h-full max-h-[70vh]">
        <div className="flex justify-between items-center mb-4">
          <p className="font-black text-sm uppercase tracking-widest">{unreadCount} Belum Dibaca</p>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs font-black uppercase underline hover:text-accent transition-colors"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-10">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surface border-2 border-text-primary"></div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Bell size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-center">Belum Ada Notifikasi</p>
            </div>
          ) : (
            notifications.map((notif: any) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 border-2 border-text-primary flex gap-4 cursor-pointer hover:-translate-y-1 active:translate-y-0 transition-all ${notif.is_read ? 'bg-surface shadow-[4px_4px_0_0_#171B22]' : 'bg-accent shadow-[6px_6px_0_0_#171B22]'}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center border-2 border-text-primary rounded-none shrink-0 ${notif.is_read ? 'bg-background' : 'bg-surface'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-sm uppercase mb-1">{notif.title}</h3>
                  <p className="text-sm font-bold text-text-primary/80 leading-snug">{notif.body}</p>
                  <p className="text-xs font-bold mt-2 opacity-60">
                    {new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="w-3 h-3 bg-error border-2 border-text-primary rounded-none shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </BottomSheet>
  );
};


import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { updateUserProfile } from '@/services/userProfileService';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = async (online: boolean) => {
      setIsOnline(online);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await updateUserProfile(session.user.id, {
          is_online: online,
          last_seen: new Date().toISOString()
        });
      }
    };

    const handleOnline = () => updateOnlineStatus(true);
    const handleOffline = () => updateOnlineStatus(false);
    
    // Mettre à jour le statut au chargement
    updateOnlineStatus(navigator.onLine);

    // Écouter les changements de connexion
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mettre à jour le statut périodiquement quand en ligne
    const interval = setInterval(() => {
      if (navigator.onLine) {
        updateOnlineStatus(true);
      }
    }, 30000); // Toutes les 30 secondes

    // Marquer comme hors ligne quand l'utilisateur quitte
    const handleBeforeUnload = () => updateOnlineStatus(false);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
};

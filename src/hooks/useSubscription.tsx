import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface SubscriptionStatus {
  hasActiveTrial: boolean;
  hasActiveSubscription: boolean;
  trialDaysRemaining: number;
  trialExpired: boolean;
  shouldBlockAccess: boolean;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionStatus {
  checkSubscriptionStatus: () => Promise<void>;
  isFeatureBlocked: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasActiveTrial: false,
    hasActiveSubscription: false,
    trialDaysRemaining: 0,
    trialExpired: false,
    shouldBlockAccess: false,
    loading: true
  });

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setSubscriptionStatus(prev => ({ ...prev, loading: true }));
      
      // Chamar a função do Supabase para verificar status
      const { data, error } = await supabase.rpc('check_subscription_status', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        // Em caso de erro, assumir que não tem acesso bloqueado por segurança
        setSubscriptionStatus({
          hasActiveTrial: false,
          hasActiveSubscription: false,
          trialDaysRemaining: 0,
          trialExpired: false,
          shouldBlockAccess: false,
          loading: false
        });
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setSubscriptionStatus({
          hasActiveTrial: status.has_active_trial,
          hasActiveSubscription: status.has_active_subscription,
          trialDaysRemaining: status.trial_days_remaining,
          trialExpired: status.trial_expired,
          shouldBlockAccess: status.should_block_access,
          loading: false
        });

        // Mostrar notificações baseadas no status
        if (status.trial_expired && !status.has_active_subscription) {
          toast({
            title: "Período gratuito expirado",
            description: "Assine para continuar usando o MEI Finance",
            variant: "destructive"
          });
        } else if (status.has_active_trial && status.trial_days_remaining <= 1) {
          toast({
            title: "Seu teste grátis está acabando!",
            description: `Você tem ${status.trial_days_remaining} dia(s) restante(s)`,
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      
      // Verificar status a cada 5 minutos
      const interval = setInterval(checkSubscriptionStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setSubscriptionStatus({
        hasActiveTrial: false,
        hasActiveSubscription: false,
        trialDaysRemaining: 0,
        trialExpired: false,
        shouldBlockAccess: false,
        loading: false
      });
    }
  }, [user]);

  const isFeatureBlocked = subscriptionStatus.shouldBlockAccess && !subscriptionStatus.loading;

  return (
    <SubscriptionContext.Provider value={{
      ...subscriptionStatus,
      checkSubscriptionStatus,
      isFeatureBlocked
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock, Clock, AlertTriangle } from 'lucide-react';

interface SubscriptionGuardProps {
  children: ReactNode;
  feature?: string;
  showPartialContent?: boolean;
}

const SubscriptionGuard = ({ 
  children, 
  feature = "esta funcionalidade",
  showPartialContent = false 
}: SubscriptionGuardProps) => {
  const { 
    isFeatureBlocked, 
    hasActiveTrial, 
    trialDaysRemaining, 
    hasActiveSubscription,
    loading 
  } = useSubscription();

  const handleUpgrade = () => {
    // Aqui você pode integrar com sua solução de pagamento
    window.open('mailto:meifinancebr@gmail.com?subject=Quero assinar o MEI Finance', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Verificando assinatura...</p>
      </div>
    );
  }

  // Se tem acesso ativo, mostrar conteúdo normalmente
  if (hasActiveSubscription || (hasActiveTrial && !isFeatureBlocked)) {
    return (
      <>
        {/* Mostrar aviso se está no trial */}
        {hasActiveTrial && !hasActiveSubscription && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Teste Gratuito Ativo</strong> - Você ainda tem {trialDaysRemaining} dia(s) restante(s)
            </AlertDescription>
          </Alert>
        )}
        {children}
      </>
    );
  }

  // Se o acesso está bloqueado, mostrar tela de upgrade
  if (isFeatureBlocked) {
    return (
      <div className="space-y-6">
        {showPartialContent && (
          <div className="relative">
            <div className="filter blur-sm pointer-events-none">
              {children}
            </div>
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          </div>
        )}
        
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-mei-red/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-mei-red" />
            </div>
            <CardTitle className="text-xl font-bold text-mei-text">
              Acesso Bloqueado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Seu período gratuito de 3 dias expirou. Para continuar usando {feature}, você precisa assinar o MEI Finance.
            </p>
            
            <div className="bg-mei-gray/20 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-mei-red" />
                <span className="font-semibold text-mei-text">Plano Mensal</span>
              </div>
              <div className="text-2xl font-bold text-mei-red">R$ 29,90/mês</div>
              <p className="text-sm text-gray-600 mt-1">
                Acesso completo a todas as funcionalidades
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleUpgrade}
                className="w-full mei-button"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Assinar Agora
              </Button>
              
              <p className="text-xs text-gray-500">
                Entre em contato: meifinancebr@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está no trial mas próximo do fim
  if (hasActiveTrial && trialDaysRemaining <= 1) {
    return (
      <div className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Seu teste grátis está acabando!</strong> Você tem {trialDaysRemaining} dia(s) restante(s). 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1 text-amber-700 underline"
              onClick={handleUpgrade}
            >
              Assine agora para não perder o acesso.
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Default: mostrar conteúdo
  return <>{children}</>;
};

export default SubscriptionGuard;
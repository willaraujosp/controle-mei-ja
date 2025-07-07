
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Verificar se há uma sessão de recuperação
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.password !== passwords.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (passwords.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao redefinir senha",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso!",
          description: "Senha redefinida com sucesso",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mei-gray to-white flex items-center justify-center px-4 overflow-x-hidden max-w-full">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-lg border-0 bg-white/95 backdrop-blur">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-mei-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-mei-text mb-2">
              Redefinir Senha
            </h2>
            <p className="text-gray-600">
              Digite sua nova senha
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={passwords.password}
                onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                required
                className="mei-input w-full"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua nova senha"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
                className="mei-input w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full mei-button py-6"
              disabled={isLoading}
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

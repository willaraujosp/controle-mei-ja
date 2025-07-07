
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, LogOut, Save } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { user, signOut } = useAuth();
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      
      // Buscar perfil existente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nome_empresa')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
        // Se não existe perfil, criar um
        if (profileError.code === 'PGRST116') {
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user?.id!,
              nome_empresa: ''
            });
          
          if (createError) {
            console.error('Erro ao criar perfil:', createError);
          }
        }
      } else if (profileData) {
        setNomeEmpresa(profileData.nome_empresa || '');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          nome_empresa: nomeEmpresa,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-4 sm:p-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-mei-red/10 rounded-lg">
            <img 
              src="/lovable-uploads/df4ec87a-f5c9-4334-a247-0a1947d73246.png" 
              alt="MEI Finance" 
              className="h-6 w-auto"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-mei-text">Configurações</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Gerencie suas informações e preferências</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Informações da Conta */}
          <Card className="mei-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <User className="h-5 w-5 text-mei-red" />
                <span>Informações da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div>
                <Label htmlFor="nomeEmpresa" className="text-sm">Nome da Empresa/MEI</Label>
                <Input
                  id="nomeEmpresa"
                  type="text"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Digite o nome da sua empresa"
                  className="mei-input text-sm"
                  disabled={loadingProfile}
                />
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isLoading || loadingProfile}
                className="mei-button w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardContent>
          </Card>

          {/* Informações do Plano */}
          <Card className="mei-card">
            <CardHeader>
              <CardTitle className="text-mei-text text-base sm:text-lg">Informações do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800 text-sm sm:text-base">Teste Gratuito Ativo</p>
                  <p className="text-xs sm:text-sm text-green-600">Você ainda tem 2 dias restantes</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                  Ativo
                </span>
              </div>

              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-mei-text mb-2 text-sm sm:text-base">Próximos Passos</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Após o período de teste, você será cobrado R$ 29,90/mês para continuar usando o MEI Finance.
                </p>
                <Button
                  onClick={() => window.open('https://pay.cakto.com.br/3f9sct4_464768', '_blank')}
                  variant="outline"
                  className="border-mei-red text-mei-red hover:bg-mei-red hover:text-white w-full sm:w-auto"
                >
                  Assinar Agora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="mei-card border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 text-base sm:text-lg">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Sair da sua conta do MEI Finance.
              </p>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Fazer Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;

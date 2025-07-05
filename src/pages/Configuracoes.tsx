
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, LogOut, Save } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { user, signOut } = useAuth();
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento das configurações
      setTimeout(() => {
        toast({
          title: "Configurações salvas!",
          description: "Suas informações foram atualizadas com sucesso.",
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-mei-red/10 rounded-lg">
            <Settings className="h-6 w-6 text-mei-red" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-mei-text">Configurações</h1>
            <p className="text-gray-600 mt-1">Gerencie suas informações e preferências</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Informações da Conta */}
          <Card className="mei-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-mei-red" />
                <span>Informações da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div>
                <Label htmlFor="nomeEmpresa">Nome da Empresa/MEI</Label>
                <Input
                  id="nomeEmpresa"
                  type="text"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Digite o nome da sua empresa"
                  className="mei-input"
                />
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="mei-button"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card className="mei-card">
            <CardHeader>
              <CardTitle className="text-mei-text">Informações do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Teste Gratuito Ativo</p>
                  <p className="text-sm text-green-600">Você ainda tem 2 dias restantes</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Ativo
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-mei-text mb-2">Próximos Passos</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Após o período de teste, você será cobrado R$ 29,90/mês para continuar usando o MEI Finance.
                </p>
                <Button
                  onClick={() => window.open('https://pay.cakto.com.br/3f9sct4_464768', '_blank')}
                  variant="outline"
                  className="border-mei-red text-mei-red hover:bg-mei-red hover:text-white"
                >
                  Assinar Agora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="mei-card border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Sair da sua conta do MEI Finance.
              </p>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
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


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  UserCheck, 
  UserX,
  Shield,
  Gift,
  PlusCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import MetricCard from '@/components/MetricCard';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { metrics, liberarUsuario, revogarUsuario, criarCodigoParceria } = useAdmin();
  const [novoCodigo, setNovoCodigo] = useState('');
  const [descricaoCodigo, setDescricaoCodigo] = useState('');
  const [usoMaximo, setUsoMaximo] = useState<number | undefined>();

  const handleCriarCodigo = async () => {
    if (!novoCodigo.trim()) {
      toast({
        title: "Erro",
        description: "Digite um código válido",
        variant: "destructive"
      });
      return;
    }

    await criarCodigoParceria(novoCodigo, descricaoCodigo, usoMaximo);
    setNovoCodigo('');
    setDescricaoCodigo('');
    setUsoMaximo(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return 'bg-green-100 text-green-800';
      case 'teste_gratuito': return 'bg-blue-100 text-blue-800';
      case 'liberado': return 'bg-purple-100 text-purple-800';
      case 'expirado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-[#F42000]/10 rounded-lg">
            <Shield className="h-6 w-6 text-[#F42000]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#2E2E2E]">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">Métricas e gerenciamento da plataforma MEI Finance</p>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Usuários"
            value={metrics.totalUsuarios}
            icon={Users}
            description="Usuários cadastrados"
            color="primary"
          />
          <MetricCard
            title="Usuários Premium"
            value={metrics.usuariosPremium}
            icon={CreditCard}
            description="Planos pagos ativos"
            color="success"
          />
          <MetricCard
            title="Usuários Liberados"
            value={metrics.usuariosLiberados}
            icon={UserCheck}
            description="Acessos gratuitos"
            color="info"
          />
          <MetricCard
            title="Total de Lançamentos"
            value={metrics.totalMovimentacoes}
            icon={TrendingUp}
            description="Movimentações registradas"
            color="warning"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Criar Código de Parceria */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
                <Gift className="h-5 w-5 mr-2 text-[#F42000]" />
                Criar Código de Parceria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Código (ex: PARCEIRO2024)"
                value={novoCodigo}
                onChange={(e) => setNovoCodigo(e.target.value.toUpperCase())}
              />
              <Input
                placeholder="Descrição (opcional)"
                value={descricaoCodigo}
                onChange={(e) => setDescricaoCodigo(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Uso máximo (opcional)"
                value={usoMaximo || ''}
                onChange={(e) => setUsoMaximo(e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Button 
                onClick={handleCriarCodigo}
                className="w-full bg-[#F42000] hover:bg-[#F42000]/90 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Código
              </Button>
            </CardContent>
          </Card>

          {/* Exportações PDF */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#F42000]" />
                Estatísticas de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de PDFs Exportados</span>
                <Badge variant="outline" className="text-[#F42000]">
                  {metrics.totalExportacoesPDF}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Usuários com Parcerias</span>
                <Badge variant="outline" className="text-blue-600">
                  {metrics.usuariosParcerias}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Códigos de Parceria</span>
                <Badge variant="outline" className="text-green-600">
                  {metrics.codigosParcerias.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Códigos de Parceria */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2E2E2E]">
              Códigos de Parceria Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.codigosParcerias.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum código de parceria criado</p>
              ) : (
                metrics.codigosParcerias.map((codigo) => (
                  <div key={codigo.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-[#2E2E2E]">{codigo.codigo}</p>
                      {codigo.descricao && (
                        <p className="text-sm text-gray-500">{codigo.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {codigo.uso_atual || 0}/{codigo.uso_maximo || '∞'}
                      </span>
                      <Badge variant={codigo.ativo ? "default" : "secondary"}>
                        {codigo.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gerenciamento de Usuários */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2E2E2E]">
              Gerenciamento de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.usuariosParaGerenciar.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum usuário para gerenciar</p>
              ) : (
                metrics.usuariosParaGerenciar.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-[#2E2E2E]">Usuário ID: {usuario.user_id}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(usuario.assinaturas?.[0]?.status || 'teste_gratuito')}>
                          {usuario.assinaturas?.[0]?.status || 'teste_gratuito'}
                        </Badge>
                        {usuario.liberado && (
                          <Badge className="bg-purple-100 text-purple-800">
                            Liberado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!usuario.liberado ? (
                        <Button
                          size="sm"
                          onClick={() => liberarUsuario(usuario.user_id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Liberar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revogarUsuario(usuario.user_id)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Revogar
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;

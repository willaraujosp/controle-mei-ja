
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  UserCheck, 
  UserX,
  Shield,
  Gift,
  PlusCircle,
  UserPlus
} from 'lucide-react';
import Layout from '@/components/Layout';
import MetricCard from '@/components/MetricCard';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';

const Admin = () => {
  const { metrics, liberarUsuario, revogarUsuario, criarCodigoParceria, criarUsuarioManualmente } = useAdmin();
  const [novoCodigo, setNovoCodigo] = useState('');
  const [descricaoCodigo, setDescricaoCodigo] = useState('');
  const [usoMaximo, setUsoMaximo] = useState<number | undefined>();
  
  // Estados para criação de usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
    plano: 'teste_gratuito'
  });

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

  const handleCriarUsuario = async () => {
    if (!novoUsuario.nome.trim() || !novoUsuario.email.trim() || !novoUsuario.senha.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    await criarUsuarioManualmente(novoUsuario.nome, novoUsuario.email, novoUsuario.senha, novoUsuario.plano);
    setNovoUsuario({
      nome: '',
      email: '',
      senha: '',
      plano: 'teste_gratuito'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return 'bg-green-100 text-green-800';
      case 'teste_gratuito': return 'bg-blue-100 text-blue-800';
      case 'liberado': return 'bg-purple-100 text-purple-800';
      case 'parceiro': return 'bg-orange-100 text-orange-800';
      case 'expirado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header com Logo */}
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-[#F42000]/10 rounded-lg">
            <img 
              src="/lovable-uploads/df4ec87a-f5c9-4334-a247-0a1947d73246.png" 
              alt="MEI Finance" 
              className="h-8 w-auto"
            />
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
          {/* Criar Usuário Manualmente */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-[#F42000]" />
                Criar Usuário Manualmente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nome completo"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
              />
              <Input
                type="email"
                placeholder="E-mail"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={novoUsuario.senha}
                onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
              />
              <Select value={novoUsuario.plano} onValueChange={(value) => setNovoUsuario({...novoUsuario, plano: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teste_gratuito">Teste Gratuito</SelectItem>
                  <SelectItem value="liberado">Liberado (Gratuito)</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCriarUsuario}
                className="w-full bg-[#F42000] hover:bg-[#F42000]/90 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </CardContent>
          </Card>

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
        </div>

        {/* Estatísticas de Uso */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#F42000]" />
              Estatísticas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <span className="text-gray-600">Total de PDFs Exportados</span>
              <Badge variant="outline" className="text-[#F42000]">
                {metrics.totalExportacoesPDF}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <span className="text-gray-600">Usuários com Parcerias</span>
              <Badge variant="outline" className="text-blue-600">
                {metrics.usuariosParcerias}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <span className="text-gray-600">Códigos de Parceria</span>
              <Badge variant="outline" className="text-green-600">
                {metrics.codigosParcerias.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

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

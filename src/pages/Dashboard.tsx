
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, FileText, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { useMemo } from 'react';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useSubscription } from '@/hooks/useSubscription';

const Dashboard = () => {
  const navigate = useNavigate();
  const { movimentacoes, loading } = useMovimentacoes();
  const { hasActiveTrial, trialDaysRemaining, hasActiveSubscription } = useSubscription();

  const dashboardData = useMemo(() => {
    if (!movimentacoes.length) {
      return {
        monthlyData: [],
        categoryData: [],
        recentTransactions: [],
        totalEntradas: 0,
        totalSaidas: 0,
        saldoTotal: 0
      };
    }

    // Calcular totais
    const totalEntradas = movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    const totalSaidas = movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    const saldoTotal = totalEntradas - totalSaidas;

    // Dados mensais (últimos 6 meses)
    const monthlyData = [];
    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const entradas = movimentacoes
        .filter(m => m.tipo === 'entrada' && m.data.startsWith(monthKey))
        .reduce((acc, curr) => acc + Number(curr.valor), 0);
      
      const saidas = movimentacoes
        .filter(m => m.tipo === 'saida' && m.data.startsWith(monthKey))
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

      monthlyData.push({
        month: months[date.getMonth()],
        entradas,
        saidas
      });
    }

    // Dados por categoria (apenas entradas)
    const categoriaMap = new Map<string, number>();
    movimentacoes
      .filter(m => m.tipo === 'entrada')
      .forEach(m => {
        const current = categoriaMap.get(m.categoria) || 0;
        categoriaMap.set(m.categoria, current + Number(m.valor));
      });

    const colors = ['#F42000', '#FF6B35', '#FF9F66', '#FFD1C7'];
    const categoryData = Array.from(categoriaMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .slice(0, 4);

    // Transações recentes (últimas 5)
    const recentTransactions = movimentacoes
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        description: m.descricao || `${m.categoria} - ${m.tipo}`,
        type: m.tipo,
        amount: Number(m.valor),
        date: m.data,
        status: m.status === 'pago' || m.status === 'recebido' ? 
          (m.status === 'pago' ? 'Pago' : 'Recebido') : 'Pendente'
      }));

    return {
      monthlyData,
      categoryData,
      recentTransactions,
      totalEntradas,
      totalSaidas,
      saldoTotal
    };
  }, [movimentacoes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SubscriptionGuard feature="o dashboard completo">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-mei-text">Dashboard</h1>
              <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
            </div>
            <Button 
              onClick={() => navigate('/lancamentos')}
              className="mei-button dashboard-button mt-4 sm:mt-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="mei-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-mei-red" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${dashboardData.saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboardData.saldoTotal)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData.saldoTotal >= 0 ? '+' : ''}{dashboardData.totalEntradas > 0 ? ((dashboardData.saldoTotal / dashboardData.totalEntradas) * 100).toFixed(1) : '0'}% este mês
                </p>
              </CardContent>
            </Card>

            <Card className="mei-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Entradas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.totalEntradas)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total de entradas
                </p>
              </CardContent>
            </Card>

            <Card className="mei-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Saídas
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(dashboardData.totalSaidas)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total de saídas
                </p>
              </CardContent>
            </Card>

            <Card className="mei-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Lançamentos
                </CardTitle>
                <FileText className="h-4 w-4 text-mei-red" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mei-text">
                  {movimentacoes.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total de registros
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras - Movimentações mensais */}
            <Card className="mei-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-mei-text">
                  Movimentações Mensais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value as number), name === 'entradas' ? 'Entradas' : 'Saídas']}
                    />
                    <Bar dataKey="entradas" fill="#10b981" name="entradas" />
                    <Bar dataKey="saidas" fill="#ef4444" name="saidas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de pizza - Categorias */}
            <Card className="mei-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-mei-text">
                  Entradas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-4">
                  {dashboardData.categoryData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Últimos lançamentos */}
          <Card className="mei-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-mei-text">
                Últimos Lançamentos
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/lancamentos')}
                className="dashboard-button"
              >
                <span className="hidden sm:inline">Ver todos</span>
                <span className="sm:hidden">Ver</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentTransactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma movimentação encontrada</p>
                ) : (
                  dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'entrada' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-mei-text">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'Recebido' || transaction.status === 'Pago' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SubscriptionGuard>
    </Layout>
  );
};

export default Dashboard;

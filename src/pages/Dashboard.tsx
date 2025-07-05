
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, FileText, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

// Dados simulados
const monthlyData = [
  { month: 'Jan', entradas: 4500, saidas: 3200 },
  { month: 'Fev', entradas: 5200, saidas: 3800 },
  { month: 'Mar', entradas: 4800, saidas: 3500 },
  { month: 'Abr', entradas: 6100, saidas: 4200 },
  { month: 'Mai', entradas: 5500, saidas: 3900 },
  { month: 'Jun', entradas: 7200, saidas: 4800 }
];

const categoryData = [
  { name: 'Vendas', value: 7200, color: '#F42000' },
  { name: 'Serviços', value: 3400, color: '#FF6B35' },
  { name: 'Produtos', value: 2800, color: '#FF9F66' },
  { name: 'Outros', value: 1200, color: '#FFD1C7' }
];

const recentTransactions = [
  { id: 1, description: 'Venda Produto A', type: 'entrada', amount: 450.00, date: '2024-07-05', status: 'Recebido' },
  { id: 2, description: 'Fornecedor XYZ', type: 'saida', amount: 280.00, date: '2024-07-04', status: 'Pago' },
  { id: 3, description: 'Serviço Cliente B', type: 'entrada', amount: 750.00, date: '2024-07-03', status: 'Pendente' },
  { id: 4, description: 'Conta de Luz', type: 'saida', amount: 156.00, date: '2024-07-02', status: 'Pago' },
  { id: 5, description: 'Venda Produto C', type: 'entrada', amount: 320.00, date: '2024-07-01', status: 'Recebido' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Calcular saldo total
  const totalEntradas = monthlyData.reduce((acc, curr) => acc + curr.entradas, 0);
  const totalSaidas = monthlyData.reduce((acc, curr) => acc + curr.saidas, 0);
  const saldoTotal = totalEntradas - totalSaidas;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-mei-text">Dashboard</h1>
            <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
          </div>
          <Button 
            onClick={() => navigate('/lancamentos')}
            className="mei-button mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
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
              <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoTotal)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {saldoTotal >= 0 ? '+' : ''}{((saldoTotal / totalEntradas) * 100).toFixed(1)}% este mês
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
                {formatCurrency(totalEntradas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +12.5% vs mês anterior
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
                {formatCurrency(totalSaidas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +5.2% vs mês anterior
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
                {recentTransactions.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Este mês
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
                <BarChart data={monthlyData}>
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
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4">
                {categoryData.map((item, index) => (
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
            >
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

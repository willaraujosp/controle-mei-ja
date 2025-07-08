
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useMovimentacoes, type Movimentacao } from '@/hooks/useMovimentacoes';

const Lancamentos = () => {
  const { movimentacoes, loading, addMovimentacao, updateMovimentacao, deleteMovimentacao } = useMovimentacoes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Movimentacao | null>(null);
  const [formData, setFormData] = useState({
    tipo: '' as 'entrada' | 'saida' | '',
    valor: '',
    categoria: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    status: 'pendente' as 'pago' | 'pendente' | 'recebido'
  });

  const categorias = {
    entrada: ['Vendas', 'Serviços', 'Produtos', 'Outros'],
    saida: ['Fornecedores', 'Operacional', 'Marketing', 'Impostos', 'Outros']
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      valor: '',
      categoria: '',
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      status: 'pendente'
    });
    setEditingLancamento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.valor || !formData.categoria) {
      return;
    }

    const lancamentoData = {
      tipo: formData.tipo as 'entrada' | 'saida',
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      descricao: formData.descricao,
      status: formData.status,
      data: formData.data
    };

    let success = false;
    
    if (editingLancamento) {
      success = await updateMovimentacao(editingLancamento.id, lancamentoData);
    } else {
      const result = await addMovimentacao(lancamentoData);
      success = result !== null;
    }
    
    if (success) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (lancamento: Movimentacao) => {
    setEditingLancamento(lancamento);
    setFormData({
      tipo: lancamento.tipo,
      valor: lancamento.valor.toString(),
      categoria: lancamento.categoria,
      descricao: lancamento.descricao || '',
      data: lancamento.data,
      status: lancamento.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteMovimentacao(id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Calcular totais
  const totalEntradas = movimentacoes.filter(l => l.tipo === 'entrada').reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalSaidas = movimentacoes.filter(l => l.tipo === 'saida').reduce((acc, curr) => acc + Number(curr.valor), 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando lançamentos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-mei-text">Lançamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie suas entradas e saídas</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mei-button mt-4 sm:mt-0" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={formData.tipo} onValueChange={(value: 'entrada' | 'saida') => setFormData({...formData, tipo: value, categoria: ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.valor}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.tipo && categorias[formData.tipo]?.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva o lançamento..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'pago' | 'pendente' | 'recebido') => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="recebido">Recebido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full mei-button">
                  {editingLancamento ? 'Atualizar' : 'Adicionar'} Lançamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="mei-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="mei-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="mei-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-2xl font-bold ${totalEntradas - totalSaidas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalEntradas - totalSaidas)}
                  </p>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  totalEntradas - totalSaidas >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {totalEntradas - totalSaidas >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de lançamentos */}
        <Card className="mei-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mei-text">
              Todos os Lançamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movimentacoes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum lançamento encontrado. Clique em "Novo Lançamento" para começar.
                </p>
              ) : (
                movimentacoes.map((lancamento) => (
                  <div key={lancamento.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        lancamento.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {lancamento.tipo === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-mei-text text-sm sm:text-base truncate">{lancamento.descricao || `${lancamento.categoria} - ${lancamento.tipo}`}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs sm:text-sm text-gray-500">{formatDate(lancamento.data)}</p>
                          <Badge variant="outline" className="text-xs">
                            {lancamento.categoria}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <p className={`font-bold text-sm sm:text-base ${
                          lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lancamento.tipo === 'entrada' ? '+' : '-'}{formatCurrency(Number(lancamento.valor))}
                        </p>
                        <Badge
                          variant={lancamento.status === 'recebido' || lancamento.status === 'pago' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            lancamento.status === 'recebido' || lancamento.status === 'pago' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {lancamento.status === 'pago' ? 'Pago' : lancamento.status === 'recebido' ? 'Recebido' : 'Pendente'}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(lancamento)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lancamento.id)}
                          className="text-red-600 hover:text-red-800 h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
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

export default Lancamentos;

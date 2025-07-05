
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const Lancamentos = () => {
  const [lancamentos, setLancamentos] = useState([
    { id: 1, tipo: 'entrada', valor: 1500.00, categoria: 'Vendas', descricao: 'Venda de produto A', data: '2024-07-05', status: 'Recebido' },
    { id: 2, tipo: 'saida', valor: 300.00, categoria: 'Fornecedores', descricao: 'Compra de matéria prima', data: '2024-07-04', status: 'Pago' },
    { id: 3, tipo: 'entrada', valor: 800.00, categoria: 'Serviços', descricao: 'Consultoria técnica', data: '2024-07-03', status: 'Pendente' },
    { id: 4, tipo: 'saida', valor: 150.00, categoria: 'Operacional', descricao: 'Conta de energia', data: '2024-07-02', status: 'Pago' },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState(null);
  const [formData, setFormData] = useState({
    tipo: '',
    valor: '',
    categoria: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    status: 'Pendente'
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
      status: 'Pendente'
    });
    setEditingLancamento(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLancamento) {
      // Editar
      setLancamentos(prev => prev.map(item => 
        item.id === editingLancamento.id 
          ? { ...item, ...formData, valor: parseFloat(formData.valor) }
          : item
      ));
      toast({
        title: "Lançamento atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      // Adicionar novo
      const novoLancamento = {
        id: Date.now(),
        ...formData,
        valor: parseFloat(formData.valor)
      };
      setLancamentos(prev => [novoLancamento, ...prev]);
      toast({
        title: "Lançamento adicionado!",
        description: "O novo lançamento foi criado com sucesso.",
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (lancamento: any) => {
    setEditingLancamento(lancamento);
    setFormData({
      tipo: lancamento.tipo,
      valor: lancamento.valor.toString(),
      categoria: lancamento.categoria,
      descricao: lancamento.descricao,
      data: lancamento.data,
      status: lancamento.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setLancamentos(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Lançamento excluído!",
      description: "O lançamento foi removido com sucesso.",
    });
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
  const totalEntradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const totalSaidas = lancamentos.filter(l => l.tipo === 'saida').reduce((acc, curr) => acc + curr.valor, 0);

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
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value, categoria: ''})}>
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
                      {formData.tipo && categorias[formData.tipo as keyof typeof categorias]?.map((cat) => (
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
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Recebido">Recebido</SelectItem>
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
              {lancamentos.map((lancamento) => (
                <div key={lancamento.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      lancamento.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {lancamento.tipo === 'entrada' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-mei-text">{lancamento.descricao}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500">{formatDate(lancamento.data)}</p>
                        <Badge variant="outline" className="text-xs">
                          {lancamento.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-bold ${
                        lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {lancamento.tipo === 'entrada' ? '+' : '-'}{formatCurrency(lancamento.valor)}
                      </p>
                      <Badge
                        variant={lancamento.status === 'Recebido' || lancamento.status === 'Pago' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          lancamento.status === 'Recebido' || lancamento.status === 'Pago' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {lancamento.status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lancamento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lancamento.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

export default Lancamentos;

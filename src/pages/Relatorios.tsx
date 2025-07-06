
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const Relatorios = () => {
  const { movimentacoes, loading } = useMovimentacoes();
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    categoria: '',
    tipo: ''
  });

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter(mov => {
      const dataMovimentacao = new Date(mov.data);
      const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
      const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;

      if (dataInicio && dataMovimentacao < dataInicio) return false;
      if (dataFim && dataMovimentacao > dataFim) return false;
      if (filtros.categoria && mov.categoria !== filtros.categoria) return false;
      if (filtros.tipo && mov.tipo !== filtros.tipo) return false;

      return true;
    });
  }, [movimentacoes, filtros]);

  const resumo = useMemo(() => {
    const entradas = movimentacoesFiltradas
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    const saidas = movimentacoesFiltradas
      .filter(m => m.tipo === 'saida')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    const saldo = entradas - saidas;

    return { entradas, saidas, saldo };
  }, [movimentacoesFiltradas]);

  const categorias = useMemo(() => {
    const cats = new Set(movimentacoes.map(m => m.categoria));
    return Array.from(cats);
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

  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Configurar cores
      const corPrincipal = [244, 32, 0] as const; // #F42000
      const corTexto = [46, 46, 46] as const; // #2E2E2E
      
      // Header
      doc.setFillColor(corPrincipal[0], corPrincipal[1], corPrincipal[2]);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('MEI Finance - Relatório Financeiro', 20, 20);
      
      // Data do relatório
      doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
      
      // Período
      let yPos = 50;
      if (filtros.dataInicio || filtros.dataFim) {
        doc.setFontSize(12);
        doc.text('Período:', 20, yPos);
        const periodo = `${filtros.dataInicio ? new Date(filtros.dataInicio).toLocaleDateString('pt-BR') : 'Início'} até ${filtros.dataFim ? new Date(filtros.dataFim).toLocaleDateString('pt-BR') : 'Hoje'}`;
        doc.text(periodo, 50, yPos);
        yPos += 10;
      }
      
      // Resumo
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Resumo Financeiro:', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 150, 0);
      doc.text(`Total de Entradas: ${formatCurrency(resumo.entradas)}`, 20, yPos);
      yPos += 8;
      
      doc.setTextColor(200, 0, 0);
      doc.text(`Total de Saídas: ${formatCurrency(resumo.saidas)}`, 20, yPos);
      yPos += 8;
      
      doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
      doc.text(`Saldo Final: ${formatCurrency(resumo.saldo)}`, 20, yPos);
      yPos += 15;
      
      // Lista de movimentações
      if (movimentacoesFiltradas.length > 0) {
        doc.setFontSize(14);
        doc.text('Movimentações:', 20, yPos);
        yPos += 10;
        
        // Cabeçalho da tabela
        doc.setFontSize(9);
        doc.text('Data', 20, yPos);
        doc.text('Tipo', 50, yPos);
        doc.text('Categoria', 80, yPos);
        doc.text('Descrição', 120, yPos);
        doc.text('Valor', 170, yPos);
        yPos += 5;
        
        // Linha separadora
        doc.line(20, yPos, 190, yPos);
        yPos += 5;
        
        // Movimentações
        movimentacoesFiltradas.slice(0, 25).forEach(mov => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(formatDate(mov.data), 20, yPos);
          doc.text(mov.tipo === 'entrada' ? 'Entrada' : 'Saída', 50, yPos);
          doc.text(mov.categoria.substring(0, 15), 80, yPos);
          doc.text((mov.descricao || '').substring(0, 25), 120, yPos);
          
          if (mov.tipo === 'entrada') {
            doc.setTextColor(0, 150, 0);
          } else {
            doc.setTextColor(200, 0, 0);
          }
          doc.text(formatCurrency(Number(mov.valor)), 170, yPos);
          doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
          
          yPos += 6;
        });
        
        if (movimentacoesFiltradas.length > 25) {
          yPos += 5;
          doc.text(`... e mais ${movimentacoesFiltradas.length - 25} movimentações`, 20, yPos);
        }
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages ? doc.getNumberOfPages() : 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${pageCount} - MEI Finance`, 20, 290);
      }
      
      // Salvar
      const nomeArquivo = `relatorio-mei-finance-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);
      
      toast({
        title: "PDF Exportado!",
        description: "Relatório salvo com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-mei-red/10 rounded-lg">
              <FileText className="h-6 w-6 text-mei-red" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-mei-text">Relatórios</h1>
              <p className="text-gray-600 mt-1">Analise suas movimentações financeiras</p>
            </div>
          </div>
          <Button 
            onClick={exportarPDF}
            className="mei-button mt-4 sm:mt-0"
            disabled={movimentacoesFiltradas.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mei-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-mei-red" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  className="mei-input"
                />
              </div>
              <div>
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  className="mei-input"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={filtros.categoria} onValueChange={(value) => setFiltros({...filtros, categoria: value})}>
                  <SelectTrigger className="mei-input">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={filtros.tipo} onValueChange={(value) => setFiltros({...filtros, tipo: value})}>
                  <SelectTrigger className="mei-input">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="entrada">Entradas</SelectItem>
                    <SelectItem value="saida">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="mei-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Entradas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(resumo.entradas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {movimentacoesFiltradas.filter(m => m.tipo === 'entrada').length} movimentações
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
                {formatCurrency(resumo.saidas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {movimentacoesFiltradas.filter(m => m.tipo === 'saida').length} movimentações
              </p>
            </CardContent>
          </Card>

          <Card className="mei-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Saldo Final
              </CardTitle>
              <DollarSign className="h-4 w-4 text-mei-red" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(resumo.saldo)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {movimentacoesFiltradas.length} movimentações no total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista detalhada */}
        <Card className="mei-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mei-text">
              Movimentações Detalhadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movimentacoesFiltradas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma movimentação encontrada com os filtros aplicados
                </p>
              ) : (
                movimentacoesFiltradas.map((movimentacao) => (
                  <div key={movimentacao.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        movimentacao.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movimentacao.tipo === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-mei-text">
                          {movimentacao.descricao || movimentacao.categoria}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatDate(movimentacao.data)}</span>
                          <span>•</span>
                          <span>{movimentacao.categoria}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            movimentacao.status === 'pago' || movimentacao.status === 'recebido'
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {movimentacao.status === 'pago' ? 'Pago' : 
                             movimentacao.status === 'recebido' ? 'Recebido' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimentacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(Number(movimentacao.valor))}
                      </p>
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

export default Relatorios;

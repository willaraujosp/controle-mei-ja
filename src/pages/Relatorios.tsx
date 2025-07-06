
import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const { movimentacoes, loading } = useMovimentacoes();
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');
  const relatorioRef = useRef<HTMLDivElement>(null);

  const periodos = {
    semanal: 'Esta Semana',
    mensal: 'Este Mês', 
    anual: 'Este Ano'
  };

  const getDataLimites = (periodo: string) => {
    const hoje = new Date();
    
    switch (periodo) {
      case 'semanal':
        return {
          inicio: startOfWeek(hoje, { locale: ptBR }),
          fim: endOfWeek(hoje, { locale: ptBR })
        };
      case 'mensal':
        return {
          inicio: startOfMonth(hoje),
          fim: endOfMonth(hoje)
        };
      case 'anual':
        return {
          inicio: startOfYear(hoje),
          fim: endOfYear(hoje)
        };
      default:
        return {
          inicio: startOfMonth(hoje),
          fim: endOfMonth(hoje)
        };
    }
  };

  const movimentacoesFiltradas = useMemo(() => {
    const { inicio, fim } = getDataLimites(periodoSelecionado);
    
    return movimentacoes.filter(mov => {
      const dataMovimentacao = new Date(mov.data);
      return dataMovimentacao >= inicio && dataMovimentacao <= fim;
    });
  }, [movimentacoes, periodoSelecionado]);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const exportarPDF = async () => {
    if (!relatorioRef.current) return;

    try {
      toast({
        title: "Gerando PDF...",
        description: "Aguarde enquanto preparamos seu relatório.",
      });

      const canvas = await html2canvas(relatorioRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const nomeArquivo = `relatorio-mei-finance-${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      pdf.save(nomeArquivo);

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
      <div className="space-y-6 max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-[#F42000]/10 rounded-lg">
              <FileText className="h-6 w-6 text-[#F42000]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2E2E2E]">Relatórios Financeiros</h1>
              <p className="text-gray-600 mt-1">Analise suas movimentações por período</p>
            </div>
          </div>
          <Button 
            onClick={exportarPDF}
            className="bg-[#F42000] hover:bg-[#F42000]/90 text-white"
            disabled={movimentacoesFiltradas.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Filtro de Período */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2E2E2E]">
              Filtrar por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-full max-w-xs border border-gray-300 rounded-lg">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periodos).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Área do Relatório para PDF */}
        <div ref={relatorioRef} className="bg-white p-6 space-y-6">
          {/* Header do Relatório */}
          <div className="text-center pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#F42000]">MEI Finance</h2>
            <p className="text-[#2E2E2E] font-medium">Relatório Financeiro - {periodos[periodoSelecionado as keyof typeof periodos]}</p>
            <p className="text-sm text-gray-600">Gerado em {format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Entradas
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

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Saídas
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

            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo do Período
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[#F42000]" />
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

          {/* Lista de Movimentações */}
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#2E2E2E]">
                Movimentações do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movimentacoesFiltradas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma movimentação encontrada no período selecionado</p>
                  </div>
                ) : (
                  movimentacoesFiltradas
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((movimentacao) => (
                      <div key={movimentacao.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-[#F5F5F5]/30">
                        <div className="flex items-center space-x-3">
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
                            <p className="font-medium text-[#2E2E2E]">
                              {movimentacao.descricao || movimentacao.categoria}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{formatDate(movimentacao.data)}</span>
                              <span>•</span>
                              <span>{movimentacao.categoria}</span>
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
      </div>
    </Layout>
  );
};

export default Relatorios;

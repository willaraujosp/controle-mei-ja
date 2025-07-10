
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface Movimentacao {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  status: string;
}

const Relatorios = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState('mensal');
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  const [totais, setTotais] = useState({
    entradas: 0,
    saidas: 0,
    saldo: 0
  });

  useEffect(() => {
    if (user) {
      fetchMovimentacoes();
    }
  }, [periodo, user]);

  const getPeriodoData = () => {
    const hoje = new Date();
    let dataInicio: Date;
    let dataFim: Date;

    switch (periodo) {
      case 'semanal':
        dataInicio = startOfWeek(hoje, { locale: ptBR });
        dataFim = endOfWeek(hoje, { locale: ptBR });
        break;
      case 'mensal':
        dataInicio = startOfMonth(hoje);
        dataFim = endOfMonth(hoje);
        break;
      case 'anual':
        dataInicio = startOfYear(hoje);
        dataFim = endOfYear(hoje);
        break;
      default:
        dataInicio = startOfMonth(hoje);
        dataFim = endOfMonth(hoje);
    }

    return { dataInicio, dataFim };
  };

  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      const { dataInicio, dataFim } = getPeriodoData();

      // Garantir que o user_id seja usado corretamente
      const userId = user?.id;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('user_id', userId)
        .gte('data', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data', format(dataFim, 'yyyy-MM-dd'))
        .order('data', { ascending: false });

      if (error) throw error;

      // Converter os dados para o tipo correto
      const movimentacoesFormatadas: Movimentacao[] = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'entrada' | 'saida'
      }));

      setMovimentacoes(movimentacoesFormatadas);
      calcularTotais(movimentacoesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar movimentações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = (movs: Movimentacao[]) => {
    const entradas = movs
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, m) => acc + m.valor, 0);

    const saidas = movs
      .filter(m => m.tipo === 'saida')
      .reduce((acc, m) => acc + m.valor, 0);

    setTotais({
      entradas,
      saidas,
      saldo: entradas - saidas
    });
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getPeriodoTexto = () => {
    const { dataInicio, dataFim } = getPeriodoData();
    
    switch (periodo) {
      case 'semanal':
        return `Semana de ${format(dataInicio, 'dd/MM/yyyy')} a ${format(dataFim, 'dd/MM/yyyy')}`;
      case 'mensal':
        return format(dataInicio, 'MMMM yyyy', { locale: ptBR });
      case 'anual':
        return format(dataInicio, 'yyyy');
      default:
        return '';
    }
  };

  const exportarPDF = async () => {
    try {
      setExportando(true);

      // Registrar exportação
      await supabase
        .from('exportacoes_pdf')
        .insert({
          user_id: user?.id,
          tipo_relatorio: `relatorio_${periodo}`
        });

      // Criar PDF com melhor formatação
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Adicionar logo
      pdf.addImage('/lovable-uploads/df4ec87a-f5c9-4334-a247-0a1947d73246.png', 'PNG', 20, 10, 40, 15);
      
      // Título
      pdf.setFontSize(20);
      pdf.setTextColor(46, 46, 46);
      pdf.text('Relatório Financeiro', 20, 35);
      
      // Período
      pdf.setFontSize(12);
      pdf.setTextColor(102, 102, 102);
      pdf.text(getPeriodoTexto(), 20, 45);
      
      // Resumo financeiro
      pdf.setFontSize(14);
      pdf.setTextColor(46, 46, 46);
      pdf.text('Resumo do Período:', 20, 60);
      
      pdf.setFontSize(12);
      pdf.setTextColor(22, 163, 74); // Verde
      pdf.text(`Entradas: ${formatarMoeda(totais.entradas)}`, 20, 70);
      
      pdf.setTextColor(220, 38, 38); // Vermelho
      pdf.text(`Saídas: ${formatarMoeda(totais.saidas)}`, 20, 80);
      
      pdf.setTextColor(totais.saldo >= 0 ? 22 : 220, totais.saldo >= 0 ? 163 : 38, totais.saldo >= 0 ? 74 : 38);
      pdf.text(`Saldo: ${formatarMoeda(totais.saldo)}`, 20, 90);
      
      // Tabela de movimentações
      let yPosition = 105;
      pdf.setFontSize(14);
      pdf.setTextColor(46, 46, 46);
      pdf.text('Lançamentos:', 20, yPosition);
      
      yPosition += 10;
      
      // Cabeçalho da tabela
      pdf.setFontSize(10);
      pdf.setTextColor(46, 46, 46);
      pdf.text('Data', 20, yPosition);
      pdf.text('Tipo', 50, yPosition);
      pdf.text('Categoria', 80, yPosition);
      pdf.text('Descrição', 120, yPosition);
      pdf.text('Valor', 170, yPosition);
      
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;
      
      // Dados da tabela
      movimentacoes.forEach((mov, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setTextColor(46, 46, 46);
        pdf.text(formatarData(mov.data), 20, yPosition);
        
        pdf.setTextColor(mov.tipo === 'entrada' ? 22 : 220, mov.tipo === 'entrada' ? 163 : 38, mov.tipo === 'entrada' ? 74 : 38);
        pdf.text(mov.tipo === 'entrada' ? 'Entrada' : 'Saída', 50, yPosition);
        
        pdf.setTextColor(46, 46, 46);
        pdf.text(mov.categoria.substring(0, 15), 80, yPosition);
        pdf.text((mov.descricao || '-').substring(0, 20), 120, yPosition);
        
        pdf.setTextColor(mov.tipo === 'entrada' ? 22 : 220, mov.tipo === 'entrada' ? 163 : 38, mov.tipo === 'entrada' ? 74 : 38);
        pdf.text(formatarMoeda(mov.valor), 170, yPosition);
        
        yPosition += 8;
      });
      
      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(102, 102, 102);
      pdf.text(`Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, pageHeight - 20);
      pdf.text('MEI Finance - Gestão Financeira para Microempreendedores', 20, pageHeight - 15);

      pdf.save(`relatorio-${periodo}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);

      toast({
        title: "PDF exportado!",
        description: "Seu relatório foi baixado com sucesso"
      });

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <Layout>
      <SubscriptionGuard feature="os relatórios financeiros">
        <div className="space-y-6 max-w-full overflow-hidden px-4 sm:px-6">
        {/* Header com Logo */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-[#F42000]/10 rounded-lg">
              <img 
                src="/lovable-uploads/df4ec87a-f5c9-4334-a247-0a1947d73246.png" 
                alt="MEI Finance" 
                className="h-8 w-auto"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2E2E2E]">Relatórios Financeiros</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Análise detalhada das suas movimentações</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-full sm:w-[140px] text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={exportarPDF}
              disabled={exportando || movimentacoes.length === 0}
              className="bg-[#F42000] hover:bg-[#F42000]/90 text-white w-full sm:w-auto px-3 py-2 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{exportando ? 'Exportando...' : 'Exportar PDF'}</span>
              <span className="sm:hidden">{exportando ? 'Export...' : 'PDF'}</span>
            </Button>
          </div>
        </div>

        {/* Cards de Totais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Entradas
              </CardTitle>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {formatarMoeda(totais.entradas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getPeriodoTexto()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Total de Saídas
              </CardTitle>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {formatarMoeda(totais.saidas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getPeriodoTexto()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                Saldo do Período
              </CardTitle>
              <div className={`p-2 rounded-full ${totais.saldo >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(totais.saldo)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getPeriodoTexto()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Movimentações */}
        <Card className="bg-white border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold text-[#2E2E2E] flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#F42000]" />
              Lançamentos do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando movimentações...</p>
              </div>
            ) : movimentacoes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma movimentação encontrada para este período.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Data</TableHead>
                      <TableHead className="text-xs sm:text-sm">Tipo</TableHead>
                      <TableHead className="text-xs sm:text-sm">Categoria</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Descrição</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((movimentacao) => (
                      <TableRow key={movimentacao.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {formatarData(movimentacao.data)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movimentacao.tipo === 'entrada' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">{movimentacao.categoria}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{movimentacao.descricao || '-'}</TableCell>
                        <TableCell className={`text-right font-medium text-xs sm:text-sm ${
                          movimentacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatarMoeda(movimentacao.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </SubscriptionGuard>
    </Layout>
  );
};

export default Relatorios;

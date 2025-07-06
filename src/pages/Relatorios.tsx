
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

      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .eq('user_id', user?.id)
        .gte('data', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data', format(dataFim, 'yyyy-MM-dd'))
        .order('data', { ascending: false });

      if (error) throw error;

      setMovimentacoes(data || []);
      calcularTotais(data || []);
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

      // Criar elemento temporário para o PDF
      const elementoTemp = document.createElement('div');
      elementoTemp.style.position = 'absolute';
      elementoTemp.style.left = '-9999px';
      elementoTemp.style.width = '800px';
      elementoTemp.style.backgroundColor = '#ffffff';
      elementoTemp.style.padding = '40px';
      elementoTemp.style.fontFamily = 'Inter, sans-serif';

      elementoTemp.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="/lovable-uploads/df4ec87a-f5c9-4334-a247-0a1947d73246.png" alt="MEI Finance" style="height: 60px; margin-bottom: 20px;" />
          <h1 style="color: #2E2E2E; font-size: 28px; margin: 0;">Relatório Financeiro</h1>
          <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">${getPeriodoTexto()}</p>
        </div>

        <div style="display: flex; justify-content: space-around; margin: 30px 0; background: #F5F5F5; padding: 20px; border-radius: 8px;">
          <div style="text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">Entradas</p>
            <p style="color: #16a34a; font-size: 24px; font-weight: bold; margin: 5px 0 0 0;">${formatarMoeda(totais.entradas)}</p>
          </div>
          <div style="text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">Saídas</p>
            <p style="color: #dc2626; font-size: 24px; font-weight: bold; margin: 5px 0 0 0;">${formatarMoeda(totais.saidas)}</p>
          </div>
          <div style="text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">Saldo</p>
            <p style="color: ${totais.saldo >= 0 ? '#16a34a' : '#dc2626'}; font-size: 24px; font-weight: bold; margin: 5px 0 0 0;">${formatarMoeda(totais.saldo)}</p>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <h3 style="color: #2E2E2E; font-size: 18px; margin-bottom: 15px;">Lançamentos do Período</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #F5F5F5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Data</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tipo</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Categoria</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descrição</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${movimentacoes.map(mov => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${formatarData(mov.data)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">
                    <span style="color: ${mov.tipo === 'entrada' ? '#16a34a' : '#dc2626'};">
                      ${mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${mov.categoria}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${mov.descricao || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: ${mov.tipo === 'entrada' ? '#16a34a' : '#dc2626'};">
                    ${formatarMoeda(mov.valor)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
          <p>MEI Finance - Gestão Financeira para Microempreendedores</p>
        </div>
      `;

      document.body.appendChild(elementoTemp);

      const canvas = await html2canvas(elementoTemp, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
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

      pdf.save(`relatorio-${periodo}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);

      document.body.removeChild(elementoTemp);

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
      <div className="space-y-6 max-w-full overflow-hidden">
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
              <h1 className="text-3xl font-bold text-[#2E2E2E]">Relatórios Financeiros</h1>
              <p className="text-gray-600 mt-1">Análise detalhada das suas movimentações</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
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
              className="bg-[#F42000] hover:bg-[#F42000]/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportando ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>

        {/* Cards de Totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Entradas
              </CardTitle>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatarMoeda(totais.entradas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getPeriodoTexto()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Saídas
              </CardTitle>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <TrendingDown className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatarMoeda(totais.saidas)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getPeriodoTexto()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Saldo do Período
              </CardTitle>
              <div className={`p-2 rounded-full ${totais.saldo >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <CardTitle className="text-lg font-semibold text-[#2E2E2E] flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#F42000]" />
              Lançamentos do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((movimentacao) => (
                      <TableRow key={movimentacao.id}>
                        <TableCell className="font-medium">
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
                        <TableCell>{movimentacao.categoria}</TableCell>
                        <TableCell>{movimentacao.descricao || '-'}</TableCell>
                        <TableCell className={`text-right font-medium ${
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
    </Layout>
  );
};

export default Relatorios;

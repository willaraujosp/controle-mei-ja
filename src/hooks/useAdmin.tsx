
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AdminMetrics {
  totalUsuarios: number;
  usuariosTesteGratuito: number;
  usuariosPremium: number;
  usuariosLiberados: number;
  usuariosParcerias: number;
  totalMovimentacoes: number;
  totalExportacoesPDF: number;
  codigosParcerias: any[];
  usuariosParaGerenciar: any[];
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsuarios: 0,
    usuariosTesteGratuito: 0,
    usuariosPremium: 0,
    usuariosLiberados: 0,
    usuariosParcerias: 0,
    totalMovimentacoes: 0,
    totalExportacoesPDF: 0,
    codigosParcerias: [],
    usuariosParaGerenciar: []
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const isMainAdmin = user.email === 'wiaslan1999@gmail.com';
    setIsAdmin(isMainAdmin);
    setLoading(false);

    if (isMainAdmin) {
      await fetchMetrics();
    }
  };

  const fetchMetrics = async () => {
    try {
      console.log('Buscando métricas administrativas...');

      // Buscar total de usuários através dos profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
      }

      // Buscar assinaturas por status
      const { data: assinaturas, error: assinaturasError } = await supabase
        .from('assinaturas')
        .select('*');

      if (assinaturasError) {
        console.error('Erro ao buscar assinaturas:', assinaturasError);
      }

      // Buscar usuários liberados
      const { data: usuariosLiberadosData, error: liberadosError } = await supabase
        .from('usuarios_liberados')
        .select('*')
        .eq('liberado', true);

      if (liberadosError) {
        console.error('Erro ao buscar usuários liberados:', liberadosError);
      }

      // Buscar parcerias ativas
      const { data: parcerias, error: parceriasError } = await supabase
        .from('parcerias_ativas')
        .select('*');

      if (parceriasError) {
        console.error('Erro ao buscar parcerias:', parceriasError);
      }

      // Buscar total de movimentações
      const { data: movimentacoes, error: movError } = await supabase
        .from('movimentacoes')
        .select('*');

      if (movError) {
        console.error('Erro ao buscar movimentações:', movError);
      }

      // Buscar total de exportações PDF
      const { data: exportacoes, error: expError } = await supabase
        .from('exportacoes_pdf')
        .select('*');

      if (expError) {
        console.error('Erro ao buscar exportações:', expError);
      }

      // Buscar códigos de parceria
      const { data: codigosParcerias, error: codigosError } = await supabase
        .from('codigos_parceria')
        .select('*')
        .order('created_at', { ascending: false });

      if (codigosError) {
        console.error('Erro ao buscar códigos:', codigosError);
      }

      // Buscar usuários para gerenciar
      const { data: usuariosParaGerenciar, error: usuariosError } = await supabase
        .from('profiles')
        .select(`
          *,
          usuarios_liberados!inner (*)
        `)
        .order('created_at', { ascending: false });

      if (usuariosError) {
        console.error('Erro ao buscar usuários para gerenciar:', usuariosError);
      }

      // Calcular métricas corrigidas
      const totalUsuarios = profiles?.length || 0;
      
      // Contar por status de assinatura - corrigindo os valores
      const usuariosTesteGratuito = assinaturas?.filter(
        a => a.status === 'teste_gratuito' || a.status === 'trial' || a.status === 'ativo'
      ).length || 0;
      
      const usuariosPremium = assinaturas?.filter(
        a => a.status === 'premium' || a.status === 'paid' || a.status === 'active'
      ).length || 0;
      
      const usuariosLiberados = usuariosLiberadosData?.length || 0;
      const usuariosParcerias = parcerias?.length || 0;
      const totalMovimentacoes = movimentacoes?.length || 0;
      const totalExportacoesPDF = exportacoes?.length || 0;

      console.log('Métricas calculadas:', {
        totalUsuarios,
        usuariosTesteGratuito,
        usuariosPremium,
        usuariosLiberados,
        usuariosParcerias,
        totalMovimentacoes,
        totalExportacoesPDF
      });

      setMetrics({
        totalUsuarios,
        usuariosTesteGratuito,
        usuariosPremium,
        usuariosLiberados,
        usuariosParcerias,
        totalMovimentacoes,
        totalExportacoesPDF,
        codigosParcerias: codigosParcerias || [],
        usuariosParaGerenciar: usuariosParaGerenciar || []
      });
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar métricas do painel",
        variant: "destructive"
      });
    }
  };

  const liberarUsuario = async (userId: string, motivo?: string) => {
    try {
      const { error } = await supabase
        .from('usuarios_liberados')
        .upsert({
          user_id: userId,
          liberado: true,
          liberado_por: user?.id,
          motivo: motivo || 'Liberado pelo administrador',
          data_liberacao: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Usuário liberado com sucesso"
      });

      await fetchMetrics();
    } catch (error) {
      console.error('Erro ao liberar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao liberar usuário",
        variant: "destructive"
      });
    }
  };

  const revogarUsuario = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios_liberados')
        .update({ liberado: false })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Acesso revogado com sucesso"
      });

      await fetchMetrics();
    } catch (error) {
      console.error('Erro ao revogar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao revogar acesso",
        variant: "destructive"
      });
    }
  };

  const criarCodigoParceria = async (codigo: string, descricao?: string, usoMaximo?: number) => {
    try {
      const { error } = await supabase
        .from('codigos_parceria')
        .insert({
          codigo,
          descricao,
          uso_maximo: usoMaximo,
          ativo: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Código de parceria criado com sucesso"
      });

      await fetchMetrics();
    } catch (error) {
      console.error('Erro ao criar código:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar código de parceria",
        variant: "destructive"
      });
    }
  };

  const verificarCodigoParceria = async (codigo: string) => {
    try {
      const { data, error } = await supabase
        .from('codigos_parceria')
        .select('*')
        .eq('codigo', codigo)
        .eq('ativo', true)
        .single();

      if (error || !data) {
        return { valido: false, erro: 'Código inválido ou inativo' };
      }

      if (data.uso_maximo && data.uso_atual >= data.uso_maximo) {
        return { valido: false, erro: 'Código esgotado' };
      }

      return { valido: true, codigo: data };
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return { valido: false, erro: 'Erro ao verificar código' };
    }
  };

  const ativarCodigoParceria = async (userId: string, codigo: string) => {
    try {
      const verificacao = await verificarCodigoParceria(codigo);
      if (!verificacao.valido) {
        throw new Error(verificacao.erro);
      }

      const { error: parceiraError } = await supabase
        .from('parcerias_ativas')
        .insert({
          user_id: userId,
          codigo_id: verificacao.codigo.id,
          codigo_usado: codigo
        });

      if (parceiraError) throw parceiraError;

      const { error: updateError } = await supabase
        .from('codigos_parceria')
        .update({ uso_atual: (verificacao.codigo.uso_atual || 0) + 1 })
        .eq('id', verificacao.codigo.id);

      if (updateError) throw updateError;

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao ativar código:', error);
      return { sucesso: false, erro: error.message };
    }
  };

  return {
    isAdmin,
    loading,
    metrics,
    liberarUsuario,
    revogarUsuario,
    criarCodigoParceria,
    verificarCodigoParceria,
    ativarCodigoParceria,
    refetchMetrics: fetchMetrics
  };
};

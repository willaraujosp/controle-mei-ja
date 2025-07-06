
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

    // Verificar se é o admin principal
    const isMainAdmin = user.email === 'wiaslan1999@gmail.com';
    setIsAdmin(isMainAdmin);
    setLoading(false);

    if (isMainAdmin) {
      await fetchMetrics();
    }
  };

  const fetchMetrics = async () => {
    try {
      // Buscar total de usuários
      const { count: totalUsuarios } = await supabase
        .from('usuarios_liberados')
        .select('*', { count: 'exact', head: true });

      // Buscar assinaturas por status
      const { data: assinaturas } = await supabase
        .from('assinaturas')
        .select('status');

      // Buscar usuários liberados
      const { count: usuariosLiberados } = await supabase
        .from('usuarios_liberados')
        .select('*', { count: 'exact', head: true })
        .eq('liberado', true);

      // Buscar parcerias ativas
      const { count: usuariosParcerias } = await supabase
        .from('parcerias_ativas')
        .select('*', { count: 'exact', head: true });

      // Buscar total de movimentações
      const { count: totalMovimentacoes } = await supabase
        .from('movimentacoes')
        .select('*', { count: 'exact', head: true });

      // Buscar total de exportações PDF
      const { count: totalExportacoesPDF } = await supabase
        .from('exportacoes_pdf')
        .select('*', { count: 'exact', head: true });

      // Buscar códigos de parceria
      const { data: codigosParcerias } = await supabase
        .from('codigos_parceria')
        .select('*')
        .order('created_at', { ascending: false });

      // Buscar usuários para gerenciar
      const { data: usuariosParaGerenciar } = await supabase
        .from('usuarios_liberados')
        .select(`
          *,
          assinaturas (status, plano)
        `)
        .order('created_at', { ascending: false });

      // Calcular métricas das assinaturas
      const usuariosTesteGratuito = assinaturas?.filter(a => a.status === 'teste_gratuito').length || 0;
      const usuariosPremium = assinaturas?.filter(a => a.status === 'premium').length || 0;

      setMetrics({
        totalUsuarios: totalUsuarios || 0,
        usuariosTesteGratuito,
        usuariosPremium,
        usuariosLiberados: usuariosLiberados || 0,
        usuariosParcerias: usuariosParcerias || 0,
        totalMovimentacoes: totalMovimentacoes || 0,
        totalExportacoesPDF: totalExportacoesPDF || 0,
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

  return {
    isAdmin,
    loading,
    metrics,
    liberarUsuario,
    revogarUsuario,
    criarCodigoParceria,
    refetchMetrics: fetchMetrics
  };
};

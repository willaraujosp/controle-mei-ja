
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

  const criarUsuarioManualmente = async (nome: string, email: string, senha: string, plano: string) => {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true
      });

      if (authError) throw authError;

      // Criar assinatura para o usuário
      const { error: assinaturaError } = await supabase
        .from('assinaturas')
        .insert({
          user_id: authData.user.id,
          status: plano,
          plano: plano
        });

      if (assinaturaError) throw assinaturaError;

      // Se for plano liberado, adicionar na tabela usuarios_liberados
      if (plano === 'liberado') {
        const { error: liberadoError } = await supabase
          .from('usuarios_liberados')
          .insert({
            user_id: authData.user.id,
            liberado: true,
            liberado_por: user?.id,
            motivo: 'Criado manualmente pelo administrador'
          });

        if (liberadoError) throw liberadoError;
      }

      toast({
        title: "Sucesso!",
        description: "Usuário criado com sucesso"
      });

      await fetchMetrics();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
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

      // Verificar se excedeu o uso máximo
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
      // Verificar o código
      const verificacao = await verificarCodigoParceria(codigo);
      if (!verificacao.valido) {
        throw new Error(verificacao.erro);
      }

      // Registrar parceria ativa
      const { error: parceiraError } = await supabase
        .from('parcerias_ativas')
        .insert({
          user_id: userId,
          codigo_id: verificacao.codigo.id,
          codigo_usado: codigo
        });

      if (parceiraError) throw parceiraError;

      // Atualizar contador de uso do código
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
    criarUsuarioManualmente,
    verificarCodigoParceria,
    ativarCodigoParceria,
    refetchMetrics: fetchMetrics
  };
};

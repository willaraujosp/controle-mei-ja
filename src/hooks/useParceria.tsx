
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useParceria = () => {
  const [loading, setLoading] = useState(false);

  const verificarCodigoParceria = async (codigo: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('codigos_parceria')
        .select('*')
        .eq('codigo', codigo.toUpperCase())
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
    } finally {
      setLoading(false);
    }
  };

  const ativarCodigoParceria = async (userId: string, codigo: string) => {
    try {
      setLoading(true);
      
      // Verificar o código primeiro
      const verificacao = await verificarCodigoParceria(codigo);
      if (!verificacao.valido) {
        toast({
          title: "Código inválido",
          description: verificacao.erro,
          variant: "destructive"
        });
        return { sucesso: false, erro: verificacao.erro };
      }

      // Registrar parceria ativa
      const { error: parceiraError } = await supabase
        .from('parcerias_ativas')
        .insert({
          user_id: userId,
          codigo_id: verificacao.codigo.id,
          codigo_usado: codigo.toUpperCase()
        });

      if (parceiraError) throw parceiraError;

      // Atualizar contador de uso do código
      const { error: updateError } = await supabase
        .from('codigos_parceria')
        .update({ uso_atual: (verificacao.codigo.uso_atual || 0) + 1 })
        .eq('id', verificacao.codigo.id);

      if (updateError) throw updateError;

      // Atualizar status da assinatura do usuário para 'parceiro'
      const { error: assinaturaError } = await supabase
        .from('assinaturas')
        .upsert({
          user_id: userId,
          status: 'parceiro',
          plano: 'parceiro'
        });

      if (assinaturaError) throw assinaturaError;

      toast({
        title: "Código ativado!",
        description: "Sua parceria foi ativada com sucesso"
      });

      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao ativar código:', error);
      toast({
        title: "Erro",
        description: "Erro ao ativar código de parceria",
        variant: "destructive"
      });
      return { sucesso: false, erro: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    verificarCodigoParceria,
    ativarCodigoParceria,
    loading
  };
};

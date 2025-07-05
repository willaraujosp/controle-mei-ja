
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  categoria: string;
  descricao?: string;
  status: 'pago' | 'pendente' | 'recebido';
  data: string;
  created_at: string;
}

export const useMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movimentacoes')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar movimentações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar movimentações",
          variant: "destructive",
        });
      } else {
        // Garantir que os tipos estão corretos
        const typedData = (data || []).map(item => ({
          ...item,
          tipo: item.tipo as 'entrada' | 'saida',
          status: item.status as 'pago' | 'pendente' | 'recebido'
        }));
        setMovimentacoes(typedData);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMovimentacao = async (movimentacao: Omit<Movimentacao, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([{ ...movimentacao, user_id: null }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar movimentação:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar movimentação",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Sucesso!",
        description: "Movimentação adicionada com sucesso",
      });

      await fetchMovimentacoes();
      return data;
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      return null;
    }
  };

  const updateMovimentacao = async (id: string, updates: Partial<Movimentacao>) => {
    try {
      const { error } = await supabase
        .from('movimentacoes')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar movimentação:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar movimentação",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso!",
        description: "Movimentação atualizada com sucesso",
      });

      await fetchMovimentacoes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar movimentação:', error);
      return false;
    }
  };

  const deleteMovimentacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movimentacoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar movimentação:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar movimentação",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso!",
        description: "Movimentação deletada com sucesso",
      });

      await fetchMovimentacoes();
      return true;
    } catch (error) {
      console.error('Erro ao deletar movimentação:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  return {
    movimentacoes,
    loading,
    addMovimentacao,
    updateMovimentacao,
    deleteMovimentacao,
    refetch: fetchMovimentacoes,
  };
};

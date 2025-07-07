
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  PieChart, 
  Users, 
  FileText, 
  Smartphone, 
  CheckCircle,
  ArrowRight,
  Mail
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          toast({
            title: "Erro de Login",
            description: "E-mail ou senha incorretos. Verifique suas credenciais ou cadastre-se.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: error.message || "Erro ao fazer login",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        if (error.message === 'User already registered') {
          toast({
            title: "Erro",
            description: "Este e-mail já está cadastrado. Tente fazer login.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro",
            description: error.message || "Erro ao criar conta",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar conta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({
        title: "Erro",
        description: "Digite seu e-mail",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao enviar e-mail de recuperação",
          variant: "destructive"
        });
      } else {
        toast({
          title: "E-mail enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha",
        });
        setShowForgotPassword(false);
        setForgotEmail('');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Controle de entradas e saídas",
      description: "Registre todas suas movimentações financeiras"
    },
    {
      icon: PieChart,
      title: "Visualização do saldo atualizado",
      description: "Veja seu saldo em tempo real"
    },
    {
      icon: PieChart,
      title: "Gráficos de movimentações mensais",
      description: "Analise suas finanças com gráficos intuitivos"
    },
    {
      icon: FileText,
      title: "Relatórios financeiros exportáveis em PDF",
      description: "Gere relatórios profissionais"
    },
    {
      icon: Smartphone,
      title: "Acesso rápido e 100% online",
      description: "Use no celular ou computador"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mei-gray to-white overflow-x-hidden w-full">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full max-w-full">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-mei-text mb-2 sm:mb-4 break-words">
            <span className="text-mei-red">MEI</span> Finance
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto break-words px-2">
            A solução completa para microempreendedores individuais organizarem suas finanças
          </p>
        </header>

        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-start max-w-7xl mx-auto">
          
          {/* Left Side - Benefits */}
          <div className="space-y-6 sm:space-y-8 px-2">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-mei-text break-words">
                Organize suas finanças com facilidade
              </h2>
              <p className="text-base sm:text-lg text-gray-600 break-words">
                Tudo que você precisa para controlar as finanças do seu negócio em uma única plataforma.
              </p>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-mei-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-mei-text mb-1 break-words text-sm sm:text-base">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm break-words">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Info */}
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <span className="font-semibold text-mei-text break-words text-sm sm:text-base">Teste grátis por 3 dias</span>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-mei-red mb-2">
                  R$ 29,90<span className="text-base sm:text-lg text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600 break-words text-sm sm:text-base">
                  Depois do período de teste
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="lg:sticky lg:top-8 w-full px-2">
            <Card className="p-4 sm:p-8 shadow-lg border-0 bg-white/95 backdrop-blur w-full max-w-full">
              {!showForgotPassword ? (
                <Tabs defaultValue="register" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                    <TabsTrigger value="register" className="text-xs sm:text-sm">Criar Conta</TabsTrigger>
                    <TabsTrigger value="login" className="text-xs sm:text-sm">Entrar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="register" className="space-y-3 sm:space-y-4">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-mei-text mb-2 break-words">
                        Começar Teste Grátis
                      </h3>
                      <p className="text-gray-600 break-words text-sm sm:text-base">
                        3 dias grátis, depois apenas R$ 29,90/mês
                      </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                          className="mei-input w-full text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-sm">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          className="mei-input w-full text-sm sm:text-base"
                          minLength={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm">Confirmar Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirme sua senha"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          required
                          className="mei-input w-full text-sm sm:text-base"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full mei-button text-sm sm:text-lg py-4 sm:py-6 break-words"
                        disabled={isLoading}
                      >
                        {isLoading ? "Criando conta..." : "Criar Conta e Começar o Teste Grátis"}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="login" className="space-y-3 sm:space-y-4">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-mei-text mb-2 break-words">
                        Bem-vindo de volta!
                      </h3>
                      <p className="text-gray-600 break-words text-sm sm:text-base">
                        Entre na sua conta
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                      <div>
                        <Label htmlFor="loginEmail" className="text-sm">E-mail</Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                          className="mei-input w-full text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loginPassword" className="text-sm">Senha</Label>
                        <Input
                          id="loginPassword"
                          type="password"
                          placeholder="Sua senha"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          className="mei-input w-full text-sm sm:text-base"
                        />
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-mei-red hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                      <Button
                        type="submit"
                        className="w-full mei-button text-sm sm:text-lg py-4 sm:py-6 break-words"
                        disabled={isLoading}
                      >
                        {isLoading ? "Entrando..." : "Entrar"}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <Mail className="h-12 w-12 text-mei-red mx-auto mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold text-mei-text mb-2">
                      Recuperar Senha
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Digite seu e-mail para receber o link de recuperação
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="forgotEmail" className="text-sm">E-mail</Label>
                      <Input
                        id="forgotEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="mei-input w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full mei-button"
                      disabled={isLoading}
                    >
                      {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full"
                    >
                      Voltar ao Login
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Footer - Suporte */}
        <footer className="mt-12 sm:mt-16 text-center border-t border-gray-200 pt-6 sm:pt-8">
          <div className="space-y-2">
            <p className="text-gray-600 text-sm sm:text-base">
              Precisa de ajuda? Entre em contato:
            </p>
            <a 
              href="mailto:meifinancebr@gmail.com" 
              className="text-mei-red hover:underline font-medium text-sm sm:text-base break-all"
            >
              meifinancebr@gmail.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

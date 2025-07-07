
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
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirecionar se já estiver logado
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
    <div className="min-h-screen bg-gradient-to-br from-mei-gray to-white overflow-x-hidden max-w-full">
      <div className="container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-mei-text mb-4 break-words">
            <span className="text-mei-red">MEI</span> Finance
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto break-words">
            A solução completa para microempreendedores individuais organizarem suas finanças
          </p>
        </header>

        {/* Main Content - Two Columns */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-mei-text break-words">
                Organize suas finanças com facilidade
              </h2>
              <p className="text-lg text-gray-600 break-words">
                Tudo que você precisa para controlar as finanças do seu negócio em uma única plataforma.
              </p>
            </div>

            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-mei-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-mei-text mb-1 break-words">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm break-words">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-mei-text break-words">Teste grátis por 3 dias</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-mei-red mb-2">
                  R$ 29,90<span className="text-lg text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600 break-words">
                  Depois do período de teste
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Form */}
          <div className="lg:sticky lg:top-8 w-full">
            <Card className="p-8 shadow-lg border-0 bg-white/95 backdrop-blur w-full max-w-full">
              <Tabs defaultValue="register" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                </TabsList>

                <TabsContent value="register" className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-mei-text mb-2 break-words">
                      Começar Teste Grátis
                    </h3>
                    <p className="text-gray-600 break-words">
                      3 dias grátis, depois apenas R$ 29,90/mês
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mei-input w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        className="mei-input w-full"
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                        className="mei-input w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full mei-button text-lg py-6 break-words"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta e Começar o Teste Grátis"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-mei-text mb-2 break-words">
                      Bem-vindo de volta!
                    </h3>
                    <p className="text-gray-600 break-words">
                      Entre na sua conta
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="loginEmail">E-mail</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mei-input w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loginPassword">Senha</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Sua senha"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        className="mei-input w-full"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full mei-button text-lg py-6 break-words"
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

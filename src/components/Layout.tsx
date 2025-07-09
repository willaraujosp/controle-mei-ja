
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Settings,
  Menu,
  X,
  LogOut,
  CreditCard,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Chatbot from '@/components/Chatbot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Lançamentos', href: '/lancamentos', icon: TrendingUp },
    { name: 'Relatórios', href: '/relatorios', icon: FileText },
    { name: 'Configurações', href: '/configuracoes', icon: Settings }
  ];

  if (user?.email === 'wiaslan1999@gmail.com') {
    menuItems.push({ name: 'Admin', href: '/admin', icon: Shield });
  }

  const handleLogout = async () => {
    try {
      await signOut();
      
      toast({
        title: "Logout realizado",
        description: "Redirecionando...",
      });
      
      // Forçar redirecionamento após breve delay para o toast aparecer
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error('Erro no logout:', error);
      
      toast({
        title: "Erro no logout",
        description: "Tentando sair mesmo assim...",
        variant: "destructive"
      });
      
      // Mesmo com erro, forçar redirecionamento
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  };

  const isTrialExpired = false;

  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mei-gray to-white flex items-center justify-center px-2 sm:px-4 overflow-x-hidden w-full">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 max-w-md w-full mx-2">
          <div className="text-center">
            <CreditCard className="h-12 w-12 sm:h-16 sm:w-16 text-mei-red mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-mei-text mb-4">
              Teste Gratuito Expirado
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base break-words">
              Seu período de teste de 3 dias expirou. Para continuar usando o MEI Finance, 
              assine nosso plano por apenas R$ 29,90/mês.
            </p>
            <Button
              onClick={() => window.open('https://pay.cakto.com.br/3f9sct4_464768', '_blank')}
              className="w-full mei-button text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-6 mb-4"
            >
              Assinar por R$ 29,90/mês
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              Fazer Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-mei-gray overflow-hidden w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-mei-red truncate">MEI Finance</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm font-medium rounded-lg transition-colors break-words
                  ${isActive 
                    ? 'bg-mei-red text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Support Section */}
        <div className="px-2 sm:px-4 py-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-2">
            <HelpCircle className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Precisa de ajuda?</span>
          </div>
          <a 
            href="mailto:meifinancebr@gmail.com"
            className="text-xs text-mei-red hover:underline break-all block mb-3"
          >
            meifinancebr@gmail.com
          </a>
        </div>

        <div className="p-2 sm:p-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-start text-gray-600 hover:text-mei-red text-xs sm:text-sm"
          >
            <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Sair</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-14 sm:h-16 flex items-center justify-between px-2 sm:px-4 md:px-6 overflow-x-hidden w-full">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block" />
          
          <div className="text-xs sm:text-sm text-gray-600">
            {user?.email === 'wiaslan1999@gmail.com' ? (
              <span className="bg-red-100 text-red-800 px-1 sm:px-2 py-1 rounded-full text-xs font-medium">
                Administrador
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-1 sm:px-2 py-1 rounded-full text-xs font-medium">
                Teste Gratuito Ativo
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto w-full max-w-full">
          <div className="h-full w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;

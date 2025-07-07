
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Olá! Sou a Lívia, sua assistente da MEI Finance! 👋\n\nComo posso te ajudar hoje?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const commonQuestions = [
    {
      question: "Como lanço uma entrada?",
      answer: "Para lançar uma entrada:\n\n1. Vá para 'Lançamentos' no menu\n2. Clique em 'Nova Movimentação'\n3. Selecione 'Entrada' como tipo\n4. Preencha os dados (categoria, valor, descrição)\n5. Clique em 'Salvar'\n\nSua entrada será registrada automaticamente! 💰"
    },
    {
      question: "Como exporto um relatório?",
      answer: "Para exportar relatórios em PDF:\n\n1. Acesse 'Relatórios' no menu\n2. Escolha o período (semanal, mensal ou anual)\n3. Clique em 'Exportar PDF'\n4. O arquivo será baixado automaticamente\n\nO relatório inclui todas as suas movimentações e totais! 📊"
    },
    {
      question: "Como assino o plano?",
      answer: "Para assinar o plano premium:\n\n1. Vá em 'Configurações'\n2. Na seção 'Informações do Plano'\n3. Clique em 'Assinar Agora'\n4. Você será redirecionado para o pagamento\n\nO plano custa R$ 29,90/mês e inclui todas as funcionalidades! 💳"
    },
    {
      question: "Como atualizar meus dados?",
      answer: "Para atualizar suas informações:\n\n1. Acesse 'Configurações' no menu\n2. Altere o nome da empresa no campo disponível\n3. Clique em 'Salvar Configurações'\n\nSeus dados ficarão atualizados em toda a plataforma! ⚙️"
    }
  ];

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Buscar resposta nas perguntas comuns
    for (const qa of commonQuestions) {
      if (lowerMessage.includes('entrada') || lowerMessage.includes('lançar') || lowerMessage.includes('registrar')) {
        return commonQuestions[0].answer;
      }
      if (lowerMessage.includes('relatório') || lowerMessage.includes('exportar') || lowerMessage.includes('pdf')) {
        return commonQuestions[1].answer;
      }
      if (lowerMessage.includes('assinar') || lowerMessage.includes('plano') || lowerMessage.includes('premium') || lowerMessage.includes('pagar')) {
        return commonQuestions[2].answer;
      }
      if (lowerMessage.includes('atualizar') || lowerMessage.includes('configurar') || lowerMessage.includes('dados') || lowerMessage.includes('empresa')) {
        return commonQuestions[3].answer;
      }
    }

    // Respostas para saudações
    if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('ola')) {
      return "Olá! Como posso te ajudar com o MEI Finance hoje? 😊\n\nPosso te explicar sobre:\n• Como fazer lançamentos\n• Como exportar relatórios\n• Como assinar o plano\n• Como atualizar seus dados";
    }

    // Resposta padrão
    return "Entendo que você precisa de ajuda! 🤔\n\nAqui estão algumas coisas que posso te ajudar:\n\n• Como fazer lançamentos de entrada e saída\n• Como exportar relatórios em PDF\n• Como assinar o plano premium\n• Como atualizar suas informações\n\nDigite uma dessas opções ou me faça uma pergunta específica!";
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: getBotResponse(inputMessage),
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputMessage('');
  };

  const handleQuickReply = (question: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: question,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: getBotResponse(question),
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#F42000] hover:bg-[#F42000]/90 text-white shadow-lg"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat expandido */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-96 shadow-2xl border-2 border-[#F42000]/20">
          <CardHeader className="bg-[#F42000] text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">Lívia</CardTitle>
                  <p className="text-xs text-white/80">Assistente MEI Finance</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col h-64 p-0">
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg text-xs ${
                      message.isBot
                        ? 'bg-gray-100 text-[#2E2E2E]'
                        : 'bg-[#F42000] text-white'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sugestões rápidas */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-600 mb-2">Perguntas frequentes:</p>
                <div className="space-y-1">
                  {commonQuestions.slice(0, 2).map((qa, index) => (
                    <Button
                      key={index}
                      onClick={() => handleQuickReply(qa.question)}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-auto p-2 justify-start text-left"
                    >
                      {qa.question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input de mensagem */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-[#F42000] hover:bg-[#F42000]/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const UTILITY_RESPONSES = {
  // Leak Detection
  leak: {
    keywords: ['leak', 'leaking', 'water loss', 'pipe burst', 'emergency'],
    response: "For leak detection:\n\n• **Immediate Action**: Turn off water at the main valve if it's a major leak\n• **Report**: Use the Leaks page to report the location and severity\n• **Emergency**: Call emergency line for critical leaks affecting public safety\n• **Documentation**: Take photos and note estimated water loss\n\nNeed help with a specific leak location?"
  },
  
  // Maintenance
  maintenance: {
    keywords: ['maintenance', 'repair', 'schedule', 'inspection', 'pump', 'valve', 'filter'],
    response: "Maintenance procedures:\n\n• **Routine Inspections**: Monthly valve checks, quarterly pump maintenance\n• **Scheduling**: Use the Maintenance page to schedule tasks\n• **Priority Levels**: Critical (24h), High (3 days), Normal (1 week), Low (1 month)\n• **Safety**: Always follow lockout/tagout procedures\n• **Documentation**: Complete work orders with photos and notes\n\nWhat maintenance task do you need help with?"
  },
  
  // Water Quality
  quality: {
    keywords: ['quality', 'testing', 'chlorine', 'ph', 'turbidity', 'contamination', 'bacteria'],
    response: "Water quality standards:\n\n• **pH Range**: 6.5 - 8.5 (optimal 7.0-7.5)\n• **Chlorine Residual**: 0.2 - 4.0 mg/L\n• **Turbidity**: < 1 NTU (ideally < 0.3 NTU)\n• **Testing Frequency**: Daily chlorine, weekly bacteria, monthly comprehensive\n• **Compliance**: Must meet EPA Safe Drinking Water Act standards\n\nNeed specific testing procedures or troubleshooting help?"
  },
  
  // System Pressure
  pressure: {
    keywords: ['pressure', 'psi', 'low pressure', 'high pressure', 'flow rate', 'pumping'],
    response: "System pressure guidelines:\n\n• **Normal Range**: 30-80 PSI residential, 20-30 PSI minimum\n• **Low Pressure**: Check for leaks, pump issues, or demand spikes\n• **High Pressure**: Risk of pipe damage, check pressure reducing valves\n• **Flow Rate**: Monitor for unusual patterns indicating problems\n• **Pump Operations**: Check station status and performance metrics\n\nWhat pressure issue are you experiencing?"
  },
  
  // Compliance
  compliance: {
    keywords: ['compliance', 'regulation', 'epa', 'report', 'violation', 'standard', 'permit'],
    response: "Regulatory compliance requirements:\n\n• **EPA Standards**: Safe Drinking Water Act, Clean Water Act\n• **Reporting**: Monthly operational reports, quarterly water quality\n• **Monitoring**: Continuous chlorine, daily bacteria testing\n• **Documentation**: Maintain 10-year records of all testing and operations\n• **Violations**: Immediate reporting and corrective action required\n\nNeed help with specific compliance requirements?"
  },
  
  // Emergency Procedures
  emergency: {
    keywords: ['emergency', 'urgent', 'critical', 'failure', 'outage', 'contamination alert'],
    response: "Emergency response procedures:\n\n• **Water Main Break**: Isolate section, notify customers, emergency repairs\n• **System Contamination**: Issue boil water notice, increase chlorination, test frequently\n• **Power Outage**: Activate backup generators, monitor tank levels\n• **Equipment Failure**: Switch to backup systems, emergency contractor contact\n• **Customer Complaints**: Log all complaints, investigate immediately\n\nWhat type of emergency are you dealing with?"
  },
  
  // Customer Service
  customer: {
    keywords: ['customer', 'complaint', 'billing', 'service', 'account', 'call'],
    response: "Customer service guidelines:\n\n• **Response Time**: Acknowledge within 24 hours, resolve within 72 hours\n• **Common Issues**: Low pressure, water quality, billing questions, service interruptions\n• **Documentation**: Log all interactions in customer management system\n• **Escalation**: Supervisor involvement for unresolved issues after 48 hours\n• **Communication**: Proactive notifications for planned outages\n\nWhat customer service issue needs attention?"
  }
};

const QUICK_SUGGESTIONS = [
  "How to report a leak?",
  "Water quality standards",
  "Emergency procedures",
  "Maintenance schedules",
  "Pressure issues",
  "Compliance requirements"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your water utility assistant. I can help with:\n\n• Leak detection and reporting\n• Maintenance procedures\n• Water quality standards\n• System operations\n• Emergency protocols\n• Compliance requirements\n\nWhat can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Check for exact matches first
    for (const [key, responseData] of Object.entries(UTILITY_RESPONSES)) {
      const matchCount = responseData.keywords.filter(keyword => 
        input.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        return responseData.response;
      }
    }
    
    // Default response with suggestions
    return "I understand you need help with water utility operations. Here are some topics I can assist with:\n\n• **Leak Detection**: Report and manage water leaks\n• **Maintenance**: Scheduling and procedures\n• **Water Quality**: Testing standards and compliance\n• **System Pressure**: Troubleshooting pressure issues\n• **Emergency Response**: Critical situation protocols\n• **Customer Service**: Handling customer inquiries\n\nCould you be more specific about what you need help with?";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: findBestResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputValue('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 h-[500px] shadow-xl border-0 bg-white">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg">Utility Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-[400px]">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5 text-white" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          {/* Quick Suggestions */}
          <div className="px-4 py-2 border-t bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about water utility operations..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} size="sm" className="px-3">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
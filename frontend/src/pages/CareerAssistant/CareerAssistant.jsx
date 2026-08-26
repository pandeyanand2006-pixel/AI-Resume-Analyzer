import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import { Button, Badge } from "../../components/ui";
import api from "../../services/api";
import "./CareerAssistant.css";

function CareerAssistant() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 I'm your AI Career Assistant. I'm here to help you with career advice, resume tips, interview preparation, and professional development.\n\nHere are some things you can ask me:\n• How can I improve my resume for ATS systems?\n• What skills should I learn to advance my career?\n• How do I prepare for a job interview?\n• Help me write a professional summary for my resume\n\nWhat would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const response = await api.get("/career-assistant/suggestions");
      if (response.data?.success) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error("Load suggestions error:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    
    if (!textToSend) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setShowSuggestions(false);
    setLoading(true);

    try {
      const response = await api.post("/career-assistant/chat", {
        message: textToSend,
        conversationHistory: messages
      });

      if (response.data?.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Send message error:", error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (question) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date().toISOString()
      }
    ]);
    setShowSuggestions(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppLayout pageTitle="AI Career Assistant">
      <div className="career-assistant-page">
        {/* Hero */}
        <div className="career-assistant__hero">
          <div className="flex items-center gap-4">
            <div className="text-5xl">💬</div>
            <div>
              <Badge variant="primary" className="mb-2">AI-Powered</Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                Chat with Your Personal Career Coach
              </h1>
              <p className="mt-2 text-sm text-white font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                Get personalized advice on resumes, interviews, career growth, and professional development
              </p>
            </div>
            <div className="ml-auto">
              <Button onClick={handleClearChat} variant="outline" size="sm" className="text-white border-white hover:bg-white/10">
                Clear Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="career-assistant__chat">
          {/* Messages */}
          <div className="career-assistant__messages">
            {/* Date Separator */}
            <div className="career-assistant__date-separator">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>

            {messages.map((message, index) => (
              <div
                key={index}
                className={`career-assistant__message-wrapper ${
                  message.role === 'user' ? 'career-assistant__message-wrapper--user' : 'career-assistant__message-wrapper--assistant'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="career-assistant__message-header">
                    <div className="career-assistant__avatar">
                      <span className="career-assistant__avatar-icon">🤖</span>
                    </div>
                    <div className="career-assistant__sender-name">
                      AI Career Assistant
                    </div>
                  </div>
                )}

                <div
                  className={`career-assistant__message ${
                    message.role === 'user' ? 'career-assistant__message--user' : 'career-assistant__message--assistant'
                  } ${message.isError ? 'career-assistant__message--error' : ''}`}
                >
                  <div className="career-assistant__message-content">
                    {message.content}
                  </div>
                  <div className="career-assistant__message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="career-assistant__message-wrapper career-assistant__message-wrapper--assistant">
                <div className="career-assistant__message-header">
                  <div className="career-assistant__avatar">
                    <span className="career-assistant__avatar-icon">🤖</span>
                  </div>
                  <div className="career-assistant__sender-name">
                    AI Career Assistant
                  </div>
                </div>
                <div className="career-assistant__message career-assistant__message--assistant">
                  <div className="career-assistant__typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Always visible at bottom */}
          <div className="career-assistant__input">
            <div className="flex gap-3 items-end">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={loading}
                rows="1"
                className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none disabled:bg-slate-100 transition-all"
                style={{ minHeight: '56px', maxHeight: '150px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                variant="primary"
                size="lg"
                loading={loading}
                className="px-8 py-3.5 min-w-[100px]"
              >
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CareerAssistant;

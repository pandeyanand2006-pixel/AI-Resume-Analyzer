import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../ui';
import { SparklesIcon, XIcon, ArrowRightIcon } from '../ui/Icons';
import api from '../../services/api';
import './FloatingAIAssistant.css';

const FloatingAIAssistant = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! 👋 I\'m your AI Career Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'How can I improve my resume?',
    'What skills should I learn?',
    'Find jobs for me',
    'Prepare me for interviews'
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/career-assistant/chat', {
        message: input,
        conversationHistory: messages.slice(-10) // Send last 10 messages for context
      });

      if (response.data?.success && response.data.response) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`floating-assistant-button ${isOpen ? 'floating-assistant-button--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI Career Assistant"
      >
        {isOpen ? (
          <XIcon size={24} />
        ) : (
          <>
            <SparklesIcon size={24} />
            <span className="floating-assistant-button__label">AI Assistant</span>
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="floating-assistant-panel">
          {/* Header */}
          <div className="floating-assistant-header">
            <div className="floating-assistant-header__icon">
              <SparklesIcon size={20} />
            </div>
            <div className="floating-assistant-header__info">
              <h3>AI Career Assistant</h3>
              <span className="floating-assistant-header__status">
                <span className="floating-assistant-status-dot" />
                Online
              </span>
            </div>
            <button
              className="floating-assistant-header__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="floating-assistant-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`floating-assistant-message floating-assistant-message--${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="floating-assistant-message__avatar">
                    <SparklesIcon size={16} />
                  </div>
                )}
                <div className="floating-assistant-message__content">
                  <p>{message.content}</p>
                  <span className="floating-assistant-message__time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="floating-assistant-message floating-assistant-message--assistant">
                <div className="floating-assistant-message__avatar">
                  <SparklesIcon size={16} />
                </div>
                <div className="floating-assistant-message__content">
                  <div className="floating-assistant-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="floating-assistant-suggestions">
              <p className="floating-assistant-suggestions__label">Try asking:</p>
              <div className="floating-assistant-suggestions__list">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="floating-assistant-suggestion"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="floating-assistant-input">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="floating-assistant-input__field"
            />
            <button
              className="floating-assistant-input__send"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <ArrowRightIcon size={20} />
            </button>
          </div>

          {/* Footer */}
          <div className="floating-assistant-footer">
            <button
              className="floating-assistant-footer__link"
              onClick={() => {
                navigate('/career-assistant');
                setIsOpen(false);
              }}
            >
              Open Full Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIAssistant;

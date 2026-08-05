import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../store/AuthContext';
import { chatService } from '../services/api';
import './AIChatbot.css';

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadHistory = async () => {
    try {
      const res = await chatService.getHistory(sessionId);
      if (res.data && res.data.length > 0) {
        setSessionId(res.data[0].session_id);
        
        const historyMessages = [];
        res.data.forEach(msg => {
          historyMessages.push({ role: 'user', content: msg.user_message });
          historyMessages.push({ role: 'ai', content: msg.ai_response });
        });
        setMessages(historyMessages);
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(userMsg.content, sessionId);
      setMessages(prev => [...prev, { role: 'ai', content: res.data.ai_response }]);
      if (res.data.session_id) {
        setSessionId(res.data.session_id);
      }
    } catch (err) {
      console.error("Chat failed", err);
      setMessages(prev => [...prev, { role: 'error', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setInputValue(text);
  };

  const clearChat = async () => {
    try {
      await chatService.clearHistory(sessionId);
      setMessages([]);
      setSessionId('');
    } catch (err) {
      console.error("Failed to clear chat", err);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title-container">
              <div className="chatbot-avatar-wrapper">
                <img src="/sam-avatar.png" alt="Sam" className="chatbot-avatar" />
                <div className="chatbot-online-dot"></div>
              </div>
              <div className="chatbot-title">
                <span className="chatbot-name">Sam</span>
                <span className="chatbot-subtitle">AI Learning Mentor</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button onClick={clearChat} title="Clear Chat" aria-label="Clear chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              <button onClick={() => setIsOpen(false)} title="Close Chat" aria-label="Close chat">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="chatbot-empty-state">
                <img src="/sam-waving.png" alt="Sam waving" className="chatbot-illustration" />
                <div className="chatbot-welcome-text">
                  Hi! I'm <span>Sam</span>,<br/>your AI Learning Mentor.
                </div>
                <p className="chatbot-welcome-subtext">
                  Ask me about your roadmap, resume, or interview prep!
                </p>
                <div className="chatbot-suggestions">
                  <button className="chatbot-suggestion-btn suggestion-green" onClick={() => handleSuggestion("What should I learn next on my roadmap?")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                    Roadmap
                  </button>
                  <button className="chatbot-suggestion-btn suggestion-orange" onClick={() => handleSuggestion("Can you analyze my resume for a Software Engineer role?")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Resume
                  </button>
                  <button className="chatbot-suggestion-btn suggestion-pink" onClick={() => handleSuggestion("Let's do a mock interview for a React Developer position.")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Interview
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  {(msg.role === 'ai' || msg.role === 'error') ? (
                    (() => {
                      let strongCount = 0;
                      return (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong({node, children, ...props}) {
                              // Since AI bg is green, use white or light yellow for bold text
                              const colors = ['#ffffff', '#ffeb3b', '#ffd166'];
                              const color = colors[strongCount % colors.length];
                              strongCount++;
                              return <strong style={{ color, fontWeight: 900 }} {...props}>{children}</strong>;
                            },
                            code({node, inline, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                      );
                    })()
                  ) : (
                    msg.content
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="chat-message ai">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="chatbot-send" disabled={!inputValue.trim() || isLoading} aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Learning Mentor"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
      )}
    </div>
  );
}

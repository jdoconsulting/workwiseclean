"use client"
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Plus, ThumbsUp, ThumbsDown, X, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';
import { useRouter } from 'next/navigation';

// Embedded logo as base64 - Blue chevrons in black circle
const LOGO_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Ccircle cx='256' cy='256' r='256' fill='%232d2d2d'/%3E%3Cpath d='M150 180 L230 256 L150 332 L180 332 L260 256 L180 180 Z' fill='%233b9eff'/%3E%3Cpath d='M250 180 L330 256 L250 332 L280 332 L360 256 L280 180 Z' fill='%233b9eff'/%3E%3C/svg%3E";

export default function VertexOneSoundBoard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const positiveOptions = [
    'Clear and helpful',
    'Good examples',
    'Easy to understand',
    'Saved me time'
  ];

  const negativeOptions = [
    'Not relevant',
    'Too vague',
    'Incorrect information',
    'Hard to follow'
  ];

  // Check authentication on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push('/login');
      }
      setAuthLoading(false);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFeedback = (type) => {
    setFeedbackType(type);
    setFeedbackVisible(true);
    setSelectedOption(null);
    setFeedbackSubmitted(false);
  };

  const submitFeedback = () => {
    if (!selectedOption) return;
    setFeedbackSubmitted(true);
    setFeedbackVisible(false);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackType(null);
      setSelectedOption(null);
    }, 2000);
  };

  const closeFeedback = () => {
    setFeedbackVisible(false);
    setFeedbackType(null);
    setSelectedOption(null);
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          userMessage: textToSend,
          conversationHistory,
          userId: user?.id,
          conversationId: conversationId
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let newThreadId = threadId;

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.thread?.id && !newThreadId) {
              newThreadId = data.thread.id;
              setThreadId(newThreadId);
            }

            // Save the conversation ID from the API response
            if (data.conversationId) {
              setConversationId(data.conversationId);
            }

            if (data.event === 'thread.message.delta') {
              const content = data.data?.delta?.content?.[0];
              if (content?.type === 'text' && content.text?.value) {
                assistantMessage += content.text.value;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage
                  };
                  return newMessages;
                });
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: textToSend },
        { role: 'assistant', content: assistantMessage }
      ]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleClick = (module) => {
    const moduleMessages = {
      1: "I'd like to work through Module 1: Foundations",
      2: "I'd like to work through Module 2: Awareness",
      3: "I'd like to work through Module 3: Cultivating"
    };
    sendMessage(moduleMessages[module]);
  };

  const handlePracticeClick = (type) => {
    const practiceMessages = {
      questioning: "I'd like to practice Powerful Questioning",
      change: "I'd like to practice Change Management"
    };
    sendMessage(practiceMessages[type]);
  };

  // Reset conversation (for new chat)
  const startNewConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    setThreadId(null);
    setConversationId(null);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={LOGO_SRC}
              alt="Vertex One" 
              style={{ 
                width: '40px', 
                height: '40px'
              }} 
            />
          </div>
          <span 
            onClick={startNewConversation}
            style={{ 
              fontSize: '18px', 
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#3b9eff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
          >
            Vertex One SoundingBoard
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>
            {user?.user_metadata?.full_name || user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #444',
              borderRadius: '8px',
              color: '#888',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#666';
              e.currentTarget.style.color = '#aaa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.color = '#888';
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        overflow: 'hidden'
      }}>
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <img 
                src={LOGO_SRC}
                alt="Vertex One" 
                style={{ 
                  width: '120px', 
                  height: '120px'
                }} 
              />
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              margin: '0 0 16px 0'
            }}>Vertex One SoundingBoard</h1>
            <p style={{
              color: '#888',
              textAlign: 'center',
              maxWidth: '640px',
              marginBottom: '40px',
              lineHeight: '1.6',
              fontSize: '16px'
            }}>
              Welcome — I'll be your sounding board throughout the Leader as Coach program. Think of
              this as your practice ground — a space to strengthen your skills, reflect on your impact, and
              experiment with showing up as a leader who coaches.
            </p>

            {/* Module Cards */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '24px',
              width: '100%',
              maxWidth: '900px'
            }}>
              {[1, 2, 3].map((num) => (
                <div 
                  key={num}
                  style={{
                    backgroundColor: '#2a2a2a',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    minWidth: '180px',
                    flex: '1',
                    maxWidth: '200px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                  onClick={() => handleModuleClick(num)}
                >
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>Module {num}:</div>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    {num === 1 ? 'Foundations' : num === 2 ? 'Awareness' : 'Cultivating'}
                  </div>
                </div>
              ))}
            </div>

            {/* Practice Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{
                backgroundColor: '#3b9eff',
                borderRadius: '12px',
                padding: '20px 24px',
                minWidth: '200px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 158, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => handlePracticeClick('questioning')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', marginBottom: '4px', color: 'white' }}>
                  <MessageCircle size={18} color="white" />
                  <span>Practice</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Powerful Questioning</div>
              </div>

              <div style={{
                backgroundColor: '#3b9eff',
                borderRadius: '12px',
                padding: '20px 24px',
                minWidth: '200px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 158, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => handlePracticeClick('change')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', marginBottom: '4px', color: 'white' }}>
                  <RefreshCw size={18} color="white" />
                  <span>Practice</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Change Management</div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    backgroundColor: message.role === 'user' ? '#3b9eff' : '#2a2a2a',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    maxWidth: '80%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  backgroundColor: '#2a2a2a',
                  color: '#888',
                  padding: '12px 16px',
                  borderRadius: '16px'
                }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Feedback Widget */}
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          zIndex: 1000
        }}>
          {feedbackSubmitted && (
            <div style={{
              backgroundColor: '#2a2a2a',
              color: '#aaa',
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: '8px'
            }}>
              Thanks for your feedback!
            </div>
          )}

          {feedbackVisible && (
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              padding: '16px',
              width: '280px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid #444'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '14px', color: '#ccc' }}>
                  {feedbackType === 'positive' ? 'What did you like?' : 'What didn\'t you like?'}
                </span>
                <button 
                  onClick={closeFeedback}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#aaa'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(feedbackType === 'positive' ? positiveOptions : negativeOptions).map((option, index) => (
                  <label 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: selectedOption === option ? '#3a3a3a' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedOption !== option) {
                        e.currentTarget.style.backgroundColor = '#333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedOption !== option) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="feedback"
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => setSelectedOption(option)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#3b9eff',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#aaa' }}>{option}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={submitFeedback}
                disabled={!selectedOption}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  backgroundColor: selectedOption ? '#3b9eff' : '#444',
                  color: selectedOption ? 'white' : '#888',
                  fontSize: '14px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: selectedOption ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedOption) {
                    e.currentTarget.style.backgroundColor = '#2a8cdf';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOption) {
                    e.currentTarget.style.backgroundColor = '#3b9eff';
                  }
                }}
              >
                Submit
              </button>
            </div>
          )}

          {!feedbackVisible && !feedbackSubmitted && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#2a2a2a',
              borderRadius: '24px',
              padding: '8px 12px',
              border: '1px solid #444'
            }}>
              <button
                onClick={() => handleFeedback('positive')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ThumbsUp size={16} color="#888" />
              </button>
              <button
                onClick={() => handleFeedback('negative')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ThumbsDown size={16} color="#888" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Input Bar */}
      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px'
          }}>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#666',
              marginRight: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#aaa'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            onClick={startNewConversation}>
              <Plus size={20} />
            </button>
            <input
              type="text"
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ccc',
                fontSize: '16px'
              }}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              style={{
                backgroundColor: input.trim() && !isLoading ? '#3b9eff' : '#444',
                borderRadius: '50%',
                padding: '8px',
                marginLeft: '12px',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#2a8cdf';
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#3b9eff';
                }
              }}
            >
              <Send size={16} color="white" />
            </button>
          </div>
        </div>
        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          marginTop: '16px'
        }}>
          By Jenessa Disler · Brought to you by Effective Focus
        </p>
      </div>
    </div>
  );
}
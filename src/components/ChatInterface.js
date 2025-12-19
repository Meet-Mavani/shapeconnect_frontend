import React, { useState } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';

const ChatInterface = ({ messages, onSendMessage, isLoading, messagesEndRef }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 text-gray-500">
      <Bot className="w-5 h-5 text-primary-600" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm">ShapeConnect is analyzing...</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">ShapeConnect Assessment Agent</h3>
            <p className="text-sm text-gray-500">Technology requirement gathering specialist</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ShapeConnect</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              I'll guide you through a comprehensive technology assessment to understand your 
              business needs and identify improvement opportunities.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-primary-500' 
                  : message.isError 
                    ? 'bg-red-100' 
                    : 'bg-gray-100'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : message.isError ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-600" />
                )}
              </div>

              {/* Message Content */}
              <div className={`message-bubble ${
                message.sender === 'user' 
                  ? 'message-user' 
                  : message.isError 
                    ? 'bg-red-50 border border-red-200 text-red-800' 
                    : 'message-agent'
              }`}>
                {message.isTyping ? (
                  <TypingIndicator />
                ) : (
                  <>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    
                    {/* Category Information */}
                    {message.categoryData && message.categoryData.current_category && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="font-medium">Current Focus:</span>
                          <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {message.categoryData.current_category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-primary-200' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              !inputMessage.trim() || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
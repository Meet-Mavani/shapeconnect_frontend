import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, FileText, CheckCircle, Clock, Download, ArrowLeft, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import FileUpload from './FileUpload';
import assessmentService from '../services/assessmentService';

const ShapeConnectAssessment = ({ onBackToLanding }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [assessmentData, setAssessmentData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const assessmentStartedRef = useRef(false); // Ref to prevent duplicate calls

  const categories = [
    {
      id: 'business_environment',
      name: 'Business Environment',
      description: 'Business concerns, motivations, and decision-making processes',
      icon: '🏢',
      children: [
        { key: 'business_concerns', label: 'Define biggest business concerns' },
        { key: 'motivation_for_change', label: 'Motivation for technology assessment' },
        { key: 'decision_makers', label: 'Key decision makers identified' },
        { key: 'approval_process', label: 'Capital project approval process' }
      ]
    },
    {
      id: 'previous_implementation',
      name: 'Previous Implementation',
      description: 'Past system implementations and experiences',
      icon: '�',
      children: [
        { key: 'last_implementation', label: 'Last system implementation experience' },
        { key: 'support_quality', label: 'Service provider support assessment' },
        { key: 'promise_delivery', label: 'Current systems promise fulfillment' },
        { key: 'success_criteria', label: 'Future implementation success criteria' },
        { key: 'regrettable_decisions', label: 'Regrettable system decisions' }
      ]
    },
    {
      id: 'current_technology',
      name: 'Current Technology Usage',
      description: 'Existing software systems and technology usage',
      icon: '💻',
      children: [
        { key: 'email_document_environment', label: 'Email and document management environment' },
        { key: 'software_inventory', label: 'Complete software systems inventory' },
        { key: 'committed_systems', label: 'Non-changeable committed systems' },
        { key: 'data_storage', label: 'Business data storage and security' },
        { key: 'frustrating_systems', label: 'Most frustrating systems identification' },
        { key: 'customer_experience', label: 'Website and systems customer experience' }
      ]
    },
    {
      id: 'improvement_opportunities',
      name: 'Improvement Opportunities',
      description: 'Areas for enhancement and automation',
      icon: '🚀',
      children: [
        { key: 'improvement_inspiration', label: 'Recent improvement opportunities identified' },
        { key: 'automation_candidates', label: 'Manual tasks for automation' },
        { key: 'process_support_assessment', label: 'Business process support ratings' },
        { key: 'technology_leverage', label: 'Technology leverage opportunities' },
        { key: 'systems_partner_interest', label: 'Business Systems Partner consideration' }
      ]
    },
    {
      id: 'software_details',
      name: 'Software-Specific Details',
      description: 'Detailed assessment of each software system',
      icon: '⚙️',
      children: []
    },
    {
      id: 'closing_questions',
      name: 'Closing Questions',
      description: 'Final insights and additional information',
      icon: '✅',
      children: [
        { key: 'additional_information', label: 'Additional information from client' },
        { key: 'client_questions', label: 'Questions from client' }
      ]
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync uploaded files from service on mount
  useEffect(() => {
    setUploadedFiles(assessmentService.getUploadedFiles());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = useCallback((content, sender, type = 'normal', isMarkdown = false) => {
    const newMessage = {
      id: Date.now(),
      content,
      sender,
      type,
      isMarkdown,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Removed showFinalReport as it's not currently used

  // Removed handleAgentResponse as we're now using streaming

  // Streaming callbacks
  const handleStreamChunk = useCallback((chunk) => {
    setStreamingContent(prev => prev + chunk);
  }, []);

  const handleStreamComplete = useCallback((finalContent) => {
    setIsStreaming(false);

    let contentToProcess = finalContent || streamingContent;

    if (contentToProcess) {
      // Add the complete message with markdown support
      addMessage(contentToProcess, 'agent', 'normal', true);

      // Extract assessment data using the service method
      const extractedData = assessmentService.extractAssessmentData(contentToProcess);

      if (extractedData) {
        console.log('Extracted assessment data:', extractedData);
        setAssessmentData(extractedData);
      } else {
        console.log('No structured assessment data found in response');
        console.log('Content processed:', contentToProcess.substring(0, 500) + '...');
      }
    }

    setStreamingContent('');
  }, [addMessage, streamingContent]);

  const handleStreamError = useCallback((error) => {
    setIsStreaming(false);
    setStreamingContent('');
    console.error('Streaming error:', error);
    addMessage('Failed to receive response. Please try again.', 'agent', 'error');
  }, [addMessage]);

  const startAssessment = useCallback(async () => {
    // Use ref to prevent duplicate calls (works even with React.StrictMode)
    if (assessmentStartedRef.current) {
      console.log('Assessment already started, skipping duplicate call');
      return;
    }

    assessmentStartedRef.current = true;
    // setConversationStarted(true);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const prompt = "start shapeconnect requirement gathering from scratch";
      await assessmentService.sendMessageStream(prompt, {
        onChunk: handleStreamChunk,
        onComplete: handleStreamComplete,
        onError: handleStreamError
      });
    } catch (error) {
      console.error('Failed to start assessment:', error);
      addMessage('Failed to start assessment. Please try again.', 'agent', 'error');
      // Reset ref on error so user can retry
      assessmentStartedRef.current = false;
      // setConversationStarted(false);
      setIsStreaming(false);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  }, [handleStreamChunk, handleStreamComplete, handleStreamError, addMessage]);

  // Auto-start assessment when component mounts - only run once
  useEffect(() => {
    startAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isStreaming) return;

    const userMessage = inputMessage.trim();
    addMessage(userMessage, 'user');
    setInputMessage('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      await assessmentService.sendMessageStream(userMessage, {
        onChunk: handleStreamChunk,
        onComplete: handleStreamComplete,
        onError: handleStreamError
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage('Failed to send message. Please try again.', 'agent', 'error');
      setIsStreaming(false);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };



  const getCategoryStatus = (categoryId) => {
    if (!assessmentData?.information_status) return 'pending';

    const categoryData = assessmentData.information_status[categoryId];
    return assessmentService.getCategoryStatus(categoryData);
  };

  const getChildItemStatus = (categoryId, childKey) => {
    if (!assessmentData?.information_status?.[categoryId]?.[childKey]) return 'pending';

    const childData = assessmentData.information_status[categoryId][childKey];

    // Handle special case for process_support_assessment which has sub_processes
    if (childKey === 'process_support_assessment' && childData.value) {
      if (childData.value === 'COMPLETE') return 'completed';
      if (childData.value === 'INCOMPLETE') return 'in-progress';
      return 'pending';
    }

    // Handle regular fields
    if (childData.value) {
      if (childData.value === 'COMPLETE') return 'completed';
      if (childData.value === 'INCOMPLETE') return 'in-progress';
      return 'pending';
    }

    return 'pending';
  };



  const getCurrentCategory = () => {
    if (!assessmentData?.current_category) return null;

    const currentCat = assessmentData.current_category.toLowerCase();

    // Map agent category names to frontend category IDs
    const categoryMapping = {
      'business_environment': 'business_environment',
      'previous_implementation': 'previous_implementation',
      'assessing previous implementation': 'previous_implementation',
      'current_technology': 'current_technology',
      'current technology usage': 'current_technology',
      'improvement_opportunities': 'improvement_opportunities',
      'opportunities for improvement': 'improvement_opportunities',
      'software_details': 'software_details',
      'software-specific details': 'software_details',
      'closing_questions': 'closing_questions',
      'closing questions': 'closing_questions'
    };

    // Check for exact matches first
    if (categoryMapping[currentCat]) {
      return categoryMapping[currentCat];
    }

    // Check for partial matches (e.g., "Software-Specific Details - CRM")
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (currentCat.includes(key) || currentCat.includes(value)) {
        return value;
      }
    }

    return null;
  };

  const getProgress = () => {
    if (!assessmentData?.information_status) {
      return { completed: 0, total: 6, percentage: 0 };
    }

    const categoryIds = [
      'business_environment',
      'previous_implementation',
      'current_technology',
      'improvement_opportunities',
      'software_details',
      'closing_questions'
    ];

    let completed = 0;

    categoryIds.forEach(categoryId => {
      const status = getCategoryStatus(categoryId);
      if (status === 'completed') {
        completed++;
      }
    });

    return {
      completed,
      total: categoryIds.length,
      percentage: Math.round((completed / categoryIds.length) * 100)
    };
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const progress = getProgress();
  const currentCategory = getCurrentCategory();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching reference design */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-800">SHAPE</span>
                  <span className="text-xl font-normal text-blue-600">CONNECT</span>
                </div>
              </div>
              
              {/* Navigation items */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Find Solutions</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">For Vendors</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Industries</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Knowledge Hub</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">FAQ</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Contact</a>
              </nav>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToLanding}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                LOGOUT
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with 15:70:15 layout */}
      <div className="w-full">
        <div className="flex h-screen-minus-header">
          {/* Left Sidebar - 15% */}
          <div className={`bg-blue-50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-1/6'} min-w-0 border-r border-blue-100`}>

            <div className="p-4 h-full overflow-y-auto">
              {/* Sidebar toggle button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mb-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              {!sidebarCollapsed && (
                <>
                  {/* Assessment Progress Header */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">SoftwareConnect™ Onboarding</h2>
                    <div className="space-y-3">
                      {/* Step indicators matching reference */}
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-white">1</div>
                        <span className="text-sm text-gray-600">Get Started</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium text-white">2</div>
                        <span className="text-sm font-medium text-blue-600">Your Strategic Goals</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-white">3</div>
                        <span className="text-sm text-gray-600">Diagnostic of Current Tools</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-white">4</div>
                        <span className="text-sm text-gray-600">Schedule with an Expert</span>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Document Upload
                    </h3>
                    <FileUpload
                      onFilesChange={setUploadedFiles}
                      uploadedFiles={uploadedFiles}
                    />
                  </div>

                  {/* Timeline Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Assessment Progress
                      </h3>
                    </div>

                    {/* Progress Overview */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className="text-xs font-medium text-gray-600">
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Timeline Categories */}
                    <div className="space-y-1">
                      {categories.map((category, index) => {
                        const status = getCategoryStatus(category.id);
                        const isCurrent = currentCategory === category.id;
                        const isExpanded = expandedCategories[category.id];
                        const hasChildren = category.children && category.children.length > 0;

                        return (
                          <div key={category.id} className="relative">
                            {/* Timeline Line */}
                            {index < categories.length - 1 && (
                              <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-200"></div>
                            )}

                            {/* Category Item */}
                            <div
                              className={`timeline-item ${status === 'completed'
                                ? 'completed'
                                : status === 'in-progress' || isCurrent
                                  ? 'in-progress'
                                  : 'pending'
                                }`}
                            >
                              <div
                                className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-blue-50"
                                onClick={() => hasChildren && toggleCategory(category.id)}
                              >
                                {/* Timeline Dot */}
                                <div className={`timeline-dot ${status === 'completed'
                                  ? 'bg-green-500'
                                  : status === 'in-progress' || isCurrent
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                                  }`}>
                                  <span className="text-xs">{category.icon}</span>
                                </div>

                                {/* Category Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="text-xs font-medium text-gray-900 truncate">
                                        {category.name}
                                      </h4>
                                      {hasChildren && (
                                        <div className="flex-shrink-0">
                                          {isExpanded ? (
                                            <ChevronDown className="w-3 h-3 text-gray-400" />
                                          ) : (
                                            <ChevronRight className="w-3 h-3 text-gray-400" />
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      {getStatusIcon(status)}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                                </div>
                              </div>

                              {/* Child Items */}
                              {hasChildren && isExpanded && (
                                <div className="ml-6 mt-2 space-y-1">
                                  {category.children.map((child) => {
                                    const childStatus = getChildItemStatus(category.id, child.key);

                                    return (
                                      <div
                                        key={child.key}
                                        className="flex items-center space-x-2 p-2 rounded-md bg-blue-25"
                                      >
                                        <div className="flex-shrink-0">
                                          {getStatusIcon(childStatus)}
                                        </div>
                                        <span className="text-xs text-gray-700 flex-1">
                                          {child.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content Area - 70% */}
          <div className="flex-1 bg-white flex flex-col">
            {/* Content Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Strategic Goals</h2>
                  <p className="text-sm text-gray-600">Can you list the top three strategic goals you feel are least supported by your current technology stack?</p>
                </div>
                {currentCategory && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Current: {categories.find(c => c.id === currentCategory)?.name}
                  </span>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-4xl p-4 rounded-lg message-bubble ${message.sender === 'user'
                      ? 'message-user'
                      : message.type === 'error'
                        ? 'message-error'
                        : message.type === 'success'
                          ? 'message-success'
                          : 'message-agent'
                      }`}
                  >
                    <div className="message-content">
                      {message.isMarkdown ? (
                        <ReactMarkdown
                          className="prose prose-sm max-w-none"
                          components={{
                            // Custom styling for markdown elements
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            table: ({ children }) => <table className="w-full border-collapse border border-gray-300 mb-2">{children}</table>,
                            th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">{children}</th>,
                            td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                            hr: () => <hr className="my-3 border-gray-300" />
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    <div className={`text-xs mt-2 opacity-70 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming Content */}
              {isStreaming && streamingContent && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-4xl p-4 rounded-lg message-bubble message-agent">
                    <div className="message-content">
                      <ReactMarkdown
                        className="prose prose-sm max-w-none"
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          table: ({ children }) => <table className="w-full border-collapse border border-gray-300 mb-2">{children}</table>,
                          th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">{children}</th>,
                          td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                          hr: () => <hr className="my-3 border-gray-300" />
                        }}
                      >
                        {streamingContent}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">Streaming...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && !isStreaming && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">ShapeConnect is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-200">
              <div className="max-w-4xl">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isStreaming ? "Waiting for response..." : "Type your answer here..."}
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows="4"
                  disabled={isLoading || isStreaming}
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading || isStreaming}
                    className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isStreaming ? 'Streaming...' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - 15% */}
          <div className="w-1/6 bg-gray-50 border-l border-gray-200">
            <div className="p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-lg">?</span>
                </div>
                <p className="text-xs text-gray-600">Need help? Contact support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeConnectAssessment;
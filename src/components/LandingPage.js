import React, { useState, useEffect } from 'react';
import { MessageCircle, FileText, Play, Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import assessmentService from '../services/assessmentService';

const LandingPage = ({ onStartChat }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Generate session ID on component mount to enable file uploads
  useEffect(() => {
    if (!assessmentService.getSessionId() || assessmentService.getSessionId() === 'no-session') {
      assessmentService.generateNewSession();
    }
    // Load any existing uploaded files
    setUploadedFiles(assessmentService.getUploadedFiles());
  }, []);

  const handleStartChat = () => {
    // Ensure session ID exists before starting (but don't regenerate to preserve uploaded files)
    if (!assessmentService.getSessionId() || assessmentService.getSessionId() === 'no-session') {
      assessmentService.generateNewSession();
    }
    // Files uploaded on LandingPage are already stored in assessmentService
    // They will be included in associated_files when assessment starts
    onStartChat();
  };

  const handleFilesChange = (files) => {
    setUploadedFiles(files);
  };

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
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                LOGOUT
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
                DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ShapeConnect Assessment
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your comprehensive technology assessment journey. Our AI-powered system will guide you through 
            6 key categories to understand your business technology needs and identify improvement opportunities.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Assessment</h3>
            <p className="text-gray-600">Guided conversation through 6 comprehensive assessment categories</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Analysis</h3>
            <p className="text-gray-600">Upload relevant documents to enhance the assessment process</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Progress</h3>
            <p className="text-gray-600">Track your progress through each assessment category</p>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="card mb-8">
          <div className="text-center mb-6">
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents (Optional)</h3>
            <p className="text-gray-600">
              Upload any relevant documents before starting the assessment to provide additional context
            </p>
          </div>
          <FileUpload 
            onFilesChange={handleFilesChange}
            uploadedFiles={uploadedFiles}
          />
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartChat}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Assessment
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Ready to start your comprehensive technology assessment
          </p>
        </div>

        {/* Assessment Categories Preview */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">Assessment Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🏢', name: 'Business Environment', desc: 'Business concerns and motivations' },
              { icon: '📋', name: 'Previous Implementation', desc: 'Past system experiences' },
              { icon: '💻', name: 'Current Technology', desc: 'Existing software systems' },
              { icon: '🚀', name: 'Improvement Opportunities', desc: 'Areas for enhancement' },
              { icon: '⚙️', name: 'Software Details', desc: 'Detailed system assessment' },
              { icon: '✅', name: 'Closing Questions', desc: 'Final insights and wrap-up' }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
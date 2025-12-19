import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FinalReport = ({ markdownContent, onClose, assessmentData }) => {
  const [activeTab, setActiveTab] = useState('report');

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([markdownContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `shapeconnect-assessment-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSummaryStats = () => {
    if (!assessmentData?.information_status) return null;

    const categories = Object.keys(assessmentData.information_status);
    let totalFields = 0;
    let completedFields = 0;

    categories.forEach(categoryKey => {
      const category = assessmentData.information_status[categoryKey];
      Object.keys(category).forEach(fieldKey => {
        if (fieldKey !== 'category_label' && typeof category[fieldKey] === 'object' && category[fieldKey].value) {
          totalFields++;
          if (category[fieldKey].value === 'COMPLETE') {
            completedFields++;
          }
        }
      });
    });

    return {
      totalFields,
      completedFields,
      completionRate: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0,
      categories: categories.length
    };
  };

  const stats = getSummaryStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Technology Assessment Report</h2>
              <p className="text-sm text-gray-500">Complete analysis and recommendations</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.categories}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">{stats.completedFields}</div>
                <div className="text-sm text-gray-600">Fields Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalFields}</div>
                <div className="text-sm text-gray-600">Total Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'report'
                ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Full Report
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'summary'
                ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Executive Summary
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'report' ? (
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    table: ({ children }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-gray-50">{children}</tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                        {children}
                      </td>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium text-gray-700 mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <ExecutiveSummary assessmentData={assessmentData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ExecutiveSummary = ({ assessmentData }) => {
  if (!assessmentData?.information_status) {
    return <div className="text-gray-500">No assessment data available</div>;
  }

  const getCategoryStatus = (categoryData) => {
    const fields = Object.keys(categoryData).filter(key => 
      key !== 'category_label' && 
      typeof categoryData[key] === 'object' && 
      categoryData[key].value
    );
    
    const completedFields = fields.filter(key => 
      categoryData[key].value === 'COMPLETE'
    ).length;

    return {
      total: fields.length,
      completed: completedFields,
      percentage: fields.length > 0 ? Math.round((completedFields / fields.length) * 100) : 0
    };
  };

  const categories = [
    { key: 'business_environment', name: 'Business Environment' },
    { key: 'previous_implementation', name: 'Previous Implementation' },
    { key: 'current_technology', name: 'Current Technology Usage' },
    { key: 'improvement_opportunities', name: 'Improvement Opportunities' },
    { key: 'software_details', name: 'Software-Specific Details' },
    { key: 'closing_questions', name: 'Closing Questions' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
        <p className="text-gray-600 mb-6">
          This technology assessment provides a comprehensive analysis of your current systems, 
          processes, and opportunities for improvement.
        </p>
      </div>

      <div className="grid gap-4">
        {categories.map(category => {
          const categoryData = assessmentData.information_status[category.key];
          if (!categoryData) return null;

          const status = getCategoryStatus(categoryData);
          
          return (
            <div key={category.key} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <div className="flex items-center space-x-2">
                  {status.percentage === 100 ? (
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning-600" />
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {status.completed}/{status.total} ({status.percentage}%)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    status.percentage === 100 ? 'bg-success-500' : 'bg-warning-500'
                  }`}
                  style={{ width: `${status.percentage}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-600">
                {status.percentage === 100 ? (
                  <span className="text-success-700 font-medium">✓ Assessment completed</span>
                ) : (
                  <span className="text-warning-700">In progress - {status.total - status.completed} fields remaining</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="font-semibold text-primary-900 mb-2">Next Steps</h3>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Review the detailed assessment findings</li>
          <li>• Prioritize improvement opportunities based on business impact</li>
          <li>• Develop an implementation roadmap</li>
          <li>• Consider engaging with ShapeConnect for implementation support</li>
        </ul>
      </div>
    </div>
  );
};

export default FinalReport;
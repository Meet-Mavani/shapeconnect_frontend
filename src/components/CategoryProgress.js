import React from 'react';
import { CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const CategoryProgress = ({ categories, assessmentData }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-warning-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  const getCategoryDetails = (categoryId) => {
    if (!assessmentData?.information_status) return null;
    
    const categoryData = assessmentData.information_status[categoryId];
    if (!categoryData) return null;

    // Count completed fields in the category
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
      fields: fields.map(key => ({
        name: categoryData[key].label || key,
        status: categoryData[key].value || 'INCOMPLETE'
      }))
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Assessment Progress</h2>
      </div>

      <div className="space-y-4">
        {categories.map((category, index) => {
          const details = getCategoryDetails(category.id);
          
          return (
            <div
              key={category.id}
              className={`category-card category-${category.status} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(category.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {category.name}
                      </h3>
                      <span className={`status-badge status-${category.status}`}>
                        {getStatusText(category.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                    
                    {/* Progress Details */}
                    {details && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Fields Completed</span>
                          <span>{details.completed}/{details.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              category.status === 'completed' ? 'bg-success-500' :
                              category.status === 'in-progress' ? 'bg-warning-500' :
                              'bg-gray-300'
                            }`}
                            style={{ 
                              width: `${details.total > 0 ? (details.completed / details.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Question Preview */}
                    {category.status === 'in-progress' && (
                      <div className="mt-3 p-2 bg-warning-50 rounded border border-warning-200">
                        <p className="text-xs text-warning-800 font-medium mb-1">Current Focus:</p>
                        <p className="text-xs text-warning-700">
                          {category.questions[0]}
                          {category.questions.length > 1 && ` (+${category.questions.length - 1} more)`}
                        </p>
                      </div>
                    )}

                    {/* Completion Summary */}
                    {category.status === 'completed' && details && (
                      <div className="mt-3 p-2 bg-success-50 rounded border border-success-200">
                        <p className="text-xs text-success-800 font-medium">
                          ✓ All {details.total} requirements completed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {category.status !== 'pending' && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                )}
              </div>

              {/* Detailed Field Status (for in-progress categories) */}
              {category.status === 'in-progress' && details && details.fields.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-2">Field Status:</p>
                  <div className="space-y-1">
                    {details.fields.slice(0, 3).map((field, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate flex-1">{field.name}</span>
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                          field.status === 'COMPLETE' 
                            ? 'bg-success-100 text-success-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {field.status === 'COMPLETE' ? '✓' : '○'}
                        </span>
                      </div>
                    ))}
                    {details.fields.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{details.fields.length - 3} more fields...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-medium text-gray-900">
            {categories.filter(c => c.status === 'completed').length} / {categories.length}
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(categories.filter(c => c.status === 'completed').length / categories.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProgress;
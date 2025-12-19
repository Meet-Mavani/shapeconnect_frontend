import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import assessmentService from '../services/assessmentService';

const FileUpload = ({ onFilesChange, uploadedFiles }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadError(null);
    
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" exceeds 50MB limit`);
        }
        
        const uploadedFile = await assessmentService.uploadFile(file);
        return uploadedFile;
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setUploadError(error.message);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        onFilesChange(assessmentService.getUploadedFiles());
      }
    } catch (error) {
      setUploadError('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  }, [onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    disabled: uploading
  });

  const removeFile = async (s3Path) => {
    try {
      await assessmentService.deleteFile(s3Path);
      onFilesChange(assessmentService.getUploadedFiles());
    } catch (error) {
      console.error('Failed to delete file:', error);
      setUploadError('Failed to delete file');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-6 h-6 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-sm text-gray-600">
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Uploading files...</span>
              </div>
            ) : isDragActive ? (
              <span className="text-blue-600 font-medium">Drop files here...</span>
            ) : (
              <div>
                <span className="font-medium text-blue-600">Click to upload</span>
                <span className="text-gray-500"> or drag and drop</span>
                <div className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, TXT, CSV, XLS, XLSX (Max 50MB)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {assessmentService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.s3Path)}
                  className="ml-2 p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
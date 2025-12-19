import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

class AssessmentService {
  constructor() {
    this.sessionId = null;
    this.uploadedFiles = [];
  }

  generateSessionId() {
    // Generate UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  generateNewSession() {
    this.sessionId = this.generateSessionId();
    this.uploadedFiles = [];
    return this.sessionId;
  }

  getSessionId() {
    return this.sessionId || 'no-session';
  }

  // File upload methods
  async uploadFile(file) {
    const formData = new FormData();
    const uniqueFileName = `${this.sessionId}_${file.name}`;
    
    formData.append('file', file);
    formData.append('session_id', this.sessionId);
    formData.append('filename', uniqueFileName);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/upload-file/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const fileInfo = {
        name: file.name,
        s3Path: response.data.s3_path,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      
      this.uploadedFiles.push(fileInfo);
      return fileInfo;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error(`Upload failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  async deleteFile(s3Path) {
    try {
      await axios.delete(`${API_BASE_URL}/delete-file/`, {
        params: { s3_path: s3Path }
      });
      
      this.uploadedFiles = this.uploadedFiles.filter(file => file.s3Path !== s3Path);
      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error(`Delete failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  async listSessionFiles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/list-session-files/${this.sessionId}`);
      return response.data.files;
    } catch (error) {
      console.error('List files failed:', error);
      return [];
    }
  }

  getUploadedFiles() {
    return this.uploadedFiles;
  }

  // Get associated_files array for payload - only includes files if they exist
  getAssociatedFiles() {
    if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
      return [];
    }
    // Ensure S3 paths are in correct format (s3://bucket/path)
    return this.uploadedFiles
      .map(file => file.s3Path)
      .filter(path => path && path.startsWith('s3://'));
  }

  // Assessment methods
  async startAssessment() {
    // Always use the base prompt as requested
    const prompt = "start shapeconnect requirement gathering from scratch";
    return this.sendMessage(prompt);
  }

  async sendMessage(message) {
    const payload = {
      prompt: message,
      enable_thinking: false,
      multi_agent: false,
      session_id: this.sessionId,
      visual_output: false,
      enable_knowledgebase: false,
      agent_config: {
        main: {
          name: "mainAgent",
          model_id: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
          region: "us-east-1",
          temperature: 0.3,
          top_p: 0.95,
          max_tokens: 0,
          thinking_max_tokens: 8000,
          mcp_config: [
            {
              mcp_url: "",
              mcp_type: ""
            }
          ],
          instructions: "You are a ShapeConnect Technology Assessment requirement gathering Agent focused on understanding business technology needs, current systems, and operational workflows. Use the ShapeConnect assessment instructions from Shapeconnect_agent_instruction_ver_1.txt"
        },
        collaborator: []
      },
      s3: {
        bucket_name: "local-aihouse",
        region: "us-east-1"
      },
      telemetry_config: {
        zipkin_endpoint: "",
        telemetry_enabled: false,
        service_name: ""
      },
      agent_state: {
        associated_files: this.getAssociatedFiles()
      },
      s3_conversation_config: {
        sliding_window_size: 30,
        prefix: "local-shapeconnect-documents/"
      },
      kb_details: []
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/invoke_strands_agent/`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return this.parseAgentResponse(response.data);
    } catch (error) {
      console.error('Assessment request failed:', error);
      throw new Error(`Request failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Streaming version of sendMessage following reference pattern
  async sendMessageStream(message, callbacks) {
    const { onChunk, onComplete, onError } = callbacks;
    
    const payload = {
      prompt: message,
      enable_thinking: false,
      multi_agent: false,
      session_id: this.sessionId,
      visual_output: false,
      enable_knowledgebase: false,
      agent_config: {
        main: {
          name: "mainAgent",
          model_id: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
          region: "us-east-1",
          temperature: 0.3,
          top_p: 0.95,
          max_tokens: 0,
          thinking_max_tokens: 8000,
          mcp_config: [
            {
              mcp_url: "",
              mcp_type: ""
            }
          ],
          instructions: "You are a ShapeConnect Technology Assessment requirement gathering Agent focused on understanding business technology needs, current systems, and operational workflows. Use the ShapeConnect assessment instructions from Shapeconnect_agent_instruction_ver_1.txt"
        },
        collaborator: []
      },
      s3: {
        bucket_name: "local-aihouse",
        region: "us-east-1"
      },
      telemetry_config: {
        zipkin_endpoint: "",
        telemetry_enabled: false,
        service_name: ""
      },
      agent_state: {
        associated_files: this.getAssociatedFiles()
      },
      s3_conversation_config: {
        sliding_window_size: 30,
        prefix: "local-shapeconnect-documents/"
      },
      kb_details: []
    };

    try {
      // Get the base URL and headers from configuration - following reference pattern
      const baseURL = process.env.REACT_APP_API_URL || API_BASE_URL;
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Add module header for service identification
      headers['x-module'] = 'shapeconnect-assessment';

      // Create the full URL
      const url = `${baseURL}/invoke_strands_agent/`;

      // Make the fetch request for streaming
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and non-data lines
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
              continue;
            }

            // Extract JSON from the data line
            const jsonStr = trimmedLine.substring(6); // Remove 'data: ' prefix

            try {
              const data = JSON.parse(jsonStr);

              // Handle error events from the stream
              if (data.type === 'error') {
                const errorMessage = data.error || data.message || 'Stream error occurred';
                onError({
                  message: errorMessage,
                  isStreamError: true,
                  status: data.status,
                });
                return;
              }

              // Only process stream_chunk types and extract the data field
              if (data.type === 'stream_chunk' && data.data) {
                // Call the chunk callback with only the data field content
                onChunk(data.data);
              }
              
              // Handle final summary with complete response
              if (data.type === 'final_summary' && data.final_output) {
                onComplete(data.final_output);
                return;
              }
              
              // Check if streaming is done - match reference code exactly
              if (data.isDone && data.complete && data.status === 'complete') {
                onComplete(data.complete);
                return;
              }
            } catch (parseError) {
              console.error(
                'Error parsing JSON chunk:',
                parseError,
                'Raw data:',
                jsonStr,
              );
            }
          }
        }

        // If we reach here, the stream ended without an explicit isDone=true
        onComplete(false);
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError(error);
      throw error;
    }
  }

  parseAgentResponse(responseText) {
    try {
      // Try to parse JSON response from the agent
      let jsonResponse;
      
      if (typeof responseText === 'object') {
        jsonResponse = responseText;
      } else {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        }
      }
      
      if (jsonResponse) {
        // Look for the data field in the response
        if (jsonResponse.data) {
          return {
            type: 'structured',
            data: jsonResponse.data,
            raw: responseText
          };
        }
        
        // Fallback to category_results if data field not found
        if (jsonResponse.category_results) {
          return {
            type: 'structured',
            data: jsonResponse.category_results,
            raw: responseText
          };
        }
        
        // If it's a direct response object, use it as data
        return {
          type: 'structured',
          data: jsonResponse,
          raw: responseText
        };
      }
      
      // Fallback for non-JSON responses
      return {
        type: 'text',
        data: { agent_message: responseText },
        raw: responseText
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        type: 'text',
        data: { agent_message: responseText },
        raw: responseText
      };
    }
  }

  // Extract structured assessment data from agent response
  extractAssessmentData(responseText) {
    try {
      let jsonResponse;
      
      if (typeof responseText === 'object') {
        jsonResponse = responseText;
      } else {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        }
      }
      
      if (jsonResponse && jsonResponse.category_results) {
        const categoryResults = jsonResponse.category_results;
        
        return {
          information_status: categoryResults.information_status,
          current_category: categoryResults.current_category,
          assessment_complete: categoryResults.assessment_complete,
          software_deep_dive: categoryResults.software_deep_dive,
          agent_message: categoryResults.agent_message
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting assessment data:', error);
      return null;
    }
  }

  // Category status helpers
  getCategoryStatus(categoryData) {
    if (!categoryData) return 'pending';
    
    const fields = Object.keys(categoryData).filter(key => 
      key !== 'category_label' && 
      typeof categoryData[key] === 'object' && 
      categoryData[key].value
    );
    
    if (fields.length === 0) return 'pending';
    
    const completedFields = fields.filter(key => 
      categoryData[key].value === 'COMPLETE'
    );
    
    const incompleteFields = fields.filter(key => 
      categoryData[key].value === 'INCOMPLETE'
    );
    
    // If all fields are complete, category is completed
    if (completedFields.length === fields.length) return 'completed';
    
    // If any field is complete or incomplete (not pending), category is in progress
    if (completedFields.length > 0 || incompleteFields.length > 0) return 'in-progress';
    
    // Otherwise, category is pending
    return 'pending';
  }

  getOverallProgress(informationStatus) {
    if (!informationStatus) return { completed: 0, total: 6, percentage: 0 };
    
    const categories = [
      'business_environment',
      'previous_implementation', 
      'current_technology',
      'improvement_opportunities',
      'software_details',
      'closing_questions'
    ];
    
    let completed = 0;
    categories.forEach(category => {
      if (category === 'software_details') {
        if (informationStatus[category]?.software_details_complete) {
          completed++;
        }
      } else {
        const status = this.getCategoryStatus(informationStatus[category]);
        if (status === 'completed') {
          completed++;
        }
      }
    });
    
    return {
      completed,
      total: categories.length,
      percentage: Math.round((completed / categories.length) * 100)
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

const assessmentServiceInstance = new AssessmentService();
export default assessmentServiceInstance;
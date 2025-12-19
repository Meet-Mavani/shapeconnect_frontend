# ShapeConnect Frontend Setup Guide

## 🚀 Quick Setup

### 1. Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **ShapeConnect Backend** running on `http://127.0.0.1:8000`

### 2. Installation Steps

```bash
# Navigate to the frontend directory
cd shapeconnect-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open automatically at `http://localhost:3000`

## 🔧 Configuration

### Backend Connection
The frontend is configured to connect to your FastAPI backend at `http://127.0.0.1:8000`. 

If your backend runs on a different URL, update `src/services/assessmentService.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:port';
```

### Environment Variables (Optional)
Create a `.env` file in the root directory for custom configuration:
```
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_S3_BUCKET=local-aihouse
```

## 📁 Project Structure Overview

```
shapeconnect-frontend/
├── src/
│   ├── components/
│   │   ├── ShapeConnectAssessment.js    # Main assessment interface
│   │   └── FileUpload.js                # Document upload component
│   ├── services/
│   │   └── assessmentService.js         # API communication service
│   ├── App.js                           # Root application component
│   ├── index.js                         # Application entry point
│   └── index.css                        # Global styles with Tailwind CSS
├── public/
│   ├── index.html                       # HTML template
│   └── manifest.json                    # PWA manifest
├── package.json                         # Dependencies and scripts
├── tailwind.config.js                   # Tailwind CSS configuration
└── postcss.config.js                    # PostCSS configuration
```

## 🎯 Key Features

### Assessment Flow
- **6 Sequential Categories**: Business Environment → Previous Implementation → Current Technology → Improvement Opportunities → Software Details → Closing Questions
- **Real-time Progress Tracking**: Visual indicators show completed/in-progress/pending status
- **Smart Prompts**: Different initial prompts based on document upload status

### Document Management
- **Drag & Drop Upload**: Intuitive file upload interface
- **Multiple File Support**: Upload multiple documents simultaneously
- **File Validation**: 50MB size limit, supported formats (PDF, DOC, DOCX, TXT, CSV, XLS, XLSX)
- **S3 Integration**: Files stored in `s3://local-aihouse/uploaded-files/`

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with smooth animations
- **Real-time Chat**: Instant messaging with typing indicators
- **Progress Visualization**: Dynamic progress bars and category status

## 🔌 API Integration

The frontend communicates with your FastAPI backend through these endpoints:

### File Operations
```javascript
POST /upload-file/          // Upload documents
DELETE /delete-file/        // Delete documents  
GET /list-session-files/    // List session files
```

### Assessment
```javascript
POST /invoke_strands_agent/ // Send messages to agent
```

### Request Payload Structure
```javascript
{
  "prompt": "user message",
  "session_id": "session_123_abc",
  "agent_config": {
    "main": {
      "instructions": "Use ShapeConnect assessment instructions",
      "model_id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
      "temperature": 0.1,
      "max_tokens": 4000
    },
    "associated_files": ["s3://local-aihouse/uploaded-files/..."]
  },
  "s3": {
    "bucket_name": "local-aihouse",
    "region": "us-east-1"
  }
}
```

## 🎨 Customization

### Styling
The application uses **Tailwind CSS** for styling. Key customization points:

1. **Colors**: Update `tailwind.config.js` for brand colors
2. **Components**: Modify component styles in respective `.js` files
3. **Global Styles**: Update `src/index.css` for global changes

### Categories
To modify assessment categories, update the `categories` array in `ShapeConnectAssessment.js`:
```javascript
const categories = [
  {
    id: 'business_environment',
    name: 'Business Environment',
    description: 'Business concerns and motivations',
    icon: '🏢'
  },
  // ... add or modify categories
];
```

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot connect to backend"**
   - Ensure FastAPI server is running on `http://127.0.0.1:8000`
   - Check CORS configuration in backend
   - Verify network connectivity

2. **File upload fails**
   - Check S3 bucket permissions
   - Verify AWS credentials configuration
   - Ensure file size is under 50MB

3. **Categories not updating**
   - Check agent response format in browser console
   - Verify backend is returning proper JSON structure
   - Check `assessmentService.parseAgentResponse()` method

4. **Styling issues**
   - Run `npm install` to ensure Tailwind CSS is installed
   - Check browser console for CSS errors
   - Verify `tailwind.config.js` configuration

### Debug Mode
Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
// Refresh the page
```

### Network Issues
Check browser Network tab for:
- Failed API requests
- CORS errors
- Timeout issues

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- **Desktop**: Full feature set with sidebar layout
- **Tablet**: Adapted layout with collapsible sidebar
- **Mobile**: Stacked layout optimized for touch interaction

## 🔒 Security Considerations

- **File Validation**: Client-side file type and size validation
- **Session Management**: Unique session IDs for isolation
- **Error Handling**: Secure error messages without sensitive data exposure
- **HTTPS**: Use HTTPS in production for secure communication

## 📊 Performance

### Optimization Features
- **Lazy Loading**: Components load as needed
- **Efficient Re-renders**: React optimization patterns
- **Smooth Animations**: CSS transitions and transforms
- **Memory Management**: Proper cleanup of event listeners

### Monitoring
- Check browser DevTools Performance tab
- Monitor network requests in Network tab
- Use React DevTools for component analysis

## 🚀 Deployment

### Development
```bash
npm start  # Runs on http://localhost:3000
```

### Production Build
```bash
npm run build  # Creates optimized build in /build folder
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Server Deployment**: Nginx, Apache
- **Cloud Platforms**: AWS S3 + CloudFront, Azure Static Web Apps

## 📞 Support

For issues or questions:
1. Check this setup guide
2. Review browser console for errors
3. Check network requests in DevTools
4. Verify backend connectivity and logs

## 🎉 Success Checklist

- [ ] Node.js installed (v16+)
- [ ] Dependencies installed (`npm install`)
- [ ] Backend running on port 8000
- [ ] Frontend accessible at `http://localhost:3000`
- [ ] File upload working
- [ ] Assessment conversation starting
- [ ] Categories updating based on progress
- [ ] No console errors

You're ready to use the ShapeConnect Assessment system! 🚀
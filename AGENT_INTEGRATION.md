# Agent Response Integration Guide

## Overview
This document explains how the frontend integrates with the ShapeConnect requirement gathering agent and maps the agent responses to the timeline view.

## Agent Response Format

The agent returns responses in this format:
```json
{
  "category_results": {
    "information_status": {
      "business_environment": {
        "category_label": "Business Environment",
        "business_concerns": {
          "label": "Define biggest business concerns",
          "value": "COMPLETE",
          "answer": "User's detailed answer..."
        },
        "motivation_for_change": {
          "label": "Motivation for technology assessment", 
          "value": "COMPLETE",
          "answer": "User's detailed answer..."
        }
        // ... other fields
      },
      "previous_implementation": {
        // ... similar structure
      }
      // ... other categories
    },
    "current_category": "Software-Specific Details - CRM",
    "assessment_complete": false,
    "agent_message": "Response message to user..."
  }
}
```

## Frontend Integration

### 1. Response Processing (`assessmentService.js`)

#### `extractAssessmentData(responseText)`
- Parses the agent response JSON
- Extracts `category_results` object
- Returns structured data for the timeline

#### `getCategoryStatus(categoryData)`
- Analyzes category completion status
- Returns: `'pending'`, `'in-progress'`, or `'completed'`
- Logic:
  - `'completed'`: All fields have `value: "COMPLETE"`
  - `'in-progress'`: Some fields are `"COMPLETE"` or `"INCOMPLETE"`
  - `'pending'`: No fields have been addressed

### 2. Timeline Mapping (`ShapeConnectAssessment.js`)

#### Category Mapping
Frontend categories map to agent categories:
```javascript
const categoryMapping = {
  'business_environment': 'business_environment',
  'previous_implementation': 'previous_implementation',
  'current_technology': 'current_technology', 
  'improvement_opportunities': 'improvement_opportunities',
  'software_details': 'software_details',
  'closing_questions': 'closing_questions'
};
```

#### Child Item Status
Each child item status is determined by the `value` field:
- `"COMPLETE"` → Green checkmark (completed)
- `"INCOMPLETE"` → Yellow clock (in-progress)  
- Missing/undefined → Gray circle (pending)

### 3. Real-time Updates

#### Streaming Integration
1. **Stream Processing**: Agent responses are streamed in real-time
2. **Data Extraction**: `handleStreamComplete` extracts structured data
3. **Timeline Update**: `setAssessmentData` triggers timeline re-render
4. **Status Calculation**: Progress and category statuses update automatically

#### Progress Calculation
```javascript
const getProgress = () => {
  // Count completed categories
  let completed = 0;
  categoryIds.forEach(categoryId => {
    if (getCategoryStatus(categoryId) === 'completed') {
      completed++;
    }
  });
  
  return {
    completed,
    total: 6,
    percentage: Math.round((completed / 6) * 100)
  };
};
```

## Category Definitions

### 1. Business Environment
- `business_concerns`: Define biggest business concerns
- `motivation_for_change`: Motivation for technology assessment
- `decision_makers`: Key decision makers identified
- `approval_process`: Capital project approval process

### 2. Previous Implementation
- `last_implementation`: Last system implementation experience
- `support_quality`: Service provider support assessment
- `promise_delivery`: Current systems promise fulfillment
- `success_criteria`: Future implementation success criteria
- `regrettable_decisions`: Regrettable system decisions

### 3. Current Technology Usage
- `email_document_environment`: Email and document management environment
- `software_inventory`: Complete software systems inventory
- `committed_systems`: Non-changeable committed systems
- `data_storage`: Business data storage and security
- `frustrating_systems`: Most frustrating systems identification
- `customer_experience`: Website and systems customer experience

### 4. Improvement Opportunities
- `improvement_inspiration`: Recent improvement opportunities identified
- `automation_candidates`: Manual tasks for automation
- `process_support_assessment`: Business process support ratings
- `technology_leverage`: Technology leverage opportunities
- `systems_partner_interest`: Business Systems Partner consideration

### 5. Software-Specific Details
- Dynamic based on discovered software systems
- Each software gets detailed 8-question assessment

### 6. Closing Questions
- `additional_information`: Additional information from client
- `client_questions`: Questions from client

## Visual Status Indicators

### Timeline Dots
- **Green**: Category completed (all fields COMPLETE)
- **Yellow**: Category in progress (some fields addressed)
- **Gray**: Category pending (no fields addressed)

### Child Items
- **✓ Green**: Field completed (`value: "COMPLETE"`)
- **⏰ Yellow**: Field in progress (`value: "INCOMPLETE"`)
- **○ Gray**: Field pending (no value or undefined)

## Testing the Integration

### 1. Console Logging
The integration includes console logging for debugging:
```javascript
console.log('Extracted assessment data:', extractedData);
```

### 2. Manual Testing
1. Start the assessment
2. Provide responses to agent questions
3. Watch timeline update in real-time
4. Verify category statuses match agent responses

### 3. Data Validation
Check that:
- Categories marked as completed show green status
- Child items reflect correct completion status
- Progress bar updates accurately
- Current category highlighting works

## Troubleshooting

### Common Issues

1. **Timeline not updating**: Check console for JSON parsing errors
2. **Wrong status colors**: Verify `value` field mapping in `getChildItemStatus`
3. **Category not highlighted**: Check `getCurrentCategory` mapping logic
4. **Progress not calculating**: Verify `getCategoryStatus` logic

### Debug Steps
1. Check browser console for extraction logs
2. Verify agent response format matches expected structure
3. Test individual status calculation functions
4. Validate category ID mapping

This integration ensures the timeline view accurately reflects the agent's assessment progress and provides real-time visual feedback to users.
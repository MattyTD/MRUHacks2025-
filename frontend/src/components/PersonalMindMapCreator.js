import React, { useState } from 'react';
import VisualMindMapEditor from './VisualMindMapEditor';
import './PersonalMindMapCreator.css';

const PersonalMindMapCreator = ({ onComplete, onCancel, initialData = null }) => {
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [mindMapData, setMindMapData] = useState(null);

  const handleVisualEditorComplete = (data) => {
    setMindMapData(data);
    onComplete(data);
  };

  const handleVisualEditorCancel = () => {
    setShowVisualEditor(false);
    onCancel();
  };

  if (showVisualEditor || initialData) {
    return (
      <VisualMindMapEditor
        onComplete={handleVisualEditorComplete}
        onCancel={handleVisualEditorCancel}
        initialData={initialData}
      />
    );
  }

  return (
    <div className="personal-mindmap-creator-overlay" onClick={onCancel}>
      <div className="personal-mindmap-creator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Your Personal Mind Map</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="creation-options">
            <h3>Choose Creation Method</h3>
            <p>How would you like to create your personal mind map?</p>
            
            <div className="creation-methods">
              <button 
                className="creation-method visual-editor"
                onClick={() => setShowVisualEditor(true)}
              >
                <div className="method-icon">🎨</div>
                <div className="method-content">
                  <h4>Visual Editor</h4>
                  <p>Create your mind map visually with drag-and-drop nodes, layers, and connections. Similar to draw.io.</p>
                  <span className="method-features">• Layered node system • Visual connections • Drag & drop • Real-time editing</span>
                </div>
              </button>
              
              <button 
                className="creation-method guided-form"
                onClick={() => {
                  // Keep the old form-based approach as fallback
                  alert('Form-based creation is being replaced by the visual editor. Please use Visual Editor.');
                }}
              >
                <div className="method-icon">📝</div>
                <div className="method-content">
                  <h4>Guided Form</h4>
                  <p>Step-by-step form creation with predefined options and templates.</p>
                  <span className="method-features">• Step-by-step process • Templates • Quick setup</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PersonalMindMapCreator;
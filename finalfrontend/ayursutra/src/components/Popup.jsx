import React from 'react';

const Popup = ({ 
  type = 'success', 
  title, 
  message, 
  onClose, 
  onAction, 
  actionText,
  centerPopup = true 
}) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        
        <div className={`popup-icon ${type === 'success' ? 'popup-success-icon' : ''}`}>
          {type === 'success' ? '✓' : '!'}
        </div>
        
        <h2 className="popup-title">{title}</h2>
        <p className="popup-message">{message}</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {onAction && (
            <button className="btn btn-gold" onClick={onAction}>
              {actionText}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
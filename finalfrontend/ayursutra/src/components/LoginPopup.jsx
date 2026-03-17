import React from 'react';

const LoginPopup = ({ onClose }) => {
  return (
    <div className="popup-bottom-right">
      <button className="popup-close" onClick={onClose}>×</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'var(--success-green)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          fontWeight: 'bold' 
        }}>
          ✓
        </div>
        <div>
          <div style={{ 
            fontWeight: '600', 
            color: 'var(--primary-green)', 
            marginBottom: '0.25rem' 
          }}>
            Login Successful!
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-light)' 
          }}>
            Welcome back to your wellness journey
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
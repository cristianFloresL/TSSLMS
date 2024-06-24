import React from 'react';
import './moda.css'; // Estilos para el modal (opcional)

const Modal = ({ isOpen, onClose, children }) => {
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal">
            <button className="modal-close" onClick={onClose}>X</button>
            <div className="modal-content">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;

import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isLoading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button 
          variant="danger" 
          onClick={onConfirm} 
          isLoading={isLoading}
          className="w-full sm:ml-3 sm:w-auto"
        >
          {confirmText}
        </Button>
        <Button 
          variant="secondary" 
          onClick={onClose} 
          disabled={isLoading}
          className="mt-3 w-full sm:mt-0 sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

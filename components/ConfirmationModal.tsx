import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const handleConfirmClick = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
        <div className="flex justify-between items-start border-b pb-3">
          <h2 id="confirmation-modal-title" className="text-xl font-semibold text-slate-700">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none" aria-label="Đóng">&times;</button>
        </div>
        <div className="mt-4 text-slate-600" id="confirmation-modal-description">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
            Hủy
          </button>
          <button type="button" onClick={handleConfirmClick} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

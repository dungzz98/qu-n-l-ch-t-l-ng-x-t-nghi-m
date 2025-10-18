// FIX: This file was a placeholder. Added a full modal component implementation.
import React from 'react';

interface AutoBackupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AutoBackupPromptModal: React.FC<AutoBackupPromptModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
        <div className="flex justify-between items-start border-b pb-3">
          <h2 id="autobackup-modal-title" className="text-xl font-semibold text-slate-700">Sao lưu Dữ liệu</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none" aria-label="Đóng">&times;</button>
        </div>
        <div className="mt-4 text-slate-600" id="autobackup-modal-description">
          <p>Đã đến lúc sao lưu dữ liệu của bạn để đảm bảo an toàn. Bạn có muốn thực hiện sao lưu ngay bây giờ không?</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
            Để sau
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Sao lưu ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoBackupPromptModal;

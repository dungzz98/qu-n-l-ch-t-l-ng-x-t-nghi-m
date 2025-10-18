
import React from 'react';

interface AuditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuditFormModal: React.FC<AuditFormModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">Audit Form</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <div className="mt-4">
          <p>Audit form is under construction.</p>
        </div>
      </div>
    </div>
  );
};

export default AuditFormModal;

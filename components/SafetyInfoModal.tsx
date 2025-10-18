
import React from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical } from '../types';

interface SafetyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemical: Chemical | null;
  safetyInfo: string;
  isLoading: boolean;
}

const SafetyInfoModal: React.FC<SafetyInfoModalProps> = ({ isOpen, onClose, chemical, safetyInfo, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            Thông tin An toàn Hóa chất
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4 flex-grow overflow-y-auto">
          {chemical && (
            <div className="mb-4 p-3 bg-slate-50 rounded-md">
                <h3 className="text-lg font-bold text-slate-800">{chemical.name}</h3>
                <p className="text-sm text-slate-600"><strong>Số CAS:</strong> {chemical.casNumber}</p>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-slate-600">Đang tải thông tin từ AI...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {safetyInfo}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default SafetyInfoModal;
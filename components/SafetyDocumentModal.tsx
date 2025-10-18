import React from 'react';
import { Chemical } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface SafetyDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemical: Chemical | null;
}

const SafetyDocumentModal: React.FC<SafetyDocumentModalProps> = ({ isOpen, onClose, chemical }) => {
  if (!isOpen || !chemical) return null;

  const docExists = chemical.safetyDocBase64 && chemical.safetyDocMimeType;
  const dataUri = docExists ? `data:${chemical.safetyDocMimeType};base64,${chemical.safetyDocBase64}` : '';
  
  const getFileExtension = (mimeType?: string) => {
    if (!mimeType) return 'bin';
    const parts = mimeType.split('/');
    return parts[parts.length - 1] || 'bin';
  };

  const downloadFilename = `SDS_${chemical.name.replace(/\s+/g, '_')}.${getFileExtension(chemical.safetyDocMimeType)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            Tài liệu An toàn: <span className="text-teal-700 font-bold">{chemical.name}</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4 flex-grow overflow-auto bg-slate-100 rounded-md p-2">
          {docExists ? (
            chemical.safetyDocMimeType?.startsWith('image/') ? (
              <img src={dataUri} alt={`Tài liệu an toàn cho ${chemical.name}`} className="max-w-full max-h-full mx-auto object-contain" />
            ) : chemical.safetyDocMimeType === 'application/pdf' ? (
              <embed src={dataUri} type="application/pdf" className="w-full h-full" />
            ) : (
              <div className="text-center p-8 text-slate-600">
                <p>Không thể xem trước loại file này.</p>
                <p>Vui lòng tải về để xem.</p>
              </div>
            )
          ) : (
            <p className="text-center p-8 text-slate-500">Chưa có tài liệu an toàn nào được tải lên cho hóa chất này.</p>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center border-t pt-4">
           <a
              href={dataUri}
              download={downloadFilename}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${!docExists ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => !docExists && e.preventDefault()}
            >
              <DownloadIcon className="w-5 h-5"/> Tải về
            </a>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
              Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyDocumentModal;

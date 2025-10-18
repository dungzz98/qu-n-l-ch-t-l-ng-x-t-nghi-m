import React from 'react';
import { LabDocument, EquipmentDocument, PersonnelDocument } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

type DocumentType = LabDocument | EquipmentDocument | PersonnelDocument;

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentType | null;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, document }) => {
  if (!isOpen || !document) return null;

  const dataUri = `data:${document.fileType};base64,${document.fileData}`;
  const isLabDoc = 'category' in document && 'version' in document;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-700">{document.title}</h2>
            {isLabDoc && (
              <p className="text-sm text-slate-500">
                  Phiên bản: {document.version} | Hiệu lực: {new Date(document.effectiveDate).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4 flex-grow overflow-auto bg-slate-100 rounded-md p-2">
          {document.fileType.startsWith('image/') ? (
            <img src={dataUri} alt={document.title} className="max-w-full max-h-full mx-auto object-contain" />
          ) : document.fileType === 'application/pdf' ? (
            <embed src={dataUri} type="application/pdf" className="w-full h-full" />
          ) : (
            <div className="text-center p-8 text-slate-600">
              <p>Không thể xem trước loại file này.</p>
              <p>Vui lòng tải về để xem.</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center border-t pt-4">
           <a
              href={dataUri}
              download={document.fileName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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

export default DocumentViewerModal;
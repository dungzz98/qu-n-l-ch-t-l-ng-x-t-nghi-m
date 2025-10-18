import React, { useState, useEffect } from 'react';

export interface EquipmentDocumentFormData {
  title: string;
  fileName: string;
  fileType: string;
  fileData: string;
}

interface EquipmentDocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EquipmentDocumentFormData) => void;
}

const EquipmentDocumentFormModal: React.FC<EquipmentDocumentFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [fileInfo, setFileInfo] = useState<{ name: string; type: string; data: string; } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setFileInfo(null);
            setError('');
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result as string;
                const base64String = result.split(',')[1];
                setFileInfo({ name: file.name, type: file.type, data: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim()) {
            setError('Vui lòng nhập tên tài liệu.');
            return;
        }
        if (!fileInfo) {
            setError('Vui lòng chọn một file.');
            return;
        }
        // FIX: Manually map properties from fileInfo to what EquipmentDocumentFormData expects.
        onSubmit({ 
            title: title.trim(),
            fileName: fileInfo.name,
            fileType: fileInfo.type,
            fileData: fileInfo.data
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Thêm Tài liệu đính kèm</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên tài liệu (*)</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="VD: Hướng dẫn sử dụng, Báo cáo bảo trì..." className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-600">File (*)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white text-sm text-slate-700 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
                                <span>{fileInfo ? 'Thay đổi' : 'Chọn file'}</span>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                            {fileInfo && <span className="text-sm truncate max-w-xs">{fileInfo.name}</span>}
                        </div>
                    </div>
                     {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tải lên</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentDocumentFormModal;
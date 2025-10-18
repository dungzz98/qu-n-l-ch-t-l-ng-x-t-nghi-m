import React, { useState, useEffect } from 'react';
import { LabDocument, DocumentCategory } from '../types';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LabDocument, 'id'> | LabDocument) => void;
  initialData?: LabDocument | null;
  documentCategories: DocumentCategory[];
}

const DocumentFormModal: React.FC<DocumentFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, documentCategories }) => {
    const getInitialState = () => ({
        title: '',
        category: '',
        version: '1.0',
        effectiveDate: new Date().toISOString().split('T')[0],
    });

    const [formData, setFormData] = useState(getInitialState());
    const [fileInfo, setFileInfo] = useState<{ name: string; type: string; data: string; } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title,
                    category: initialData.category,
                    version: initialData.version,
                    effectiveDate: initialData.effectiveDate,
                });
                setFileInfo({
                    name: initialData.fileName,
                    type: initialData.fileType,
                    data: initialData.fileData,
                });
            } else {
                setFormData(getInitialState());
                setFileInfo(null);
            }
            setError('');
        }
    }, [initialData, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result as string;
                const base64String = result.split(',')[1];
                setFileInfo({
                    name: file.name,
                    type: file.type,
                    data: base64String,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!fileInfo) {
            setError('Vui lòng chọn một file để tải lên.');
            return;
        }

        const docData = {
            ...formData,
            fileName: fileInfo.name,
            fileType: fileInfo.type,
            fileData: fileInfo.data,
        };

        if (initialData?.id) {
            onSubmit({ ...initialData, ...docData });
        } else {
            onSubmit(docData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Chỉnh sửa Tài liệu' : 'Thêm Tài liệu mới'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên tài liệu (*)</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Danh mục (*)</label>
                             <select 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"
                            >
                                <option value="" disabled>-- Chọn một danh mục --</option>
                                {documentCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Phiên bản (*)</label>
                            <input type="text" name="version" value={formData.version} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày hiệu lực (*)</label>
                        <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">File tài liệu (*)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white text-sm text-slate-700 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
                                <span>{fileInfo ? 'Thay đổi file' : 'Chọn file'}</span>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                            {fileInfo && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="truncate max-w-xs">{fileInfo.name}</span>
                                <button type="button" onClick={() => setFileInfo(null)} className="text-red-500 hover:text-red-700" title="Xóa file đã chọn">&times;</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Thêm Tài liệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentFormModal;
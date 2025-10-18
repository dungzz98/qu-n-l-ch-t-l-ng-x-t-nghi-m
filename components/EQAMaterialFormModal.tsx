import React, { useState, useEffect } from 'react';
import { EQAMaterial } from '../types';

interface EQAMaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EQAMaterial, 'id'> | EQAMaterial) => void;
  initialData?: EQAMaterial | null;
}

const EQAMaterialFormModal: React.FC<EQAMaterialFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const getInitialState = () => ({
        name: '',
        provider: '',
        lotNumber: '',
        expirationDate: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || getInitialState());
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(initialData ? { ...initialData, ...formData } : formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">{initialData ? 'Sửa Vật liệu Ngoại kiểm' : 'Thêm Vật liệu Ngoại kiểm'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên/Chương trình (*)</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Nhà cung cấp (*)</label>
                        <input type="text" name="provider" value={formData.provider} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Số lô (*)</label>
                        <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày hết hạn (*)</label>
                        <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EQAMaterialFormModal;
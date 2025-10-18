import React, { useState, useEffect } from 'react';
import { Instrument } from '../types';

interface InstrumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Instrument, 'id'> | Instrument) => void;
  initialData?: Instrument | null;
}

const InstrumentFormModal: React.FC<InstrumentFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        serialNumber: '',
        location: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                model: initialData.model || '',
                serialNumber: initialData.serialNumber || '',
                location: initialData.location || '',
            });
        } else {
            setFormData({ name: '', model: '', serialNumber: '', location: '' });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData?.id) {
            onSubmit({ ...initialData, ...formData });
        } else {
            onSubmit(formData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Chỉnh sửa Máy' : 'Thêm Máy mới'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên Máy (*)</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Model</label>
                        <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Số Serial</label>
                        <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Vị trí</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstrumentFormModal;
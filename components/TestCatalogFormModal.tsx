import React, { useState, useEffect } from 'react';
import { TestParameter } from '../types';

interface TestCatalogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TestParameter, 'id'> | TestParameter) => void;
  initialData?: TestParameter | null;
}

const TestCatalogFormModal: React.FC<TestCatalogFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const getInitialState = () => ({
        name: '',
        method: '',
        unit: '',
        referenceRange: '',
        tea: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                method: initialData.method || '',
                unit: initialData.unit || '',
                referenceRange: initialData.referenceRange || '',
                tea: initialData.tea?.toString() || '',
            });
        } else {
            setFormData(getInitialState());
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const teaValue = parseFloat(formData.tea);
        if (isNaN(teaValue) || teaValue <= 0) {
            alert("TEa phải là một số dương.");
            return;
        }

        const testData = {
            name: formData.name,
            method: formData.method,
            unit: formData.unit,
            referenceRange: formData.referenceRange,
            tea: teaValue,
        };

        if (initialData?.id) {
            onSubmit({ ...initialData, ...testData });
        } else {
            onSubmit(testData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Chỉnh sửa Xét nghiệm' : 'Thêm Xét nghiệm mới'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Tên Xét nghiệm (*)</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Phương pháp đo</label>
                            <input type="text" name="method" value={formData.method} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Đơn vị (*)</label>
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Khoảng tham chiếu</label>
                            <textarea name="referenceRange" value={formData.referenceRange} onChange={handleChange} rows={3} placeholder="VD: 70 - 100 mg/dL&#10;Nam: < 40 U/L&#10;Nữ: < 32 U/L" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Sai số cho phép toàn phần - TEa (%) (*)</label>
                            <input type="number" name="tea" value={formData.tea} onChange={handleChange} required min="0.1" step="0.1" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Thêm Xét nghiệm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestCatalogFormModal;
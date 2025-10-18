import React, { useState, useEffect } from 'react';
import { TrainingCourse } from '../types';

interface TrainingCourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TrainingCourse, 'id'> | TrainingCourse) => void;
  initialData?: TrainingCourse | null;
}

const TrainingCourseFormModal: React.FC<TrainingCourseFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const getInitialState = () => ({
        title: '',
        provider: '',
        description: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData, description: initialData.description || '' } : getInitialState());
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    <h2 className="text-xl font-semibold text-slate-700">{initialData ? 'Sửa Khóa Đào tạo' : 'Thêm Khóa Đào tạo'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên khóa đào tạo (*)</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Đơn vị tổ chức (*)</label>
                        <input type="text" name="provider" value={formData.provider} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md p-2"></textarea>
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

export default TrainingCourseFormModal;

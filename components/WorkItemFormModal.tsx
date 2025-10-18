import React, { useState, useEffect } from 'react';
import { WorkItem } from '../types';

interface WorkItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<WorkItem, 'id'> | WorkItem) => void;
  initialData?: WorkItem | null;
}

const WorkItemFormModal: React.FC<WorkItemFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({ description: '', frequency: 'daily' as WorkItem['frequency'] });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                description: initialData?.description || '',
                frequency: initialData?.frequency || 'daily'
            });
        }
    }, [isOpen, initialData]);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            alert("Vui lòng nhập mô tả công việc.");
            return;
        }
        onSubmit(initialData ? { ...initialData, ...formData } : formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">{initialData ? 'Sửa Công việc' : 'Thêm Công việc Mới'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Mô tả Công việc (*)</label>
                        <textarea 
                            name="description"
                            value={formData.description} 
                            onChange={handleChange} 
                            required 
                            rows={3}
                            className="mt-1 block w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Tần suất thực hiện</label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-slate-300 rounded-md p-2"
                        >
                            <option value="daily">Hàng ngày</option>
                            <option value="weekly">Hàng tuần</option>
                            <option value="monthly">Hàng tháng</option>
                            <option value="quarterly">Hàng quý</option>
                            <option value="as_needed">Khi cần</option>
                            <option value="replacement">Thay thế</option>
                        </select>
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

export default WorkItemFormModal;
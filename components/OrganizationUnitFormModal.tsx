import React, { useState, useEffect } from 'react';
import { OrganizationUnit } from '../types';

interface OrganizationUnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<OrganizationUnit, 'id'> | OrganizationUnit) => void;
  initialData?: OrganizationUnit | null;
  parentId: string | null;
  units: OrganizationUnit[];
}

const OrganizationUnitFormModal: React.FC<OrganizationUnitFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, parentId, units }) => {
    const [formData, setFormData] = useState({ name: '', description: '', parentId: parentId });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || '',
                description: initialData?.description || '',
                parentId: initialData?.parentId || parentId
            });
        }
    }, [isOpen, initialData, parentId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            parentId: formData.parentId === 'null' ? null : formData.parentId
        };
        onSubmit(initialData ? { ...initialData, ...dataToSubmit } : dataToSubmit);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">{initialData ? 'Sửa Đơn vị' : 'Thêm Đơn vị'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên đơn vị (*)</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Đơn vị cha</label>
                        <select name="parentId" value={formData.parentId || 'null'} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            <option value="null">-- Là đơn vị gốc --</option>
                            {units.filter(u => u.id !== initialData?.id).map(u => ( // Prevent self-parenting
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
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

export default OrganizationUnitFormModal;

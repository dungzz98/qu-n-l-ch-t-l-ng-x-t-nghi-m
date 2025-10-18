import React, { useState, useEffect } from 'react';
import { LeaveRecord, PersonnelProfile } from '../types';

interface LeaveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LeaveRecord, 'id'> | LeaveRecord) => void;
  initialData?: LeaveRecord | null;
  personnel: PersonnelProfile[];
}

const LeaveFormModal: React.FC<LeaveFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, personnel }) => {
    const getInitialState = () => ({
        personnelId: personnel[0]?.id || '',
        leaveType: 'Phép năm' as LeaveRecord['leaveType'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'approved' as LeaveRecord['status'],
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || getInitialState());
        }
    }, [isOpen, initialData, personnel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alert("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
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
                    <h2 className="text-xl font-semibold text-slate-700">{initialData ? 'Sửa Đơn nghỉ phép' : 'Đăng ký Nghỉ phép'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Nhân viên (*)</label>
                        <select name="personnelId" value={formData.personnelId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            {personnel.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Loại nghỉ phép (*)</label>
                        <select name="leaveType" value={formData.leaveType} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            <option>Phép năm</option>
                            <option>Nghỉ ốm</option>
                            <option>Công tác</option>
                            <option>Nghỉ không lương</option>
                            <option>Nghỉ bù</option>
                            <option>Đi học</option>
                            <option>Khác</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Từ ngày (*)</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Đến ngày (*)</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Lý do (*)</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-slate-300 rounded-md p-2"></textarea>
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

export default LeaveFormModal;
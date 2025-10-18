import React, { useState, useEffect } from 'react';
import { TraineeProfile, PersonnelProfile } from '../types';

interface TraineeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TraineeProfile, 'id'> | TraineeProfile) => void;
  initialData?: TraineeProfile | null;
  personnel: PersonnelProfile[]; // For supervisor dropdown
}

const TraineeFormModal: React.FC<TraineeFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, personnel }) => {
    const getInitialState = () => ({
        fullName: '',
        studentId: '',
        schoolOrInstitution: '',
        trainingCourse: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        supervisorId: personnel[0]?.id || '',
        status: 'đang học' as TraineeProfile['status'],
        notes: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    notes: initialData.notes || ''
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [initialData, isOpen, personnel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Chỉnh sửa Hồ sơ Học viên' : 'Thêm Học viên mới'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Họ và Tên (*)</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Mã học viên/sinh viên</label>
                            <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Trường/Đơn vị công tác (*)</label>
                            <input type="text" name="schoolOrInstitution" value={formData.schoolOrInstitution} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Khóa học/Chương trình (*)</label>
                            <input type="text" name="trainingCourse" value={formData.trainingCourse} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày bắt đầu (*)</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày kết thúc (*)</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Người hướng dẫn (*)</label>
                            <select name="supervisorId" value={formData.supervisorId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                {personnel.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Trạng thái (*)</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                <option value="đang học">Đang học</option>
                                <option value="đã hoàn thành">Đã hoàn thành</option>
                                <option value="đã nghỉ">Đã nghỉ</option>
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Thêm Học viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TraineeFormModal;
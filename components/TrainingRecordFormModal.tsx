import React, { useState, useEffect } from 'react';
import { TrainingRecord, TrainingCourse, PersonnelProfile } from '../types';

interface TrainingRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TrainingRecord, 'id'>) => void;
  personnel: PersonnelProfile;
  courses: TrainingCourse[];
}

const TrainingRecordFormModal: React.FC<TrainingRecordFormModalProps> = ({ isOpen, onClose, onSubmit, personnel, courses }) => {
    const getInitialState = () => ({
        courseId: courses[0]?.id || '',
        completionDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, courses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, personnelId: personnel.id });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Ghi nhận Đào tạo</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                 <div className="mt-4 text-sm"><strong>Nhân viên:</strong> {personnel.fullName}</div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Khóa đào tạo (*)</label>
                        <select name="courseId" value={formData.courseId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày hoàn thành (*)</label>
                        <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày hết hạn (nếu có)</label>
                        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
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

export default TrainingRecordFormModal;

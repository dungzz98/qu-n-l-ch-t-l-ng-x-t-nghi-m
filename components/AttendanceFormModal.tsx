import React, { useState, useEffect } from 'react';
import { AttendanceRecord, PersonnelProfile } from '../types';

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AttendanceRecord, 'id'> | AttendanceRecord) => void;
  context: { personnelId: string, date: string, record?: AttendanceRecord } | null;
  personnel?: PersonnelProfile;
}

const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({ isOpen, onClose, onSubmit, context, personnel }) => {
    const getInitialState = () => ({
        checkIn: context?.record?.checkIn || '07:30',
        checkOut: context?.record?.checkOut || '16:30',
        notes: context?.record?.notes || '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, context]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context) return;

        const dataToSubmit = {
            personnelId: context.personnelId,
            date: context.date,
            ...formData,
        };
        
        if (context.record) { // Editing existing record
            onSubmit({ ...context.record, ...dataToSubmit });
        } else { // Creating new record
            onSubmit(dataToSubmit);
        }
        onClose();
    };

    if (!isOpen || !context || !personnel) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Chấm công</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <div className="mt-4 bg-slate-50 p-3 rounded-md text-sm">
                    <p><strong>Nhân viên:</strong> {personnel.fullName}</p>
                    <p><strong>Ngày:</strong> {new Date(context.date + 'T00:00:00').toLocaleDateString('vi-VN')}</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Giờ vào (*)</label>
                            <input type="time" name="checkIn" value={formData.checkIn} onChange={e => setFormData(p => ({...p, checkIn: e.target.value}))} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Giờ ra (*)</label>
                            <input type="time" name="checkOut" value={formData.checkOut} onChange={e => setFormData(p => ({...p, checkOut: e.target.value}))} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                        <input type="text" name="notes" value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
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

export default AttendanceFormModal;
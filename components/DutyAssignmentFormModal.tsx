import React, { useState, useEffect } from 'react';
import { DutyAssignment } from '../types';

interface DutyAssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DutyAssignment, 'id'>) => void;
  context: { personnelId: string, date: string } | null;
}

const DutyAssignmentFormModal: React.FC<DutyAssignmentFormModalProps> = ({ isOpen, onClose, onSubmit, context }) => {
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context) return;
        onSubmit({
            personnelId: context.personnelId,
            date: context.date,
            notes: notes.trim(),
        });
        onClose();
    };

    if (!isOpen || !context) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Phân công ca trực</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <div className="mt-4 bg-slate-50 p-3 rounded-md text-sm">
                     <p><strong>Ngày trực:</strong> {new Date(context.date + 'T00:00:00').toLocaleDateString('vi-VN')}</p>
                     <p><strong>Thời gian:</strong> 16:30 - 07:30 hôm sau</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md p-2"></textarea>
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

export default DutyAssignmentFormModal;
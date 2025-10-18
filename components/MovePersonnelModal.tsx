import React, { useState, useEffect } from 'react';
import { PersonnelProfile, OrganizationUnit } from '../types';

interface MovePersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (personnelId: string, newUnitId: string, effectiveDate: string, notes: string) => void;
  personnel: PersonnelProfile[];
  organizationUnits: OrganizationUnit[];
}

const MovePersonnelModal: React.FC<MovePersonnelModalProps> = ({ isOpen, onClose, onSubmit, personnel, organizationUnits }) => {
    const getInitialState = () => ({
        personnelId: personnel[0]?.id || '',
        newUnitId: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, personnel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { personnelId, newUnitId, effectiveDate, notes } = formData;
        
        const currentUnitId = personnel.find(p => p.id === personnelId)?.organizationUnitId;
        if (newUnitId === currentUnitId) {
            alert("Nhân sự đã ở trong phòng ban này. Vui lòng chọn một phòng ban khác.");
            return;
        }

        onSubmit(personnelId, newUnitId, effectiveDate, notes);
        onClose();
    };

    if (!isOpen) return null;
    
    const availableUnits = organizationUnits.filter(u => u.id !== personnel.find(p => p.id === formData.personnelId)?.organizationUnitId);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Luân chuyển Nhân sự</h2>
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
                        <label className="block text-sm font-medium text-slate-600">Phòng ban MỚI (*)</label>
                        <select name="newUnitId" value={formData.newUnitId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            <option value="">-- Chọn phòng ban --</option>
                            {availableUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày hiệu lực (*)</label>
                        <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md p-2"></textarea>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Xác nhận</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MovePersonnelModal;
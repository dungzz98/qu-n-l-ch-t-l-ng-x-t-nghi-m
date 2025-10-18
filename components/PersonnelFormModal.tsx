import React, { useState, useEffect } from 'react';
import { PersonnelProfile, JobRole, OrganizationUnit } from '../types';

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PersonnelProfile, 'id'> | PersonnelProfile) => void;
  initialData?: PersonnelProfile | null;
  jobRoles: JobRole[];
  organizationUnits: OrganizationUnit[];
}

const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, jobRoles, organizationUnits }) => {
    const getInitialState = () => ({
        fullName: '',
        employeeId: '',
        jobRoleId: jobRoles[0]?.id || '',
        organizationUnitId: organizationUnits[0]?.id || '',
        degree: '',
        hireDate: new Date().toISOString().split('T')[0],
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    fullName: initialData.fullName,
                    employeeId: initialData.employeeId,
                    jobRoleId: initialData.jobRoleId,
                    organizationUnitId: initialData.organizationUnitId,
                    degree: initialData.degree,
                    hireDate: initialData.hireDate,
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [initialData, isOpen, jobRoles, organizationUnits]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                        {initialData ? 'Chỉnh sửa Hồ sơ Nhân sự' : 'Thêm Nhân sự mới'}
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
                            <label className="block text-sm font-medium text-slate-600">Mã nhân viên (*)</label>
                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Phòng ban (*)</label>
                            <select name="organizationUnitId" value={formData.organizationUnitId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                {organizationUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Chức vụ (*)</label>
                            <select name="jobRoleId" value={formData.jobRoleId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                {jobRoles.map(role => <option key={role.id} value={role.id}>{role.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Trình độ chuyên môn (*)</label>
                            <input type="text" name="degree" value={formData.degree} onChange={handleChange} required placeholder="VD: Cử nhân, Thạc sĩ..." className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày vào làm (*)</label>
                            <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Thêm Nhân sự'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonnelFormModal;
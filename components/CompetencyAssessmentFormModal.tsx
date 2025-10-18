import React, { useState, useEffect } from 'react';
import { CompetencyAssessment, Competency, PersonnelProfile } from '../types';

interface CompetencyAssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CompetencyAssessment, 'id'>) => void;
  personnel: PersonnelProfile;
  competencies: Competency[];
  assessors: PersonnelProfile[]; // List of potential assessors
}

const CompetencyAssessmentFormModal: React.FC<CompetencyAssessmentFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, personnel, competencies, assessors } = props;
    
    const getInitialState = () => ({
        competencyId: competencies[0]?.id || '',
        assessmentDate: new Date().toISOString().split('T')[0],
        assessorId: assessors[0]?.id || '',
        result: 'Đạt' as 'Đạt' | 'Cần cải thiện',
        nextAssessmentDate: '',
        notes: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen, competencies, assessors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-xl">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Đánh giá Năng lực</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                 <div className="mt-4 text-sm"><strong>Nhân viên:</strong> {personnel.fullName}</div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Năng lực (*)</label>
                            <select name="competencyId" value={formData.competencyId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                                {competencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày đánh giá (*)</label>
                            <input type="date" name="assessmentDate" value={formData.assessmentDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Người đánh giá (*)</label>
                            <select name="assessorId" value={formData.assessorId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                                {assessors.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Kết quả (*)</label>
                            <select name="result" value={formData.result} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                                <option value="Đạt">Đạt</option>
                                <option value="Cần cải thiện">Cần cải thiện</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày đánh giá tiếp theo</label>
                        <input type="date" name="nextAssessmentDate" value={formData.nextAssessmentDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md p-2"></textarea>
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

export default CompetencyAssessmentFormModal;

import React, { useState, useEffect } from 'react';
import { ImprovementInitiative, User } from '../types';

interface ImprovementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ImprovementInitiative, 'id'> | ImprovementInitiative) => void;
  initialData?: ImprovementInitiative | null;
  currentUser: User | null;
}

const ImprovementFormModal: React.FC<ImprovementFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
    const getInitialState = () => ({
        title: '',
        proposedDate: new Date().toISOString().split('T')[0],
        proposedBy: currentUser?.fullName || '',
        problemDescription: '',
        proposedAction: '',
        status: 'proposed' as ImprovementInitiative['status'],
        dueDate: '',
        completionDate: '',
        effectivenessEvaluation: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    dueDate: initialData.dueDate || '',
                    completionDate: initialData.completionDate || '',
                    effectivenessEvaluation: initialData.effectivenessEvaluation || '',
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [initialData, isOpen, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: any = { ...formData };
        if (dataToSubmit.status !== 'completed') {
            dataToSubmit.completionDate = undefined;
            dataToSubmit.effectivenessEvaluation = undefined;
        }

        if (initialData?.id) {
            onSubmit({ ...initialData, ...dataToSubmit });
        } else {
            onSubmit(dataToSubmit);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Cập nhật Sáng kiến Cải tiến' : 'Ghi nhận Sáng kiến Cải tiến'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Tên sáng kiến / hoạt động (*)</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày đề xuất (*)</label>
                            <input type="date" name="proposedDate" value={formData.proposedDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Người đề xuất</label>
                            <input type="text" name="proposedBy" value={formData.proposedBy} readOnly className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-slate-100"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Mô tả vấn đề / Cơ hội cải tiến (*)</label>
                        <textarea name="problemDescription" value={formData.problemDescription} onChange={handleChange} required rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Hành động / Giải pháp đề xuất (*)</label>
                        <textarea name="proposedAction" value={formData.proposedAction} onChange={handleChange} required rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"></textarea>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Trạng thái (*)</label>
                            <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white">
                                <option value="proposed">Đề xuất</option>
                                <option value="in_progress">Đang thực hiện</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="canceled">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Thời hạn hoàn thành</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                        </div>
                    </div>

                    {formData.status === 'completed' && (
                        <div className="border-t pt-4 space-y-4">
                            <h3 className="text-md font-semibold text-slate-700">Đánh giá sau khi hoàn thành</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Ngày hoàn thành</label>
                                <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Đánh giá hiệu quả</label>
                                <textarea name="effectivenessEvaluation" value={formData.effectivenessEvaluation} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white"></textarea>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImprovementFormModal;

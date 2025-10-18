// FIX: Changed incorrect import statement.
import React, { useState, useEffect } from 'react';
import { PreventiveActionReport, User } from '../types';

interface PreventiveActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PreventiveActionReport, 'id' | 'reportId'> | PreventiveActionReport) => void;
  initialData?: PreventiveActionReport | null;
  currentUser: User | null;
}

const PreventiveActionFormModal: React.FC<PreventiveActionFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
    const getInitialState = () => ({
        dateCreated: new Date().toISOString().split('T')[0],
        problemDescription: '',
        riskFactors: '',
        preventiveMeasures: '',
        executor: currentUser?.fullName || '',
        executionDate: new Date().toISOString().split('T')[0],
        effectiveness: '',
        evaluator: '',
        evaluationDate: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...getInitialState(),
                    ...initialData,
                    effectiveness: initialData.effectiveness || '',
                    evaluator: initialData.evaluator || '',
                    evaluationDate: initialData.evaluationDate || '',
                });
            } else {
                setFormData(getInitialState());
            }
        }
    }, [initialData, isOpen, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: any = { ...formData };
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
                        {initialData ? 'Cập nhật Hành động Phòng ngừa' : 'Ghi nhận Hành động Phòng ngừa'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4">
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold text-slate-700 px-2">Phân tích & Hành động</legend>
                        <div className="space-y-4 pt-2">
                             <div>
                                <label className="block text-sm font-medium text-slate-600">1. Mô tả tóm tắt vấn đề (*)</label>
                                <textarea name="problemDescription" value={formData.problemDescription} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">2. Yếu tố nguy cơ (*)</label>
                                <textarea name="riskFactors" value={formData.riskFactors} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">3. Biện pháp phòng ngừa (*)</label>
                                <textarea name="preventiveMeasures" value={formData.preventiveMeasures} onChange={handleChange} required rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Người thực hiện (*)</label>
                                    <input type="text" name="executor" value={formData.executor} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Ngày thực hiện (*)</label>
                                    <input type="date" name="executionDate" value={formData.executionDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-md font-semibold text-slate-700 px-2">4. Đánh giá hiệu quả</legend>
                        <div className="space-y-4 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Nội dung đánh giá</label>
                                <textarea name="effectiveness" value={formData.effectiveness} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Người đánh giá</label>
                                    <input type="text" name="evaluator" value={formData.evaluator} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600">Ngày đánh giá</label>
                                    <input type="date" name="evaluationDate" value={formData.evaluationDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PreventiveActionFormModal;
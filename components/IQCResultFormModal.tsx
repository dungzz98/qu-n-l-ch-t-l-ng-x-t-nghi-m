import React, { useState, useEffect, useMemo } from 'react';
import { IQCResult, TestParameter, ControlMaterial, User } from '../types';

interface IQCResultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<IQCResult, 'id'>) => void;
  currentUser: User | null;
  testParameters: TestParameter[];
  controlMaterials: ControlMaterial[];
}

const IQCResultFormModal: React.FC<IQCResultFormModalProps> = ({ isOpen, onClose, onSubmit, currentUser, testParameters, controlMaterials }) => {
    const getInitialState = () => ({
        testParameterId: testParameters[0]?.id || '',
        controlMaterialId: controlMaterials[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().substring(0, 5),
        value: '',
        notes: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { date, time, value, ...rest } = formData;
        
        const resultValue = parseFloat(value);
        if (isNaN(resultValue)) {
            alert("Giá trị kết quả không hợp lệ.");
            return;
        }

        const isoDate = new Date(`${date}T${time}`).toISOString();

        onSubmit({
            ...rest,
            value: resultValue,
            date: isoDate,
            recordedBy: currentUser?.fullName || 'N/A',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Nhập kết quả Nội kiểm (IQC)</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Xét nghiệm (*)</label>
                            <select name="testParameterId" value={formData.testParameterId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white">
                                {testParameters.map(tp => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Mẫu Control (*)</label>
                            <select name="controlMaterialId" value={formData.controlMaterialId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white">
                                {controlMaterials.map(cm => <option key={cm.id} value={cm.id}>{cm.level} ({cm.lotNumber})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày (*)</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Giờ (*)</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Giá trị kết quả (*)</label>
                            <input type="number" step="any" name="value" value={formData.value} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Người nhập</label>
                            <p className="mt-1 p-2 bg-slate-100 rounded-md font-medium">{currentUser?.fullName}</p>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"></textarea>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu kết quả</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IQCResultFormModal;

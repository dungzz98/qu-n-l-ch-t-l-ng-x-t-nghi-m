import React, { useState, useEffect } from 'react';
import { ControlLotTarget, TestParameter, ControlMaterial } from '../types';

interface ControlLotTargetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ControlLotTarget, 'id'> | ControlLotTarget) => void;
  initialData?: ControlLotTarget | null;
  testParameters: TestParameter[];
  controlMaterials: ControlMaterial[];
}

const ControlLotTargetFormModal: React.FC<ControlLotTargetFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, initialData, testParameters, controlMaterials } = props;

    const getInitialState = () => ({
        testParameterId: testParameters[0]?.id || '',
        controlMaterialId: controlMaterials[0]?.id || '',
        mean: '',
        sd: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData({
                testParameterId: initialData?.testParameterId || testParameters[0]?.id || '',
                controlMaterialId: initialData?.controlMaterialId || controlMaterials[0]?.id || '',
                mean: initialData?.mean.toString() || '',
                sd: initialData?.sd.toString() || '',
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mean = parseFloat(formData.mean);
        const sd = parseFloat(formData.sd);
        if (isNaN(mean) || isNaN(sd) || sd < 0) {
            alert("Giá trị Mean hoặc SD không hợp lệ.");
            return;
        }
        
        const dataToSubmit = { 
            testParameterId: formData.testParameterId, 
            controlMaterialId: formData.controlMaterialId, 
            mean, 
            sd 
        };

        onSubmit(initialData ? { ...initialData, ...dataToSubmit } : dataToSubmit);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">{initialData ? 'Sửa Target QC' : 'Thêm Target QC'}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Xét nghiệm (*)</label>
                        <select name="testParameterId" value={formData.testParameterId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            {testParameters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Vật liệu Control (*)</label>
                        <select name="controlMaterialId" value={formData.controlMaterialId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2">
                            {controlMaterials.map(c => <option key={c.id} value={c.id}>{c.name} - {c.level} (Lô: {c.lotNumber})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Giá trị Trung bình (Mean) (*)</label>
                        <input type="number" step="any" name="mean" value={formData.mean} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Độ lệch chuẩn (SD) (*)</label>
                        <input type="number" step="any" min="0" name="sd" value={formData.sd} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2"/>
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

export default ControlLotTargetFormModal;

import React, { useState, useEffect } from 'react';
import { ChemicalMaster } from '../types';

interface ChemicalMasterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ChemicalMaster, 'id'> | ChemicalMaster) => void;
  initialData?: ChemicalMaster | null;
}

const ChemicalMasterFormModal: React.FC<ChemicalMasterFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        casNumber: '',
        specification: '',
        defaultSupplier: '',
        defaultUnit: 'ml',
        defaultLocation: '',
        minimumLevel: '0',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                casNumber: initialData.casNumber,
                specification: initialData.specification || '',
                defaultSupplier: initialData.defaultSupplier,
                defaultUnit: initialData.defaultUnit,
                defaultLocation: initialData.defaultLocation,
                minimumLevel: String(initialData.minimumLevel),
            });
        } else {
            setFormData({
                name: '', casNumber: '', specification: '', defaultSupplier: '',
                defaultUnit: 'ml', defaultLocation: '', minimumLevel: '0'
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const masterData = {
            ...formData,
            minimumLevel: parseFloat(formData.minimumLevel) || 0,
        };

        if (initialData?.id) {
            onSubmit({ ...initialData, ...masterData });
        } else {
            onSubmit(masterData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Chỉnh sửa Danh mục Hóa chất' : 'Thêm vào Danh mục Hóa chất'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Tên hóa chất</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Số CAS</label>
                            <input type="text" name="casNumber" value={formData.casNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Quy cách</label>
                            <input type="text" name="specification" value={formData.specification} onChange={handleChange} placeholder="VD: Chai 500ml, Hộp 100 test" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Nhà cung cấp mặc định</label>
                            <input type="text" name="defaultSupplier" value={formData.defaultSupplier} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Đơn vị mặc định</label>
                            <input
                                type="text"
                                name="defaultUnit"
                                value={formData.defaultUnit}
                                onChange={handleChange}
                                required
                                placeholder="VD: ml, test, kit"
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Vị trí lưu trữ mặc định</label>
                            <input type="text" name="defaultLocation" value={formData.defaultLocation} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Mức tồn kho tối thiểu</label>
                            <input type="number" name="minimumLevel" value={formData.minimumLevel} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500" min="0" step="any"/>
                            <p className="text-xs text-slate-500 mt-1">Đặt là 0 nếu không cần theo dõi.</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {initialData ? 'Lưu thay đổi' : 'Thêm vào danh mục'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChemicalMasterFormModal;
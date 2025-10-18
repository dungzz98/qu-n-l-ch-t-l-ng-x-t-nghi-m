import React, { useState, useEffect } from 'react';
import { LabEquipment, RoomLocation } from '../types';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<LabEquipment, 'id'> | LabEquipment) => void;
  initialData?: LabEquipment | null;
  roomLocations: RoomLocation[];
}

const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, roomLocations }) => {
    const getInitialState = () => ({
        name: '',
        assetId: '',
        model: '',
        serialNumber: '',
        manufacturer: '',
        status: 'operational' as LabEquipment['status'],
        location: '',
        purchaseDate: '',
        warrantyDate: '',
        lastMaintenance: '',
        maintenanceInterval: '',
        nextMaintenance: '',
        lastCalibration: '',
        calibrationInterval: '',
        nextCalibration: '',
    });

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                assetId: initialData.assetId || '',
                model: initialData.model || '',
                serialNumber: initialData.serialNumber || '',
                manufacturer: initialData.manufacturer || '',
                status: initialData.status || 'operational',
                location: initialData.location || '',
                purchaseDate: initialData.purchaseDate || '',
                warrantyDate: initialData.warrantyDate || '',
                lastMaintenance: initialData.lastMaintenance || '',
                maintenanceInterval: initialData.maintenanceInterval?.toString() || '',
                nextMaintenance: initialData.nextMaintenance || '',
                lastCalibration: initialData.lastCalibration || '',
                calibrationInterval: initialData.calibrationInterval?.toString() || '',
                nextCalibration: initialData.nextCalibration || '',
            });
        } else {
            setFormData(getInitialState());
        }
    }, [initialData, isOpen]);
    
    // Auto-calculate next maintenance date
    useEffect(() => {
        const { lastMaintenance, maintenanceInterval } = formData;
        if (lastMaintenance && maintenanceInterval) {
            const intervalDays = parseInt(maintenanceInterval, 10);
            if (!isNaN(intervalDays) && intervalDays > 0) {
                const lastDate = new Date(lastMaintenance + 'T00:00:00');
                lastDate.setDate(lastDate.getDate() + intervalDays);
                setFormData(prev => ({ ...prev, nextMaintenance: lastDate.toISOString().split('T')[0] }));
            }
        }
    }, [formData.lastMaintenance, formData.maintenanceInterval]);

    // Auto-calculate next calibration date
    useEffect(() => {
        const { lastCalibration, calibrationInterval } = formData;
        if (lastCalibration && calibrationInterval) {
            const intervalDays = parseInt(calibrationInterval, 10);
            if (!isNaN(intervalDays) && intervalDays > 0) {
                const lastDate = new Date(lastCalibration + 'T00:00:00');
                lastDate.setDate(lastDate.getDate() + intervalDays);
                setFormData(prev => ({ ...prev, nextCalibration: lastDate.toISOString().split('T')[0] }));
            }
        }
    }, [formData.lastCalibration, formData.calibrationInterval]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const equipmentData = {
            ...formData,
            maintenanceInterval: formData.maintenanceInterval ? parseInt(formData.maintenanceInterval, 10) : undefined,
            calibrationInterval: formData.calibrationInterval ? parseInt(formData.calibrationInterval, 10) : undefined,
        };

        if (initialData?.id) {
            onSubmit({ ...initialData, ...equipmentData });
        } else {
            onSubmit(equipmentData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">
                        {initialData ? 'Chỉnh sửa Thiết bị' : 'Thêm Thiết bị mới'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Tên thiết bị (*)</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Mã tài sản (*)</label>
                            <input type="text" name="assetId" value={formData.assetId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Số Serial (*)</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Model</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Hãng sản xuất</label>
                            <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày mua</label>
                            <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Hạn bảo hành</label>
                            <input type="date" name="warrantyDate" value={formData.warrantyDate} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Vị trí (*)</label>
                             <input 
                                type="text" 
                                name="location" 
                                value={formData.location} 
                                onChange={handleChange} 
                                required 
                                list="room-locations-list"
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"
                            />
                            <datalist id="room-locations-list">
                                {roomLocations.map(loc => (
                                    <option key={loc.id} value={loc.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Tình trạng</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                                <option value="operational">Hoạt động</option>
                                <option value="maintenance">Bảo trì</option>
                                <option value="out_of_service">Ngưng sử dụng</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2 border-t mt-4 pt-4">
                            <p className="font-medium text-slate-700">Thông tin Bảo trì</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày bảo trì cuối</label>
                            <input type="date" name="lastMaintenance" value={formData.lastMaintenance} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Chu kỳ bảo trì (ngày)</label>
                            <input type="number" name="maintenanceInterval" value={formData.maintenanceInterval} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Ngày bảo trì tiếp theo</label>
                            <input type="date" name="nextMaintenance" value={formData.nextMaintenance} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-slate-100 text-slate-700" readOnly/>
                        </div>

                         <div className="md:col-span-2 border-t mt-4 pt-4">
                            <p className="font-medium text-slate-700">Thông tin Hiệu chuẩn</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Ngày hiệu chuẩn cuối</label>
                            <input type="date" name="lastCalibration" value={formData.lastCalibration} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Chu kỳ hiệu chuẩn (ngày)</label>
                            <input type="number" name="calibrationInterval" value={formData.calibrationInterval} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Ngày hiệu chuẩn tiếp theo</label>
                            <input type="date" name="nextCalibration" value={formData.nextCalibration} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-slate-100 text-slate-700" readOnly/>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {initialData ? 'Lưu thay đổi' : 'Thêm Thiết bị'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentFormModal;
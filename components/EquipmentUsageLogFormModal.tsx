import React, { useState, useEffect, useMemo } from 'react';
import { LabEquipment, PersonnelProfile, EquipmentUsageLog, User, AccessLog } from '../types';

interface EquipmentUsageLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EquipmentUsageLog, 'id'>) => void;
  equipmentList: LabEquipment[];
  userList: PersonnelProfile[];
  currentUser: User | null;
  // FIX: Added accessLogs to props to allow including external users in the dropdown.
  accessLogs: AccessLog[];
}

const EquipmentUsageLogFormModal: React.FC<EquipmentUsageLogFormModalProps> = (props) => {
    const { isOpen, onClose, onSubmit, equipmentList, userList, currentUser, accessLogs } = props;
    const [useCurrentTime, setUseCurrentTime] = useState(true);

    const allUsers = useMemo(() => {
        const users: { id: string; name: string }[] = userList.map(u => ({ id: u.id, name: u.fullName }));
        const userNameSet = new Set(userList.map(u => u.fullName));

        accessLogs.forEach(log => {
            if (!userNameSet.has(log.personOrUnit)) {
                // For external users, their name is their ID
                users.push({ id: log.personOrUnit, name: log.personOrUnit });
                userNameSet.add(log.personOrUnit);
            }
        });
        
        return users.sort((a,b) => a.name.localeCompare(b.name, 'vi'));
    }, [userList, accessLogs]);


    const getInitialState = () => {
        const now = new Date();
        const firstEquipment = equipmentList[0];
        const currentUserId = userList.find(u => u.fullName === currentUser?.fullName)?.id;
        
        return {
            equipmentId: firstEquipment?.id || '',
            userId: currentUserId || allUsers[0]?.id || '',
            date: now.toISOString().split('T')[0],
            startTime: now.toTimeString().substring(0, 5),
            endTime: now.toTimeString().substring(0, 5),
            maintenancePerformed: '',
            // FIX: Explicitly type the initial state property to prevent incorrect type inference which was causing comparison errors.
            qualityCheck: 'n/a' as EquipmentUsageLog['qualityCheck'],
            qualityCheckDetails: '',
            incidents: '',
            correctiveAction: '',
            // FIX: Explicitly type the initial state property to prevent incorrect type inference.
            usageStatus: 'Hoạt động tốt' as EquipmentUsageLog['usageStatus'],
            notes: '',
        }
    };
    
    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setUseCurrentTime(true);
            setFormData(getInitialState());
        }
    }, [isOpen, equipmentList, userList, currentUser, accessLogs]);
    
    useEffect(() => {
        let timer: number;
        if (isOpen && useCurrentTime) {
            timer = window.setInterval(() => {
                const now = new Date();
                setFormData(prev => ({
                    ...prev,
                    date: now.toISOString().split('T')[0],
                    startTime: now.toTimeString().substring(0, 5),
                }));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, useCurrentTime]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-slate-700">Ghi nhận Nhật ký Sử dụng Thiết bị</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-600">Thiết bị (*)</label>
                            <select name="equipmentId" value={formData.equipmentId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900">
                                {equipmentList.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Người sử dụng (*)</label>
                            <select name="userId" value={formData.userId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900">
                                {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            id="useCurrentTime"
                            type="checkbox"
                            checked={useCurrentTime}
                            onChange={(e) => setUseCurrentTime(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="useCurrentTime" className="ml-2 block text-sm text-slate-700">
                            Ghi nhận thời gian bắt đầu theo thời gian thực
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Ngày (*)</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Bắt đầu (*)</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Kết thúc (*)</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600">Trạng thái khi sử dụng (*)</label>
                            <select name="usageStatus" value={formData.usageStatus} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900">
                                <option value="Hoạt động tốt">Hoạt động tốt</option>
                                <option value="Có vấn đề nhỏ">Có vấn đề nhỏ</option>
                                <option value="Gặp sự cố">Gặp sự cố</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Nội dung bảo trì, bảo dưỡng</label>
                        <textarea name="maintenancePerformed" value={formData.maintenancePerformed} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"></textarea>
                    </div>

                    <fieldset className="space-y-2">
                        <legend className="block text-sm font-medium text-slate-600">Kiểm tra chất lượng</legend>
                        <div className="flex items-center gap-6">
                             <label className="flex items-center">
                                <input type="radio" name="qualityCheck" value="yes" checked={formData.qualityCheck === 'yes'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-slate-300"/>
                                <span className="ml-2 text-sm text-slate-700">Có</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="qualityCheck" value="no" checked={formData.qualityCheck === 'no'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-slate-300"/>
                                <span className="ml-2 text-sm text-slate-700">Không</span>
                            </label>
                             <label className="flex items-center">
                                <input type="radio" name="qualityCheck" value="n/a" checked={formData.qualityCheck === 'n/a'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-slate-300"/>
                                <span className="ml-2 text-sm text-slate-700">Không thực hiện</span>
                            </label>
                        </div>
                        {/* FIX: Show details only when QC is performed ('yes' or 'no'), not when 'n/a'. */}
                        {formData.qualityCheck !== 'n/a' && (
                             <div>
                                <label htmlFor="qualityCheckDetails" className="sr-only">Chi tiết Kiểm tra chất lượng</label>
                                <textarea id="qualityCheckDetails" name="qualityCheckDetails" value={formData.qualityCheckDetails} onChange={handleChange} rows={2} placeholder="Chi tiết, VD: Chạy QC đầu ngày, kết quả đạt." className="mt-2 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"></textarea>
                            </div>
                        )}
                    </fieldset>

                     <div>
                        <label className="block text-sm font-medium text-slate-600">Sự cố thiết bị / nội kiểm</label>
                        <textarea name="incidents" value={formData.incidents} onChange={handleChange} rows={2} placeholder="VD: Máy báo lỗi Error 123, QC Glucose control 2 vượt 2SD." className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Hành động khắc phục</label>
                        <textarea name="correctiveAction" value={formData.correctiveAction} onChange={handleChange} rows={2} placeholder="VD: Khởi động lại máy, chạy lại QC." className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white text-slate-900"></textarea>
                    </div>
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipmentUsageLogFormModal;
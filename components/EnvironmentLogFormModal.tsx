import React, { useState, useEffect } from 'react';
import { MonitoredArea, MonitoredEquipment, User, AreaEnvironmentLog, EquipmentTemperatureLog, WaterConductivityLog, WaterSource } from '../types';

type LogType = 'area' | 'equipment' | 'water';

interface EnvironmentLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AreaEnvironmentLog, 'id'> | Omit<EquipmentTemperatureLog, 'id'> | Omit<WaterConductivityLog, 'id'>) => void;
  logType: LogType;
  items: MonitoredArea[] | MonitoredEquipment[] | WaterSource[];
  currentUser: User | null;
}

const EnvironmentLogFormModal: React.FC<EnvironmentLogFormModalProps> = ({ isOpen, onClose, onSubmit, logType, items, currentUser }) => {
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  const getInitialState = () => {
    const now = new Date();
    return {
        itemId: items[0]?.id || '',
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().substring(0, 5),
        temperature: '',
        humidity: '',
        conductivity: '',
        notes: '',
    };
  };

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setUseCurrentTime(true);
      setFormData(getInitialState());
    }
  }, [isOpen, items, logType]);
  
  useEffect(() => {
    let timer: number;
    if (isOpen && useCurrentTime) {
      timer = window.setInterval(() => {
        const now = new Date();
        setFormData(prev => ({
          ...prev,
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().substring(0, 5),
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, useCurrentTime]);


  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === formData.itemId);
    if (!item || !currentUser) return;

    if (logType === 'area') {
      if (!formData.temperature || !formData.humidity) return;
      onSubmit({
        areaId: item.id,
        areaName: item.name,
        date: formData.date,
        time: formData.time,
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        recordedBy: currentUser.fullName,
        notes: formData.notes,
      });
    } else if (logType === 'equipment') {
      if (!formData.temperature) return;
      onSubmit({
        equipmentId: item.id,
        equipmentName: item.name,
        date: formData.date,
        time: formData.time,
        temperature: parseFloat(formData.temperature),
        recordedBy: currentUser.fullName,
        notes: formData.notes,
      });
    } else if (logType === 'water') {
        if (!formData.conductivity) return;
        onSubmit({
            sourceId: item.id,
            sourceName: item.name,
            date: formData.date,
            time: formData.time,
            conductivity: parseFloat(formData.conductivity),
            recordedBy: currentUser.fullName,
            notes: formData.notes,
        });
    }
    onClose();
  };

  const title = {
      area: 'Ghi nhận Giám sát Khu vực',
      equipment: 'Ghi nhận Nhiệt độ Thiết bị',
      water: 'Ghi nhận Độ dẫn điện Nước'
  }[logType];
  const itemLabel = {
      area: 'Khu vực',
      equipment: 'Thiết bị',
      water: 'Nguồn nước'
  }[logType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex items-center">
                <input id="useCurrentTimeEnv" type="checkbox" checked={useCurrentTime} onChange={(e) => setUseCurrentTime(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
                <label htmlFor="useCurrentTimeEnv" className="ml-2 block text-sm text-slate-700">Sử dụng thời gian hiện tại</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-600">Ngày (*)</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600">Giờ (*)</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600">{itemLabel} (*)</label>
                <select name="itemId" value={formData.itemId} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white">
                  {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
            </div>

            {logType !== 'water' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Nhiệt độ (°C) (*)</label>
                        <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} required step="0.1" className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                    {logType === 'area' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600">Độ ẩm (%) (*)</label>
                            <input type="number" name="humidity" value={formData.humidity} onChange={handleChange} required step="0.1" min="0" max="100" className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                        </div>
                    )}
                </div>
            )}
            
            {logType === 'water' && (
                <div>
                    <label className="block text-sm font-medium text-slate-600">Độ dẫn điện (µS/cm) (*)</label>
                    <input type="number" name="conductivity" value={formData.conductivity} onChange={handleChange} required step="any" min="0" className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                </div>
            )}

             <div>
                <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600">Người ghi nhận</label>
                <p className="mt-1 p-2 bg-slate-100 rounded-md font-medium">{currentUser?.fullName}</p>
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

export default EnvironmentLogFormModal;
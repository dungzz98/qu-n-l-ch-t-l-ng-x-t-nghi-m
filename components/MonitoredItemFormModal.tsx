import React, { useState, useEffect } from 'react';
import { MonitoredArea, MonitoredEquipment, WaterSource } from '../types';

type ItemType = 'area' | 'equipment' | 'waterSource';

interface MonitoredItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  itemType: ItemType;
  initialData?: MonitoredArea | MonitoredEquipment | WaterSource | null;
}

const MonitoredItemFormModal: React.FC<MonitoredItemFormModalProps> = ({ isOpen, onClose, onSubmit, itemType, initialData }) => {
  
  const getInitialState = () => {
    const common = { name: '' };
    if (itemType === 'area') {
      return { ...common, description: '', minTemp: '', maxTemp: '', minHumidity: '', maxHumidity: '' };
    } else if (itemType === 'equipment') {
      return { ...common, type: '', minTemp: '', maxTemp: '' };
    } else { // waterSource
      return { ...common, location: '', minConductivity: '', maxConductivity: '' };
    }
  };

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const common = { name: initialData.name };
        if (itemType === 'area' && 'description' in initialData) {
          setFormData({
            ...common,
            description: initialData.description || '',
            minTemp: initialData.minTemp?.toString() || '',
            maxTemp: initialData.maxTemp?.toString() || '',
            minHumidity: initialData.minHumidity?.toString() || '',
            maxHumidity: initialData.maxHumidity?.toString() || '',
          });
        } else if (itemType === 'equipment' && 'type' in initialData) {
          setFormData({
            ...common,
            type: initialData.type || '',
            minTemp: initialData.minTemp?.toString() || '',
            maxTemp: initialData.maxTemp?.toString() || '',
          });
        } else if (itemType === 'waterSource' && 'location' in initialData) {
            setFormData({
                ...common,
                location: initialData.location || '',
                minConductivity: initialData.minConductivity?.toString() || '',
                maxConductivity: initialData.maxConductivity?.toString() || '',
            });
        }
      } else {
        setFormData(getInitialState());
      }
    }
  }, [isOpen, initialData, itemType]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedData: any = { ...formData };
    Object.keys(parsedData).forEach(key => {
        if (key !== 'name' && key !== 'description' && key !== 'type' && key !== 'location') {
             if (parsedData[key] !== '' && parsedData[key] !== undefined) {
                parsedData[key] = parseFloat(parsedData[key]);
            } else {
                delete parsedData[key];
            }
        }
    });

    if (initialData?.id) {
      onSubmit({ ...initialData, ...parsedData });
    } else {
      onSubmit(parsedData);
    }
    onClose();
  };

  const title = `${initialData ? 'Chỉnh sửa' : 'Thêm'} ${
      itemType === 'area' ? 'Khu vực' : (itemType === 'equipment' ? 'Thiết bị' : 'Nguồn nước')
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Tên (*)</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white" />
          </div>
          {itemType === 'area' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600">Mô tả</label>
                <textarea name="description" value={(formData as any).description} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"></textarea>
              </div>
              <fieldset className="border p-4 rounded-md">
                <legend className="text-sm font-medium text-slate-600 px-2">Ngưỡng cảnh báo (để trống nếu không áp dụng)</legend>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-500">Nhiệt độ Tối thiểu (°C)</label>
                        <input type="number" step="0.1" name="minTemp" value={(formData as any).minTemp} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500">Nhiệt độ Tối đa (°C)</label>
                        <input type="number" step="0.1" name="maxTemp" value={(formData as any).maxTemp} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500">Độ ẩm Tối thiểu (%)</label>
                        <input type="number" step="0.1" name="minHumidity" value={(formData as any).minHumidity} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500">Độ ẩm Tối đa (%)</label>
                        <input type="number" step="0.1" name="maxHumidity" value={(formData as any).maxHumidity} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                </div>
              </fieldset>
            </>
          )}
          {itemType === 'equipment' && (
            <>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Loại thiết bị (*)</label>
                  <input type="text" name="type" placeholder="VD: Tủ lạnh, Tủ ấm" value={(formData as any).type} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white" />
                </div>
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-sm font-medium text-slate-600 px-2">Ngưỡng cảnh báo nhiệt độ (để trống nếu không áp dụng)</legend>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Nhiệt độ Tối thiểu (°C)</label>
                            <input type="number" step="0.1" name="minTemp" value={(formData as any).minTemp} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500">Nhiệt độ Tối đa (°C)</label>
                            <input type="number" step="0.1" name="maxTemp" value={(formData as any).maxTemp} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                        </div>
                    </div>
                </fieldset>
            </>
          )}
           {itemType === 'waterSource' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600">Vị trí</label>
                <input type="text" name="location" value={(formData as any).location} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white" />
              </div>
              <fieldset className="border p-4 rounded-md">
                <legend className="text-sm font-medium text-slate-600 px-2">Ngưỡng cảnh báo độ dẫn điện (*)</legend>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-500">Tối thiểu (µS/cm)</label>
                        <input type="number" step="any" name="minConductivity" value={(formData as any).minConductivity} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500">Tối đa (µS/cm)</label>
                        <input type="number" step="any" name="maxConductivity" value={(formData as any).maxConductivity} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md p-2 bg-white"/>
                    </div>
                </div>
              </fieldset>
            </>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {initialData ? 'Lưu thay đổi' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitoredItemFormModal;
import React, { useState, useEffect } from 'react';
import { AccessLog, MonitoredArea, User } from '../types';

interface AccessLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<AccessLog, 'id'> | AccessLog) => void;
  logToUpdate?: AccessLog | null;
  currentUser: User | null;
  monitoredAreas: MonitoredArea[];
}

// FIX: Define a single, unified state shape with optional properties to resolve type conflicts.
interface FormDataState {
    areaId: string;
    personOrUnit: string;
    task: string;
    notes: string;
    entryDate: string;
    entryTime: string;
    exitDate: string;
    exitTime: string;
}


const AccessLogFormModal: React.FC<AccessLogFormModalProps> = ({ isOpen, onClose, onSubmit, logToUpdate, currentUser, monitoredAreas }) => {
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  const getInitialState = (): Partial<FormDataState> => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().substring(0, 5);

    if (logToUpdate) { // Check-out mode
      return {
        notes: logToUpdate.notes || '',
        exitDate: currentDate,
        exitTime: currentTime,
      };
    } else { // Check-in mode
      return {
        areaId: monitoredAreas[0]?.id || '',
        personOrUnit: currentUser?.fullName || '',
        task: '',
        notes: '',
        entryDate: currentDate,
        entryTime: currentTime,
      };
    }
  };

  const [formData, setFormData] = useState<Partial<FormDataState>>(getInitialState());
  const [error, setError] = useState('');


  useEffect(() => {
    if (isOpen) {
      setUseCurrentTime(true);
      setFormData(getInitialState());
      setError('');
    }
  }, [isOpen, logToUpdate, currentUser, monitoredAreas]);
  
  useEffect(() => {
    let timer: number;
    if (isOpen && useCurrentTime) {
      timer = window.setInterval(() => {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().substring(0, 5);
        if (logToUpdate) {
            // FIX: This update now works with the unified state type.
            setFormData(prev => ({ ...prev, exitDate: currentDate, exitTime: currentTime }));
        } else {
            // FIX: This update now works with the unified state type.
            setFormData(prev => ({ ...prev, entryDate: currentDate, entryTime: currentTime }));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, useCurrentTime, logToUpdate]);


  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // FIX: This update now works with the unified state type.
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (logToUpdate) {
      // Handle checkout
      const { exitDate, exitTime, notes } = formData;
      // FIX: Add checks for required fields in checkout mode.
      if (!exitDate || !exitTime) {
        setError('Ngày hoặc giờ ra không hợp lệ.');
        return;
      }
      const exitDateTime = new Date(`${exitDate}T${exitTime}`);
      const entryDateTime = new Date(logToUpdate.entryTime);
      
      if (isNaN(exitDateTime.getTime())) {
        setError('Ngày hoặc giờ ra không hợp lệ.');
        return;
      }
      
      if (exitDateTime < entryDateTime) {
        setError('Thời gian ra không được sớm hơn thời gian vào.');
        return;
      }

      onSubmit({ ...logToUpdate, exitTime: exitDateTime.toISOString(), notes: notes || '' });

    } else {
      // Handle check-in
      const { areaId, personOrUnit, task, notes, entryDate, entryTime } = formData;
      // FIX: Add checks for required fields in check-in mode.
      if (!areaId || !personOrUnit || !task || !entryDate || !entryTime) {
        setError('Vui lòng điền đầy đủ các trường bắt buộc.');
        return;
      }
      const entryDateTime = new Date(`${entryDate}T${entryTime}`);

      if (isNaN(entryDateTime.getTime())) {
        setError('Ngày hoặc giờ vào không hợp lệ.');
        return;
      }

      const area = monitoredAreas.find(a => a.id === areaId);
      if (!area || !currentUser) {
        setError('Không thể xác định khu vực hoặc người dùng.');
        return;
      }
      onSubmit({
        areaId: areaId,
        areaName: area.name,
        personOrUnit: personOrUnit,
        entryTime: entryDateTime.toISOString(),
        task: task,
        notes: notes || '',
      });
    }
    onClose();
  };
  
  const isCheckOut = !!logToUpdate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            {isCheckOut ? 'Xác nhận Rời khỏi Khu vực' : 'Ghi nhận Ra/Vào'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center">
              <input id="useCurrentTimeAccess" type="checkbox" checked={useCurrentTime} onChange={(e) => setUseCurrentTime(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
              <label htmlFor="useCurrentTimeAccess" className="ml-2 block text-sm text-slate-700">Sử dụng thời gian hiện tại</label>
          </div>
          {isCheckOut ? (
            <div>
                <div className="space-y-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-md">
                    <p><strong>Khu vực:</strong> {logToUpdate.areaName}</p>
                    <p><strong>Họ tên / Đơn vị:</strong> {logToUpdate.personOrUnit}</p>
                    <p><strong>Công việc:</strong> {logToUpdate.task}</p>
                    <p><strong>Thời gian vào:</strong> {new Date(logToUpdate.entryTime).toLocaleString('vi-VN')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Ngày ra (*)</label>
                        <input type="date" name="exitDate" value={formData.exitDate || ''} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Giờ ra (*)</label>
                        <input type="time" name="exitTime" value={formData.exitTime || ''} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-600">Ghi chú (có thể bổ sung)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
                </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Ngày vào (*)</label>
                  <input type="date" name="entryDate" value={formData.entryDate || ''} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Giờ vào (*)</label>
                  <input type="time" name="entryTime" value={formData.entryTime || ''} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500 text-slate-900"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Khu vực (*)</label>
                <select name="areaId" value={formData.areaId || ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                  {monitoredAreas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Họ tên / Đơn vị (*)</label>
                <input type="text" name="personOrUnit" value={formData.personOrUnit || ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Công việc (*)</label>
                <input type="text" name="task" value={formData.task || ''} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {isCheckOut ? 'Xác nhận Rời khỏi' : 'Ghi nhận Vào'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessLogFormModal;

import React, { useState, useEffect } from 'react';
import { IncidentReport, User } from '../types';

interface IncidentReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<IncidentReport, 'id'> | IncidentReport) => void;
  initialData?: IncidentReport | null;
  currentUser: User | null;
}

const IncidentReportFormModal: React.FC<IncidentReportFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUser }) => {
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  const getInitialState = () => {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().substring(0, 5),
        location: '',
        incidentType: 'Phơi nhiễm' as 'Phơi nhiễm' | 'Tai nạn' | 'Cả phơi nhiễm và tai nạn',
        description: '',
        involvedPersonnel: '',
        immediateAction: '',
        correctiveAction: '',
        reportedBy: currentUser?.fullName || '',
        reviewer: '',
        status: 'Mở' as 'Mở' | 'Đang xử lý' | 'Đã đóng',
      }
  };

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      const isEditing = !!initialData;
      setUseCurrentTime(!isEditing); // Default to true for new, false for editing
      if (initialData) {
        setFormData({ 
            ...initialData,
            reviewer: initialData.reviewer || '',
         });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [initialData, isOpen, currentUser]);
  
  useEffect(() => {
    let timer: number;
    if (isOpen && useCurrentTime && !initialData) { // Only auto-update for new entries
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
  }, [isOpen, useCurrentTime, initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
      onSubmit({ ...initialData, ...formData });
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            {initialData ? 'Chi tiết / Cập nhật Báo cáo Sự cố' : 'Tạo Phiếu Báo cáo Sự cố'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="flex items-center">
                <input
                    id="useCurrentTimeIncident"
                    type="checkbox"
                    checked={useCurrentTime}
                    onChange={(e) => setUseCurrentTime(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="useCurrentTimeIncident" className="ml-2 block text-sm text-slate-700">
                    Ghi nhận theo thời gian thực
                </label>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Ngày xảy ra (*)</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Giờ xảy ra (*)</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-600">Vị trí / Khu vực xảy ra (*)</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600">Đặc điểm sự cố (*)</label>
                <select name="incidentType" value={formData.incidentType} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                    <option value="Phơi nhiễm">Phơi nhiễm</option>
                    <option value="Tai nạn">Tai nạn</option>
                    <option value="Cả phơi nhiễm và tai nạn">Cả phơi nhiễm và tai nạn</option>
                </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Mô tả chi tiết sự cố (*)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Người / Thiết bị liên quan</label>
                <input type="text" name="involvedPersonnel" value={formData.involvedPersonnel} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Hành động xử lý tức thời (*)</label>
                <textarea name="immediateAction" value={formData.immediateAction} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Hành động khắc phục / phòng ngừa</label>
                <textarea name="correctiveAction" value={formData.correctiveAction} onChange={handleChange} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Người báo cáo</label>
              <input type="text" name="reportedBy" value={formData.reportedBy} readOnly className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-slate-100 text-slate-700"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Người xem xét</label>
              <input type="text" name="reviewer" value={formData.reviewer} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600">Tình trạng phiếu (*)</label>
              <select name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                <option value="Mở">Mở</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đã đóng">Đã đóng</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {initialData ? 'Lưu thay đổi' : 'Tạo Phiếu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentReportFormModal;
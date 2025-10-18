import React, { useState, useEffect } from 'react';
import { DisposalRecord } from '../types';

interface DisposalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<DisposalRecord, 'id'> | DisposalRecord) => void;
  initialData?: DisposalRecord | null;
  currentUserFullName: string;
}

const DisposalFormModal: React.FC<DisposalFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, currentUserFullName }) => {
  const getInitialState = () => ({
    date: new Date().toISOString().split('T')[0],
    itemName: '',
    supplier: '',
    lotNumber: '',
    quantity: '',
    reason: '',
    isReplaced: 'no' as 'yes' | 'no',
    disposalMethod: '',
    approver: '',
    executor: currentUserFullName,
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [initialData, isOpen, currentUserFullName]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            {initialData ? 'Chỉnh sửa Biên bản Hủy' : 'Nhập Biên bản Hủy Vật tư'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Ngày hủy (*)</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Tên hóa chất / vật tư (*)</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Nhà cung cấp</label>
              <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Số lô</label>
              <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Số lượng (*)</label>
              <input type="text" name="quantity" placeholder="VD: 10 hộp" value={formData.quantity} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Nhà cung cấp có thay thế?</label>
              <select name="isReplaced" value={formData.isReplaced} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900">
                <option value="no">Không</option>
                <option value="yes">Có</option>
              </select>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Lý do hủy (*)</label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} required rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"></textarea>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Phương pháp hủy (*)</label>
                <input type="text" name="disposalMethod" value={formData.disposalMethod} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Người phê duyệt (*)</label>
              <input type="text" name="approver" value={formData.approver} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Người thực hiện (*)</label>
              <input type="text" name="executor" value={formData.executor} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {initialData ? 'Lưu thay đổi' : 'Lưu Biên bản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisposalFormModal;

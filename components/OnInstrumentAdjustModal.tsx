
import React, { useState, useEffect } from 'react';
import { OnInstrumentStock, User } from '../types';

export interface OnInstrumentAdjustData {
    action: 'use' | 'return' | 'discard';
    quantity: number;
    reason: string;
}

interface OnInstrumentAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OnInstrumentAdjustData) => void;
  stockItem: OnInstrumentStock | null;
  action: 'use' | 'return' | 'discard';
  currentUser: User | null;
}

const OnInstrumentAdjustModal: React.FC<OnInstrumentAdjustModalProps> = ({ 
    isOpen, onClose, onSubmit, stockItem, action, currentUser
}) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !stockItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const adjQuantity = parseFloat(quantity);
    
    if (isNaN(adjQuantity) || adjQuantity <= 0) {
      setError('Số lượng phải là một số dương.');
      return;
    }
    if (adjQuantity > stockItem.quantity) {
      setError('Số lượng điều chỉnh không được lớn hơn số lượng hiện có trên máy.');
      return;
    }
    if (!reason.trim()){
        setError('Lý do là bắt buộc.');
        return;
    }

    onSubmit({ action, quantity: adjQuantity, reason });
  };
  
  const modalTitle = {
      use: 'Ghi nhận sử dụng từ máy',
      return: 'Trả hóa chất về kho',
      discard: 'Hủy hóa chất trên máy'
  }[action];

  const quantityLabel = {
      use: 'Số lượng đã sử dụng',
      return: 'Số lượng trả về kho',
      discard: 'Số lượng hủy'
  }[action];
  
  const reasonPlaceholder = {
      use: 'VD: Chạy 20 test bệnh nhân',
      return: 'VD: Không sử dụng hết trong ngày',
      discard: 'VD: Hết hạn sau mở nắp'
  }[action];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">{modalTitle}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-800">{stockItem.chemicalName}</h3>
            <p className="text-sm text-slate-600">Số lô: {stockItem.lotNumber}</p>
            <p className="text-sm text-slate-600">Số lượng hiện tại trên máy: {stockItem.quantity} {stockItem.unit}</p>
            <p className="text-sm text-slate-600">Người thực hiện: <span className="font-semibold">{currentUser?.fullName}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">
              {quantityLabel} ({stockItem.unit}) (*)
            </label>
            <input 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              min="0.01"
              max={stockItem.quantity}
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Lý do (*)</label>
            <input 
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder={reasonPlaceholder}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Xác nhận</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnInstrumentAdjustModal;

import React, { useState, useEffect, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical, User, StorageLocation, Instrument } from '../types';

interface AdjustQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chemicalId: string, change: number, reason: string, person: string, changeType: 'use' | 'add' | 'destroy', recipient?: string, postPreparationExpiration?: string) => void;
  chemical: Chemical | null;
  currentUser: User | null;
  storageLocations: StorageLocation[];
  instruments: Instrument[];
}

const AdjustQuantityModal: React.FC<AdjustQuantityModalProps> = ({ 
    isOpen, onClose, onSubmit, chemical, currentUser, storageLocations, instruments 
}) => {
  const [changeType, setChangeType] = useState<'use' | 'add' | 'destroy'>('use');
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('');
  const [recipient, setRecipient] = useState('');
  const [destinationType, setDestinationType] = useState<'department' | 'storage' | 'instrument'>('department');
  const [postPreparationExpiration, setPostPreparationExpiration] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setChangeType('use');
      setQuantityChange('');
      setReason('');
      setRecipient('');
      setDestinationType('department');
      setPostPreparationExpiration('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !chemical) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const changeAmount = parseFloat(quantityChange);
    
    if (isNaN(changeAmount) || changeAmount <= 0) {
      setError('Số lượng thay đổi phải là một số dương.');
      return;
    }
    
    if ((changeType === 'use' || changeType === 'destroy') && changeAmount > chemical.quantity) {
      setError('Số lượng xuất/hủy không được lớn hơn số lượng còn lại.');
      return;
    }

    if (!currentUser) {
      setError('Không tìm thấy người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    const finalChange = (changeType === 'use' || changeType === 'destroy') ? -changeAmount : changeAmount;
    
    let finalRecipient = '';
    if (changeType === 'use') {
        if (destinationType !== 'department' && !recipient) {
             setError('Vui lòng chọn đích đến.');
             return;
        }
        if (destinationType === 'department' && !recipient.trim()) {
            setError('Vui lòng nhập nơi nhận.');
            return;
        }

        switch(destinationType) {
            case 'department': finalRecipient = recipient.trim(); break;
            case 'storage': finalRecipient = `Đến kho: ${recipient.trim()}`; break;
            case 'instrument': finalRecipient = `Cho máy: ${recipient.trim()}`; break;
        }
    }

    onSubmit(chemical.id, finalChange, reason.trim(), currentUser.fullName, changeType, finalRecipient || undefined, postPreparationExpiration);
  };
  
  const quantityLabel = {
      use: 'Số lượng sử dụng',
      destroy: 'Số lượng hủy',
      add: 'Số lượng thêm',
  }[changeType];
  
  const reasonPlaceholder = {
      use: "VD: Sử dụng cho xét nghiệm X",
      destroy: "VD: Hết hạn, hỏng, rơi vỡ",
      add: "VD: Bổ sung từ kho tổng",
  }[changeType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">Điều chỉnh số lượng</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-800">{chemical.name}</h3>
            <p className="text-sm text-slate-600">Số lượng hiện tại: {chemical.quantity} {chemical.unit}</p>
            <p className="text-sm text-slate-600">Người thực hiện: <span className="font-semibold">{currentUser?.fullName}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Loại điều chỉnh</label>
            <select
              value={changeType}
              onChange={(e) => setChangeType(e.target.value as any)}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="use">Sử dụng</option>
              <option value="destroy">Hủy</option>
              <option value="add">Nhập thêm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              {quantityLabel} ({chemical.unit})
            </label>
            <input 
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              required
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              min="0.01"
              max={changeType !== 'add' ? chemical.quantity : undefined}
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Lý do điều chỉnh (*)</label>
            <input 
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder={reasonPlaceholder}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {changeType === 'use' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-600">Nơi nhận</label>
                <select
                  value={destinationType}
                  onChange={(e) => {
                      setDestinationType(e.target.value as 'department' | 'storage' | 'instrument');
                      setRecipient('');
                  }}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="department">Khoa/Phòng/Người nhận</option>
                  <option value="storage">Kho/Tủ nội bộ</option>
                  <option value="instrument">Máy xét nghiệm</option>
                </select>
              </div>
              
              {destinationType === 'department' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Tên người/khoa phòng nhận (*)</label>
                    <input 
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                      placeholder="VD: Khoa Huyết học"
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
              )}
              
              {destinationType === 'storage' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Chọn kho/tủ đích (*)</label>
                    <select 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Chọn kho/tủ --</option>
                        {storageLocations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                    </select>
                  </div>
              )}
    
              {destinationType === 'instrument' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Chọn máy xét nghiệm (*)</label>
                    <select 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      required
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Chọn máy --</option>
                        {instruments.map(inst => <option key={inst.id} value={inst.name}>{inst.name}</option>)}
                    </select>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600">Hạn sử dụng sau pha (Nếu có)</label>
                <input 
                  type="date"
                  value={postPreparationExpiration}
                  onChange={(e) => setPostPreparationExpiration(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustQuantityModal;
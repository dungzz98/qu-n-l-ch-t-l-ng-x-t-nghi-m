
import React, { useState, useEffect } from 'react';
import { Chemical, Instrument } from '../types';

interface MoveToInstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instrumentId: string, quantity: number, openVialExpiration?: string) => void;
  chemical: Chemical | null;
  instruments: Instrument[];
}

const MoveToInstrumentModal: React.FC<MoveToInstrumentModalProps> = ({ isOpen, onClose, onSubmit, chemical, instruments }) => {
  const [instrumentId, setInstrumentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [openVialExpiration, setOpenVialExpiration] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInstrumentId('');
      setQuantity('');
      setOpenVialExpiration('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !chemical) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const moveQuantity = parseFloat(quantity);
    
    if (!instrumentId) {
      setError('Vui lòng chọn một máy xét nghiệm.');
      return;
    }
    if (isNaN(moveQuantity) || moveQuantity <= 0) {
      setError('Số lượng chuyển phải là một số dương.');
      return;
    }
    if (moveQuantity > chemical.quantity) {
      setError('Số lượng chuyển không được lớn hơn số lượng còn lại trong kho.');
      return;
    }

    onSubmit(instrumentId, moveQuantity, openVialExpiration || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">Chuyển hóa chất lên máy</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-800">{chemical.name}</h3>
            <p className="text-sm text-slate-600">Số lô: {chemical.lotNumber}</p>
            <p className="text-sm text-slate-600">Số lượng hiện tại trong kho: {chemical.quantity} {chemical.unit}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Chọn máy xét nghiệm (*)</label>
            <select
              value={instrumentId}
              onChange={(e) => setInstrumentId(e.target.value)}
              required
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn máy --</option>
              {instruments.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Số lượng chuyển ({chemical.unit}) (*)
            </label>
            <input 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              min="0.01"
              max={chemical.quantity}
              step="any"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Hạn sử dụng sau khi mở nắp (Nếu có)</label>
            <input 
              type="date"
              value={openVialExpiration}
              onChange={(e) => setOpenVialExpiration(e.target.value)}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Xác nhận chuyển</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveToInstrumentModal;

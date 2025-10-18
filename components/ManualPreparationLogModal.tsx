import React, { useState, useEffect } from 'react';
import { ManualPreparationLog, Chemical, User } from '../types';

interface ManualPreparationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ManualPreparationLog, 'id'>) => void;
  currentUser: User | null;
  suggestedChemicals: { name: string; supplier: string; }[];
  chemicals: Chemical[];
}

const ManualPreparationLogModal: React.FC<ManualPreparationLogModalProps> = ({ 
    isOpen, onClose, onSubmit, currentUser, suggestedChemicals, chemicals
}) => {
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    
    const getInitialState = () => ({
        date: new Date().toISOString(),
        chemicalName: '',
        supplier: '',
        lotNumber: '',
        expirationDate: '',
        postPreparationExpiration: '',
        person: currentUser?.fullName || '',
        notes: '',
    });
    
  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setUseCurrentTime(true);
      setFormData(getInitialState());
    }
  }, [isOpen, currentUser]);
  
  useEffect(() => {
    if (isOpen && useCurrentTime) {
      const now = new Date();
      setFormData(prev => ({
        ...prev,
        date: now.toISOString(),
      }));
    }
  }, [isOpen, useCurrentTime, formData.date]); // Re-run if date changes externally just in case

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'chemicalName') {
        const matchingLots = chemicals.filter(c => c.name === value && c.quantity > 0);

        if (matchingLots.length > 0) {
            matchingLots.sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime());
            const bestLot = matchingLots[0];

            setFormData(prev => ({
                ...prev,
                chemicalName: value,
                supplier: bestLot.supplier,
                lotNumber: bestLot.lotNumber,
                expirationDate: bestLot.expirationDate,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                chemicalName: value,
                supplier: '',
                lotNumber: '',
                expirationDate: '',
            }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const time = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
    const isoString = new Date(`${date}T${time}`).toISOString();
    setFormData(prev => ({...prev, date: isoString}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { date, chemicalName, person, lotNumber, expirationDate, supplier } = formData;
    if (!date || !chemicalName || !person || !lotNumber || !expirationDate || !supplier) {
        alert("Vui lòng điền đầy đủ các trường bắt buộc.");
        return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            Nhập thủ công Sổ Pha chế
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-1">
                <input id="useCurrentTimePrep" type="checkbox" checked={useCurrentTime} onChange={e => setUseCurrentTime(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
                <label htmlFor="useCurrentTimePrep" className="ml-2 block text-sm text-slate-700">Sử dụng thời gian hiện tại</label>
              </div>
              <label className="block text-sm font-medium text-slate-600">Ngày pha (*)</label>
              <input type="date" name="date" value={formData.date.split('T')[0]} onChange={handleDateChange} required disabled={useCurrentTime} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white disabled:bg-slate-100 disabled:text-slate-500"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Người pha (*)</label>
              <input type="text" name="person" value={formData.person} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Tên hóa chất (*)</label>
              <input type="text" name="chemicalName" value={formData.chemicalName} onChange={handleChange} required list="chemical-suggestions-list" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
              <datalist id="chemical-suggestions-list">
                {suggestedChemicals.map(chem => (
                    <option key={chem.name} value={chem.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Hãng hóa chất (*)</label>
              <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 bg-slate-50" readOnly/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Số lô (*)</label>
              <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 bg-slate-50" readOnly/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">HSD trước pha (*)</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 bg-slate-50" readOnly/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">HSD sau pha (nếu có)</label>
              <input type="date" name="postPreparationExpiration" value={formData.postPreparationExpiration} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900"/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Ghi chú</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="VD: Pha cho xét nghiệm X, aliquout..." className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400"/>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Lưu vào sổ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualPreparationLogModal;
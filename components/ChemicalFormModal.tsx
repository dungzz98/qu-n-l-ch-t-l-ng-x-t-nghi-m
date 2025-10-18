import React, { useState, useEffect } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical, StorageLocation } from '../types';

interface ChemicalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chemical: Omit<Chemical, 'id' | 'barcode'> | Chemical) => void;
  initialData?: Chemical | null;
  storageLocations: StorageLocation[];
}

const STANDARD_UNITS = ['ml', 'g', 'l', 'kg', 'cái', 'hộp', 'kit'];

const ChemicalFormModal: React.FC<ChemicalFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, storageLocations }) => {
  const [formData, setFormData] = useState({
    name: '',
    casNumber: '',
    lotNumber: '',
    supplier: '',
    quantity: '',
    unit: 'ml',
    dateReceived: '',
    personReceived: '',
    deliveryPerson: '',
    sequenceNumber: '',
    expirationDate: '',
    storageLocation: '',
    initialQuantity: '',
    qualityAssessment: '',
  });
  const [safetyFile, setSafetyFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);


  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        casNumber: initialData.casNumber || '',
        lotNumber: initialData.lotNumber || '',
        supplier: initialData.supplier || '',
        quantity: String(initialData.quantity || ''),
        unit: initialData.unit || 'ml',
        dateReceived: initialData.dateReceived || '',
        personReceived: initialData.personReceived || '',
        deliveryPerson: initialData.deliveryPerson || '',
        sequenceNumber: initialData.sequenceNumber || '',
        expirationDate: initialData.expirationDate || '',
        storageLocation: initialData.storageLocation || '',
        initialQuantity: String(initialData.initialQuantity || ''),
        qualityAssessment: initialData.qualityAssessment || '',
      });
      if (initialData.safetyDocBase64 && initialData.safetyDocMimeType) {
        setSafetyFile({
            name: `Tài liệu an toàn hiện tại.${initialData.safetyDocMimeType.split('/')[1] || 'bin'}`,
            base64: initialData.safetyDocBase64,
            mimeType: initialData.safetyDocMimeType,
        });
      } else {
        setSafetyFile(null);
      }
    } else {
      setFormData({
        name: '', casNumber: '', lotNumber: '', supplier: '', quantity: '',
        unit: 'ml', dateReceived: '', personReceived: '', deliveryPerson: '', sequenceNumber: '', expirationDate: '',
        storageLocation: '', initialQuantity: '', qualityAssessment: ''
      });
      setSafetyFile(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Special handling for quantity of a new chemical to link initial quantity
    if (name === 'quantity' && !initialData?.id) {
        setFormData(prev => ({ ...prev, quantity: value, initialQuantity: value }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        // The result includes the data URI prefix (e.g., "data:image/png;base64,"),
        // so we need to split it to get the pure base64 string.
        const base64String = result.split(',')[1];
        setSafetyFile({
          name: file.name,
          base64: base64String,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chemicalData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      initialQuantity: parseFloat(formData.initialQuantity || formData.quantity),
      safetyDocBase64: safetyFile?.base64,
      safetyDocMimeType: safetyFile?.mimeType,
    };

    if (initialData?.id) {
      onSubmit({ ...initialData, ...chemicalData });
    } else {
      const { id, ...rest } = initialData || {}; // Exclude id if it exists from a template
      onSubmit({ ...rest, ...chemicalData });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">
            {initialData?.id ? 'Chỉnh sửa Hóa chất' : 'Thêm Hóa chất mới'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">Tên hóa chất</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Số CAS</label>
              <input type="text" name="casNumber" value={formData.casNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Số lô</label>
              <input type="text" name="lotNumber" value={formData.lotNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Số thứ tự (để tạo barcode)</label>
              <input type="text" name="sequenceNumber" placeholder="VD: 1, 2, 3..." value={formData.sequenceNumber} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Nhà cung cấp</label>
              <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-slate-600">Số lượng còn lại</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500" min="0" step="any"/>
                </div>
                <div className="w-28">
                    <label className="block text-sm font-medium text-slate-600">Đơn vị</label>
                    <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                        list="standard-units"
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <datalist id="standard-units">
                        {STANDARD_UNITS.map(unit => (
                            <option key={unit} value={unit} />
                        ))}
                    </datalist>
                </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Ngày nhận</label>
              <input type="date" name="dateReceived" value={formData.dateReceived} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Hạn sử dụng</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Người nhận (tại Lab)</label>
              <input type="text" name="personReceived" value={formData.personReceived} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">Người giao hàng</label>
              <input type="text" name="deliveryPerson" value={formData.deliveryPerson} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-600">Vị trí lưu trữ</label>
              <input 
                type="text" 
                name="storageLocation" 
                value={formData.storageLocation} 
                onChange={handleChange} 
                list="storage-locations-list"
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="storage-locations-list">
                    {storageLocations.map(loc => (
                        <option key={loc.id} value={loc.name} />
                    ))}
                </datalist>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Đánh giá chất lượng khi nhập kho</label>
                <input type="text" name="qualityAssessment" value={formData.qualityAssessment} onChange={handleChange} placeholder="VD: Hàng còn nguyên niêm phong, cảm quan tốt..." className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"/>
            </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600">Tài liệu An toàn (PDF, PNG, JPG)</label>
                <div className="mt-1 flex items-center gap-4">
                     <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white text-sm text-slate-700 border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">
                        <span>{safetyFile ? 'Thay đổi file' : 'Chọn file'}</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                    </label>
                    {safetyFile && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                           <span className="truncate max-w-xs">{safetyFile.name}</span>
                           <button type="button" onClick={() => setSafetyFile(null)} className="text-red-500 hover:text-red-700" title="Xóa file đã chọn">&times;</button>
                        </div>
                    )}
                </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {initialData?.id ? 'Lưu thay đổi' : 'Thêm hóa chất'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChemicalFormModal;
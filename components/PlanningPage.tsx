import React, { useState, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical, ChemicalMaster, PlannedItem, PlanningSlip } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { EyeIcon } from './icons/EyeIcon';
import { PrintIcon } from './icons/PrintIcon';
import ConfirmationModal from './ConfirmationModal';

interface ChemicalForPlanning {
  key: string;
  name: string;
  casNumber: string;
  unit: string;
  totalStock: number;
  supplier: string;
}

interface PlanningPageProps {
  chemicals: Chemical[];
  chemicalMasters: ChemicalMaster[];
  planningSlips: PlanningSlip[];
  onSaveSlip: (items: PlannedItem[]) => PlanningSlip;
  onViewSlip: (slip: PlanningSlip) => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const PlanningPage: React.FC<PlanningPageProps> = ({ chemicals, chemicalMasters, planningSlips, onSaveSlip, onViewSlip }) => {
  const [planningList, setPlanningList] = useState<PlannedItem[]>([]);
  const [filterText, setFilterText] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const chemicalsForPlanning = useMemo<ChemicalForPlanning[]>(() => {
    const stockLevels = new Map<string, number>();
    chemicals.forEach(chem => {
        const currentStock = stockLevels.get(chem.casNumber) || 0;
        stockLevels.set(chem.casNumber, currentStock + chem.quantity);
    });

    return chemicalMasters.map(master => ({
        key: master.id,
        name: master.name,
        casNumber: master.casNumber,
        unit: master.defaultUnit,
        totalStock: stockLevels.get(master.casNumber) || 0,
        supplier: master.defaultSupplier,
    })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [chemicals, chemicalMasters]);
  
  const filteredChemicalsForPlanning = useMemo(() => {
    if (!filterText) return chemicalsForPlanning;
    const lowerCaseFilter = filterText.toLowerCase();
    return chemicalsForPlanning.filter(chem => 
        chem.name.toLowerCase().includes(lowerCaseFilter) ||
        chem.casNumber.toLowerCase().includes(lowerCaseFilter)
    );
  }, [chemicalsForPlanning, filterText]);


  const handleAddItem = (chem: ChemicalForPlanning) => {
    if (planningList.some(item => item.casNumber === chem.casNumber && item.name === chem.name)) {
      return;
    }
    const newItem: PlannedItem = {
      name: chem.name,
      casNumber: chem.casNumber,
      unit: chem.unit,
      quantity: 1,
      supplier: chem.supplier,
      notes: '',
    };
    setPlanningList(prev => [...prev, newItem]);
  };
  
  const handleRemoveItem = (index: number) => {
    setPlanningList(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpdateItem = (index: number, field: keyof PlannedItem, value: string | number) => {
      setPlanningList(prev => {
          const newList = [...prev];
          const item = { ...newList[index] };
          if (field === 'quantity') {
              const numValue = Number(value);
              item[field] = isNaN(numValue) || numValue < 0 ? 0 : numValue;
          } else {
              (item[field] as string | undefined) = value as string;
          }
          newList[index] = item;
          return newList;
      });
  };

  const handleConfirmSave = () => {
     const validItems = planningList.filter(item => item.quantity > 0);
     if (validItems.length === 0) {
       return; // Should not happen if button is disabled, but as a safeguard.
     }
     try {
         const newSlip = onSaveSlip(validItems);
         setPlanningList([]); // Clear the list
         onViewSlip(newSlip); // Open the modal with the new slip
     } catch (error) {
         console.error("Lỗi khi lưu phiếu dự trù:", error);
         alert(`Đã xảy ra lỗi khi lưu phiếu: ${error instanceof Error ? error.message : String(error)}`);
     }
  };

  const handleSaveSlipClick = () => {
    const validItems = planningList.filter(item => item.quantity > 0);

    if (validItems.length === 0) {
        alert('Danh sách dự trù trống hoặc tất cả các mặt hàng có số lượng bằng 0. Vui lòng thêm hóa chất và nhập số lượng hợp lệ.');
        return;
    }
    setIsConfirmModalOpen(true);
  };
  
  const getConfirmationMessage = () => {
    const validItems = planningList.filter(item => item.quantity > 0);
    return planningList.length !== validItems.length
        ? `Bạn có chắc muốn lưu và chốt phiếu dự trù với ${validItems.length} loại hóa chất? (Các mặt hàng có số lượng 0 sẽ bị loại bỏ)`
        : `Bạn có chắc muốn lưu và chốt phiếu dự trù với ${validItems.length} loại hóa chất?`;
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Panel: Chemical Selection */}
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-1 text-slate-800">1. Chọn hóa chất từ danh mục</h2>
          <p className="text-sm text-slate-500 mb-4">Nhấn nút (+) để thêm hóa chất vào phiếu dự trù hiện tại.</p>
          <input
            type="text"
            placeholder="Tìm kiếm hóa chất theo tên hoặc số CAS..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full p-2 mb-4 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex-grow min-h-0 overflow-y-auto pr-2 border-t border-slate-200">
            {filteredChemicalsForPlanning.length > 0 ? filteredChemicalsForPlanning.map(chem => {
                const isInList = planningList.some(item => item.casNumber === chem.casNumber && item.name === chem.name);
                return (
                    <div key={chem.key} className={`flex items-center justify-between p-3 border-b border-slate-100 ${isInList ? 'bg-slate-50' : ''}`}>
                      <div>
                        <p className="font-semibold text-slate-800">{chem.name}</p>
                        <p className="text-sm text-slate-500">
                          CAS: {chem.casNumber} - Tồn kho: {chem.totalStock.toLocaleString()} {chem.unit}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleAddItem(chem)}
                        disabled={isInList}
                        className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        title={isInList ? 'Đã có trong danh sách' : 'Thêm vào danh sách dự trù'}
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                )
            }) : (
                <p className="text-center text-slate-500 py-8">
                  {chemicalMasters.length === 0 ? "Chưa có hóa chất nào trong danh mục." : "Không tìm thấy hóa chất phù hợp."}
                </p>
            )}
          </div>
        </div>
        
        {/* Right Panel: Planning List and History */}
        <div className="flex flex-col gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
              <div className="flex flex-wrap justify-between items-start mb-4 gap-3">
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-slate-800">2. Phiếu dự trù hiện tại</h2>
                  <p className="text-sm text-slate-500">Chỉnh sửa số lượng, nhà cung cấp và ghi chú.</p>
                </div>
                <button
                    onClick={handleSaveSlipClick}
                    disabled={planningList.length === 0}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <ClipboardCheckIcon className="w-5 h-5 mr-2" />
                    Lưu và chốt phiếu
                  </button>
              </div>
              <div className="flex-grow min-h-0 overflow-y-auto pr-2 border-t border-slate-200 max-h-80">
                  {planningList.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                          {planningList.map((item, index) => (
                              <div key={`${item.casNumber}-${index}`} className="py-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-800">{item.name}</p>
                                        <p className="text-sm text-slate-500">CAS: {item.casNumber}</p>
                                    </div>
                                    <button onClick={() => handleRemoveItem(index)} className="p-1 text-red-500 hover:text-red-700" title="Xóa khỏi danh sách">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600">Số lượng ({item.unit})</label>
                                        <input type="number" value={item.quantity} onChange={e => handleUpdateItem(index, 'quantity', e.target.value)} min="0" className="mt-1 w-full p-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"/>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600">Nhà cung cấp</label>
                                        <input type="text" value={item.supplier} onChange={e => handleUpdateItem(index, 'supplier', e.target.value)} className="mt-1 w-full p-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"/>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-medium text-slate-600">Ghi chú</label>
                                        <input type="text" value={item.notes || ''} onChange={e => handleUpdateItem(index, 'notes', e.target.value)} className="mt-1 w-full p-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"/>
                                    </div>
                                </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="flex items-center justify-center text-center text-slate-500 h-48">
                          <p>Danh sách dự trù đang trống.</p>
                      </div>
                  )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800">3. Lịch sử phiếu dự trù</h2>
                  <div className="flex-grow min-h-0 overflow-y-auto pr-2 border-t border-slate-200 max-h-80">
                      {planningSlips.length > 0 ? (
                          <ul className="divide-y divide-slate-100">
                            {planningSlips.map(slip => (
                                <li key={slip.id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                    <div>
                                        <p className="font-semibold text-blue-700">{slip.id}</p>
                                        <p className="text-sm text-slate-500">Ngày tạo: {formatDate(slip.createdAt)} - Người tạo: {slip.createdBy}</p>
                                    </div>
                                    <button onClick={() => onViewSlip(slip)} className="p-2 text-slate-600 hover:text-blue-700" title="Xem chi tiết và In">
                                        <EyeIcon className="w-5 h-5"/>
                                    </button>
                                </li>
                            ))}
                          </ul>
                      ) : (
                          <div className="flex items-center justify-center text-center text-slate-500 h-24">
                              <p>Chưa có lịch sử dự trù.</p>
                          </div>
                      )}
                  </div>
            </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Xác nhận Lưu và Chốt phiếu"
        message={getConfirmationMessage()}
      />
    </>
  );
};

export default PlanningPage;
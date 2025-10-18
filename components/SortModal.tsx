
import React, { useState, useEffect, useRef } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';

type SortableKeys = keyof Pick<Chemical, 'name' | 'casNumber' | 'lotNumber' | 'quantity' | 'expirationDate' | 'barcode'>;

export interface SortConfig {
  key: SortableKeys;
  direction: 'asc' | 'desc';
}

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (configs: SortConfig[]) => void;
  currentConfigs: SortConfig[];
}

const SORTABLE_COLUMNS: { key: SortableKeys, label: string }[] = [
  { key: 'name', label: 'Tên hóa chất' },
  { key: 'expirationDate', label: 'Hạn sử dụng' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'barcode', label: 'Mã Barcode' },
  { key: 'casNumber', label: 'Số CAS' },
  { key: 'lotNumber', label: 'Số lô' },
];

const SortModal: React.FC<SortModalProps> = ({ isOpen, onClose, onApply, currentConfigs }) => {
  const [configs, setConfigs] = useState<SortConfig[]>([]);
  const dragItemNode = useRef<HTMLDivElement | null>(null);
  const dragItemIndex = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfigs(currentConfigs.map(c => ({...c}))); // Create a deep copy
    }
  }, [currentConfigs, isOpen]);

  if (!isOpen) return null;

  const handleAddConfig = () => {
    const availableKeys = SORTABLE_COLUMNS.map(c => c.key).filter(
      key => !configs.some(c => c.key === key)
    );
    if (availableKeys.length > 0) {
      setConfigs([...configs, { key: availableKeys[0], direction: 'asc' }]);
    }
  };

  const handleRemoveConfig = (index: number) => {
    setConfigs(configs.filter((_, i) => i !== index));
  };

  const handleConfigChange = (index: number, newConfig: Partial<SortConfig>) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], ...newConfig };
    setConfigs(newConfigs);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItemNode.current = e.currentTarget;
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Use a timeout to ensure the browser has time to update the DOM before we add styles
    setTimeout(() => {
        if(dragItemNode.current) {
            dragItemNode.current.classList.add('opacity-50', 'bg-blue-100', 'shadow-lg');
        }
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Check if we are dragging over a different item
    if (dragItemNode.current && dragItemNode.current !== e.currentTarget) {
        const newConfigs = [...configs];
        if (dragItemIndex.current === null) return;
        
        // Remove the dragged item from its original position
        const draggedItem = newConfigs.splice(dragItemIndex.current, 1)[0];
        // Insert it at the new position
        newConfigs.splice(index, 0, draggedItem);
        // Update the index of the item being dragged
        dragItemIndex.current = index;
        setConfigs(newConfigs);
    }
  };

  const handleDragEnd = () => {
    if (dragItemNode.current) {
        dragItemNode.current.classList.remove('opacity-50', 'bg-blue-100', 'shadow-lg');
    }
    dragItemNode.current = null;
    dragItemIndex.current = null;
  };

  const handleApply = () => {
    onApply(configs);
    onClose();
  };
  
  const handleReset = () => {
      setConfigs([]);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold text-slate-700">Tùy chỉnh Sắp xếp</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
        </div>
        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {configs.length > 0 ? configs.map((config, index) => (
                <div 
                    key={config.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border border-slate-200 transition-all duration-150"
                >
                    <div className="cursor-grab text-slate-400 p-1" title="Kéo để sắp xếp lại">
                        <DragHandleIcon className="w-5 h-5"/>
                    </div>
                    <div className="font-bold text-slate-500">{index + 1}.</div>
                    <select
                        value={config.key}
                        onChange={(e) => handleConfigChange(index, { key: e.target.value as SortableKeys })}
                        className="flex-grow p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {SORTABLE_COLUMNS.map(col => (
                           <option key={col.key} value={col.key} disabled={configs.some((c, i) => i !== index && c.key === col.key)}>
                               {col.label}
                           </option>
                        ))}
                    </select>
                    <select
                        value={config.direction}
                        onChange={(e) => handleConfigChange(index, { direction: e.target.value as 'asc' | 'desc' })}
                        className="p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="asc">Tăng dần</option>
                        <option value="desc">Giảm dần</option>
                    </select>
                    <button onClick={() => handleRemoveConfig(index)} className="p-2 text-red-600 hover:text-red-800"><TrashIcon /></button>
                </div>
            )) : <p className="text-center text-slate-500 py-4">Chưa có quy tắc sắp xếp nào.</p>}

            <button
                onClick={handleAddConfig}
                disabled={configs.length >= SORTABLE_COLUMNS.length}
                className="w-full mt-2 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                Thêm mức sắp xếp
            </button>
        </div>
        <div className="mt-6 flex justify-between items-center">
             <button type="button" onClick={handleReset} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
                Xóa hết
            </button>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Hủy</button>
                <button type="button" onClick={handleApply} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Áp dụng</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SortModal;


import React, { useState, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { ChemicalMaster, StorageLocation, Instrument } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ImportIcon } from './icons/ImportIcon';
import CatalogImportModal from './CatalogImportModal';

interface CatalogPageProps {
  chemicalMasters: ChemicalMaster[];
  onAddChemicalMaster: () => void;
  onEditChemicalMaster: (master: ChemicalMaster) => void;
  onDeleteChemicalMaster: (id: string) => void;
  onImportChemicalMasters: (file: File, mode: 'replace' | 'append') => void;
  onDownloadChemicalTemplate: () => void;
  
  storageLocations: StorageLocation[];
  onAddStorage: () => void;
  onEditStorage: (storage: StorageLocation) => void;
  onDeleteStorage: (id: string) => void;
  
  instruments: Instrument[];
  onAddInstrument: () => void;
  onEditInstrument: (instrument: Instrument) => void;
  onDeleteInstrument: (id: string) => void;
}

type ActiveTab = 'chemicals' | 'storage' | 'instruments';

const CatalogPage: React.FC<CatalogPageProps> = ({
  chemicalMasters, onAddChemicalMaster, onEditChemicalMaster, onDeleteChemicalMaster, onImportChemicalMasters, onDownloadChemicalTemplate,
  storageLocations, onAddStorage, onEditStorage, onDeleteStorage,
  instruments, onAddInstrument, onEditInstrument, onDeleteInstrument
}) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('chemicals');
    const [filterText, setFilterText] = useState('');

    const filteredChemicalMasters = useMemo(() => {
      if (!filterText) return chemicalMasters;
      const lowerCaseFilter = filterText.toLowerCase();
      return chemicalMasters.filter(master =>
        master.name.toLowerCase().includes(lowerCaseFilter) ||
        master.casNumber.toLowerCase().includes(lowerCaseFilter)
      );
    }, [chemicalMasters, filterText]);

    const filteredStorageLocations = useMemo(() => {
      if (!filterText) return storageLocations;
      const lowerCaseFilter = filterText.toLowerCase();
      return storageLocations.filter(loc =>
        loc.name.toLowerCase().includes(lowerCaseFilter) ||
        (loc.description || '').toLowerCase().includes(lowerCaseFilter)
      );
    }, [storageLocations, filterText]);

    const filteredInstruments = useMemo(() => {
      if (!filterText) return instruments;
      const lowerCaseFilter = filterText.toLowerCase();
      return instruments.filter(inst =>
        inst.name.toLowerCase().includes(lowerCaseFilter) ||
        (inst.model || '').toLowerCase().includes(lowerCaseFilter) ||
        (inst.serialNumber || '').toLowerCase().includes(lowerCaseFilter)
      );
    }, [instruments, filterText]);

    const handleAddNew = () => {
        if (activeTab === 'chemicals') onAddChemicalMaster();
        else if (activeTab === 'storage') onAddStorage();
        else if (activeTab === 'instruments') onAddInstrument();
    };

    const tabButtonClasses = (tabName: ActiveTab) => 
        `px-4 py-2 text-sm font-medium rounded-md ${
            activeTab === tabName 
            ? 'bg-teal-600 text-white shadow' 
            : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
        }`;

    const addButtonText: Record<ActiveTab, string> = {
        chemicals: 'Thêm Hóa chất',
        storage: 'Thêm Kho/Tủ',
        instruments: 'Thêm Máy'
    };

    const renderFilterCount = (filteredCount: number, totalCount: number, itemName: string) => {
        if (filterText) {
            return `Hiển thị ${filteredCount} trên tổng số ${totalCount} ${itemName}.`;
        }
        return `Tổng số: ${totalCount} ${itemName}.`;
    };
    
    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                  <h2 className="text-xl font-semibold text-slate-800">Quản lý Danh mục</h2>
                  <div className="flex gap-2">
                        {activeTab === 'chemicals' && (
                            <button 
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                            >
                                <ImportIcon className="w-5 h-5 mr-2" /> Nhập từ Excel
                            </button>
                        )}
                        <button 
                            onClick={handleAddNew} 
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> {addButtonText[activeTab]}
                        </button>
                  </div>
                </div>
                
                 <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-slate-200 pb-4">
                     <div className="flex flex-wrap gap-2">
                        <button className={tabButtonClasses('chemicals')} onClick={() => setActiveTab('chemicals')}>Danh mục Hóa chất</button>
                        <button className={tabButtonClasses('storage')} onClick={() => setActiveTab('storage')}>Danh mục Kho/Tủ</button>
                        <button className={tabButtonClasses('instruments')} onClick={() => setActiveTab('instruments')}>Danh mục Máy</button>
                    </div>
                    {/* Search Input */}
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="block w-full sm:w-64 rounded-md border border-slate-300 bg-white py-2 pl-10 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-500 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    {activeTab === 'chemicals' && (
                        <>
                            <p className="text-sm text-slate-500 mb-4">{renderFilterCount(filteredChemicalMasters.length, chemicalMasters.length, 'hóa chất')}</p>
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số CAS</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên hóa chất</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đơn vị</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nhà cung cấp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mức tối thiểu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredChemicalMasters.length > 0 ? filteredChemicalMasters.map(master => (
                                        <tr key={master.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{master.casNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{master.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{master.defaultUnit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{master.defaultSupplier}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{master.minimumLevel > 0 ? master.minimumLevel : 'Không đặt'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => onEditChemicalMaster(master)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                                                    <button onClick={() => onDeleteChemicalMaster(master.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center py-10 text-slate-500">{filterText ? 'Không tìm thấy hóa chất phù hợp.' : 'Chưa có hóa chất nào trong danh mục.'}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'storage' && (
                        <>
                            <p className="text-sm text-slate-500 mb-4">{renderFilterCount(filteredStorageLocations.length, storageLocations.length, 'kho/tủ')}</p>
                             <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Kho / Tủ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mô tả</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredStorageLocations.length > 0 ? filteredStorageLocations.map(storage => (
                                        <tr key={storage.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{storage.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{storage.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => onEditStorage(storage)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                                                    <button onClick={() => onDeleteStorage(storage.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="text-center py-10 text-slate-500">{filterText ? 'Không tìm thấy kho/tủ phù hợp.' : 'Chưa có Kho/Tủ nào trong danh mục.'}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {activeTab === 'instruments' && (
                        <>
                            <p className="text-sm text-slate-500 mb-4">{renderFilterCount(filteredInstruments.length, instruments.length, 'máy')}</p>
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Máy</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Model</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Số Serial</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vị trí</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredInstruments.length > 0 ? filteredInstruments.map(instrument => (
                                        <tr key={instrument.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{instrument.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{instrument.model}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{instrument.serialNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{instrument.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => onEditInstrument(instrument)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                                                    <button onClick={() => onDeleteInstrument(instrument.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                         <tr><td colSpan={5} className="text-center py-10 text-slate-500">{filterText ? 'Không tìm thấy máy phù hợp.' : 'Chưa có máy nào trong danh mục.'}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
            <CatalogImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={onImportChemicalMasters}
                onDownloadTemplate={onDownloadChemicalTemplate}
            />
        </>
    );
};

export default CatalogPage;
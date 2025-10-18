
import React, { useState, useMemo } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { ChemicalMaster } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ImportIcon } from './icons/ImportIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface StockInPageProps {
  chemicalMasters: ChemicalMaster[];
  onAddLot: (master: ChemicalMaster) => void;
  onImport: (file: File, mode: 'replace' | 'append') => void;
  onDownloadTemplate: () => void;
}

const StockInPage: React.FC<StockInPageProps> = ({ chemicalMasters, onAddLot, onImport, onDownloadTemplate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');

  const filteredMasters = useMemo(() => {
    if (!filterText) return chemicalMasters;
    const lower = filterText.toLowerCase();
    return chemicalMasters.filter(m => 
        m.name.toLowerCase().includes(lower) || 
        m.casNumber.toLowerCase().includes(lower)
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [chemicalMasters, filterText]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        setError('Vui lòng chọn một file Excel (.xlsx).');
        setSelectedFile(null);
      }
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Vui lòng chọn một file để nhập.');
      return;
    }
    onImport(selectedFile, importMode);
    setSelectedFile(null); // Reset after import
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-slate-800">Nhập kho Hóa chất</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Manual Add Card - Rewritten */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
           <div className="flex items-center mb-4">
            <PlusIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-bold text-slate-700">Nhập kho thủ công</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Chọn một hóa chất từ danh mục để nhập lô hàng mới. Nếu hóa chất chưa có trong danh mục, vui lòng thêm nó ở trang "Danh mục Hóa chất" trước.
          </p>
          <input
            type="text"
            placeholder="Tìm kiếm trong danh mục..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full p-2 mb-4 border border-slate-300 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="max-h-[45vh] overflow-y-auto pr-2 border-t border-slate-200">
            {filteredMasters.length > 0 ? filteredMasters.map(master => (
              <div key={master.id} className="flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">{master.name}</p>
                  <p className="text-sm text-slate-500">CAS: {master.casNumber}</p>
                </div>
                <button 
                  onClick={() => onAddLot(master)}
                  className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                  title="Nhập lô mới cho hóa chất này"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            )) : (
              <p className="text-center text-slate-500 py-8">
                {chemicalMasters.length === 0 ? "Chưa có hóa chất nào trong danh mục." : "Không tìm thấy hóa chất phù hợp."}
              </p>
            )}
          </div>
        </div>
        
        {/* Import from Excel Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <ImportIcon className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-slate-700">Nhập từ File Excel</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Nhập hàng loạt hóa chất một cách nhanh chóng bằng cách tải lên file Excel.
            Hãy chắc chắn rằng file của bạn tuân thủ đúng định dạng.
          </p>
          <button
            onClick={onDownloadTemplate}
            className="w-full mb-6 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Tải file mẫu
          </button>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-600 mb-2">
                Chọn File Excel (.xlsx)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                   <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-slate-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Tải lên một file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx" />
                    </label>
                    <p className="pl-1">hoặc kéo và thả</p>
                  </div>
                   {selectedFile ? 
                      <p className="text-xs text-slate-700 mt-2">File đã chọn: <span className="font-medium">{selectedFile.name}</span></p> :
                      <p className="text-xs text-slate-500">Chỉ chấp nhận file .xlsx</p>
                   }
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600">Phương thức Nhập</label>
              <fieldset className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input id="append" name="import-mode" type="radio" value="append" checked={importMode === 'append'} onChange={() => setImportMode('append')} className="h-4 w-4 text-blue-600 border-slate-300" />
                    <label htmlFor="append" className="ml-3 block text-sm font-medium text-slate-700">Thêm vào danh sách hiện tại</label>
                  </div>
                  <div className="flex items-center">
                    <input id="replace" name="import-mode" type="radio" value="replace" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} className="h-4 w-4 text-blue-600 border-slate-300" />
                    <label htmlFor="replace" className="ml-3 block text-sm font-medium text-slate-700">Thay thế toàn bộ danh sách</label>
                  </div>
                </div>
              </fieldset>
            </div>
            
            {error && <p className="text-sm text-red-600">{error}</p>}

            <button type="submit" className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-green-300" disabled={!selectedFile}>
              Bắt đầu Nhập
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default StockInPage;
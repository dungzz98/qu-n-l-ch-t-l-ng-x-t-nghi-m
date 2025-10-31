import React, { useState, useMemo } from 'react';
import { LabDocument } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';

interface DocumentsPageProps {
  documents: LabDocument[];
  onAdd: () => void;
  onEdit: (doc: LabDocument) => void;
  onDelete: (id: string) => void;
  onViewDocument: (doc: LabDocument) => void;
  focusedItemId: string | null;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const DocumentsPage: React.FC<DocumentsPageProps> = ({ documents, onAdd, onEdit, onDelete, onViewDocument, focusedItemId }) => {
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const categories = useMemo(() => {
      const cats = new Set(documents.map(d => d.category));
      return Array.from(cats).sort();
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const lowerCaseFilter = filterText.toLowerCase();
    return documents.filter(doc => {
        const matchesCategory = !categoryFilter || doc.category === categoryFilter;
        const matchesText = !lowerCaseFilter ||
            doc.title.toLowerCase().includes(lowerCaseFilter) ||
            doc.version.toLowerCase().includes(lowerCaseFilter);
        return matchesCategory && matchesText;
    });
  }, [documents, filterText, categoryFilter]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quản lý Tài liệu - Hồ sơ</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý các quy trình, hướng dẫn, biểu mẫu và các tài liệu khác.</p>
        </div>
        <button onClick={onAdd} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm Tài liệu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên tài liệu, phiên bản..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="block w-full rounded-md border border-slate-300 bg-white py-2 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="block w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:ring-2 focus:ring-inset focus:ring-blue-500">
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Tài liệu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Danh mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phiên bản</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày hiệu lực</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
              <tr key={doc.id} className={`hover:bg-slate-50 ${doc.id === focusedItemId ? 'animate-pulse-yellow' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{doc.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{doc.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{doc.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(doc.effectiveDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <button onClick={() => onViewDocument(doc)} className="text-gray-600 hover:text-gray-900" title="Xem chi tiết"><EyeIcon /></button>
                    <button onClick={() => onEdit(doc)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                    <button onClick={() => onDelete(doc.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500">
                  {documents.length === 0 ? "Chưa có tài liệu nào." : "Không tìm thấy tài liệu phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsPage;
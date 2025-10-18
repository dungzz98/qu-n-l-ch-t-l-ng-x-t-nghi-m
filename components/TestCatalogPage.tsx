import React, { useState, useMemo } from 'react';
import { TestParameter } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TestCatalogPageProps {
  testParameters: TestParameter[];
  onAdd: () => void;
  onEdit: (test: TestParameter) => void;
  onDelete: (id: string) => void;
}

const TestCatalogPage: React.FC<TestCatalogPageProps> = ({ testParameters, onAdd, onEdit, onDelete }) => {
  const [filterText, setFilterText] = useState('');

  const filteredTests = useMemo(() => {
    if (!filterText) return testParameters;
    const lowerCaseFilter = filterText.toLowerCase();
    return testParameters.filter(t =>
      t.name.toLowerCase().includes(lowerCaseFilter) ||
      (t.method || '').toLowerCase().includes(lowerCaseFilter)
    );
  }, [testParameters, filterText]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Danh mục Xét nghiệm</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý các thông số và thuộc tính của từng xét nghiệm.</p>
        </div>
        <button onClick={onAdd} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm Xét nghiệm
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc phương pháp..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="block w-full max-w-md rounded-md border border-slate-300 bg-white py-2 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tên Xét nghiệm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phương pháp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đơn vị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Khoảng tham chiếu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">TEa (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredTests.length > 0 ? filteredTests.map(test => (
              <tr key={test.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{test.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{test.method || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{test.unit}</td>
                <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-600">{test.referenceRange || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{test.tea}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-4">
                    <button onClick={() => onEdit(test)} className="text-blue-600 hover:text-blue-900" title="Chỉnh sửa"><EditIcon /></button>
                    <button onClick={() => onDelete(test.id)} className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500">
                  {testParameters.length === 0 ? "Chưa có xét nghiệm nào trong danh mục." : "Không tìm thấy xét nghiệm phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestCatalogPage;
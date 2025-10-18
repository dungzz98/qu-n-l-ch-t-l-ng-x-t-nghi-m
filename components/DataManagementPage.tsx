import React, { useRef } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { ImportIcon } from './icons/ImportIcon';

interface DataManagementPageProps {
  onBackup: () => void;
  onRestore: (file: File) => void;
}

const DataManagementPage: React.FC<DataManagementPageProps> = ({ onBackup, onRestore }) => {
    const restoreInputRef = useRef<HTMLInputElement>(null);

    const handleRestoreClick = () => {
        restoreInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (window.confirm("Phục hồi dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại. Bạn có chắc chắn muốn tiếp tục?")) {
                onRestore(file);
            }
        }
        // Reset the input value to allow re-uploading the same file
        if(e.target) {
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Quản lý Dữ liệu</h2>
            <p className="text-sm text-slate-500 mb-6">
                Sao lưu toàn bộ dữ liệu hệ thống ra tệp JSON hoặc phục hồi từ một tệp đã lưu trước đó. 
                Đây là một hành động quan trọng, hãy thực hiện cẩn thận.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <DownloadIcon className="w-6 h-6 text-blue-600"/>
                        Sao lưu Dữ liệu
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Tạo một bản sao lưu đầy đủ của tất cả dữ liệu hiện tại (hóa chất, người dùng, cài đặt, v.v.). 
                        File sẽ được tải về máy của bạn với định dạng `.json`.
                    </p>
                    <button
                        onClick={onBackup}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        Bắt đầu Sao lưu
                    </button>
                </div>
                 <div className="border p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <ImportIcon className="w-6 h-6 text-green-600"/>
                        Phục hồi Dữ liệu
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        <strong className="text-red-600">CẢNH BÁO:</strong> Thao tác này sẽ <strong className="font-bold">XÓA TẤT CẢ</strong> dữ liệu hiện tại và thay thế bằng dữ liệu từ tệp sao lưu. 
                        Chỉ thực hiện khi bạn chắc chắn.
                    </p>
                    <input type="file" ref={restoreInputRef} onChange={handleFileChange} className="hidden" accept="application/json" />
                    <button
                        onClick={handleRestoreClick}
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        Chọn tệp và Phục hồi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataManagementPage;

import React from 'react';
import { DisposalRecord } from '../types';

interface DisposalPrintViewProps {
  record: DisposalRecord;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '__/__/____';
  const date = new Date(dateString.split('T')[0] + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateVerbose = (dateString: string) => {
    if (!dateString) return 'Ngày __ tháng __ năm ____';
    const date = new Date(dateString.split('T')[0] + 'T00:00:00');
    return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
}

const DisposalPrintView: React.FC<DisposalPrintViewProps> = ({ record }) => {
  return (
    <div id="printable-disposal-area">
      <div className="p-4 font-serif text-black" style={{ fontSize: '12pt' }}>
        <header className="text-center mb-8">
          <div className="flex justify-center items-center">
             <div className="w-1/3 text-center">
                <p className="font-bold uppercase">BỆNH VIỆN</p>
                <p className="uppercase">KHOA</p>
             </div>
          </div>
          <h1 className="text-2xl font-bold uppercase mt-8">BIÊN BẢN HUỶ VẬT TƯ</h1>
        </header>
        
        <div className="mb-6 space-y-2">
            <p><strong>Ngày:</strong> {formatDate(record.date)}</p>
            <p><strong>Tên vật tư:</strong> {record.itemName}</p>
            <p><strong>Mã vật tư:</strong> ____________________</p>
            <p><strong>Nhà cung cấp:</strong> {record.supplier}</p>
            <p><strong>Số lô/lot:</strong> {record.lotNumber}</p>
            <p><strong>Hạn sử dụng:</strong> ____________________</p>
            <p><strong>Số lượng:</strong> {record.quantity}</p>
            <p><strong>Lý do hủy:</strong> {record.reason}</p>
            <p><strong>Nhà cung cấp có thay thế mặt hàng đó:</strong> {record.isReplaced === 'yes' ? 'Có' : 'Không'}</p>
            <p><strong>Phương pháp huỷ:</strong> {record.disposalMethod}</p>
        </div>

        <footer className="mt-20">
            <div className="flex justify-around text-center">
                <div>
                    <p>{formatDateVerbose(record.date)}</p>
                    <p className="font-bold">NGƯỜI DUYỆT</p>
                    <div className="mt-20 font-bold">{record.approver}</div>
                    <p className="mt-8"><strong>Ngày:</strong>____________________</p>
                </div>
                <div>
                    <p>{formatDateVerbose(record.date)}</p>
                    <p className="font-bold">NGƯỜI LẬP</p>
                    <div className="mt-20 font-bold">{record.executor}</div>
                     <p className="mt-8"><strong>Ngày:</strong>____________________</p>
                </div>
            </div>
            <div className="flex justify-between items-center text-xs mt-24 pt-2 border-t border-black">
                <span>BM 5.7.2/05</span>
                <span>Lần ban hành: 01.11/10/17</span>
                <span>Trang: 1/1</span>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default DisposalPrintView;

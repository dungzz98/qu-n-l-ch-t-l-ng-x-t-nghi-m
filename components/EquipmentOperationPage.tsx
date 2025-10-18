import React, { useState, useEffect } from 'react';
import { LabEquipment } from '../types';

interface EquipmentOperationPageProps {
  equipment: LabEquipment[];
  onUpdate: (equipmentId: string, procedureText: string) => void;
}

const EquipmentOperationPage: React.FC<EquipmentOperationPageProps> = ({ equipment, onUpdate }) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(equipment[0]?.id || null);
  const [procedureText, setProcedureText] = useState('');

  const selectedEquipment = equipment.find(e => e.id === selectedEquipmentId);

  useEffect(() => {
    if (selectedEquipment) {
      setProcedureText(selectedEquipment.operatingProcedure || '');
    } else {
      setProcedureText('');
    }
  }, [selectedEquipment]);
  
  const handleSave = () => {
      if(selectedEquipmentId) {
          onUpdate(selectedEquipmentId, procedureText);
          alert('Đã lưu quy trình vận hành!');
      }
  };
  
  const isModified = selectedEquipment ? procedureText !== (selectedEquipment.operatingProcedure || '') : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
      <div className="md:col-span-1 border rounded-lg p-2 flex flex-col">
        <h3 className="text-md font-semibold p-2 text-slate-700">Chọn thiết bị</h3>
        <div className="flex-grow overflow-y-auto">
            <ul className="divide-y divide-slate-100">
                {equipment.map(e => (
                    <li key={e.id}>
                        <button 
                            onClick={() => setSelectedEquipmentId(e.id)}
                            className={`w-full text-left p-3 rounded-md text-sm ${selectedEquipmentId === e.id ? 'bg-blue-100 font-bold text-blue-800' : 'hover:bg-slate-50'}`}
                        >
                            {e.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
      </div>
      <div className="md:col-span-2 flex flex-col">
          {selectedEquipment ? (
            <>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Quy trình Vận hành & Bảo trì cho: <span className="text-blue-700">{selectedEquipment.name}</span></h3>
                <p className="text-sm text-slate-500 mb-4">Soạn thảo các bước vận hành, hướng dẫn xử lý sự cố, hoặc lịch trình bảo trì nhanh tại đây.</p>
                <textarea
                    value={procedureText}
                    onChange={(e) => setProcedureText(e.target.value)}
                    placeholder="Nhập nội dung quy trình vận hành tại đây..."
                    className="w-full flex-grow p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500"
                />
                 <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={!isModified}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </>
          ) : (
              <div className="flex items-center justify-center h-full text-center text-slate-500 border rounded-lg bg-slate-50">
                  <p>Vui lòng chọn một thiết bị để xem hoặc sửa quy trình.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default EquipmentOperationPage;
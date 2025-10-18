import React, { useState, useEffect } from 'react';
import { LabEquipment, WorkItem } from '../types';

interface EquipmentTasksPageProps {
  equipment: LabEquipment[];
  workItems: WorkItem[];
  onUpdate: (equipmentId: string, workItemIds: string[]) => void;
}

const EquipmentTasksPage: React.FC<EquipmentTasksPageProps> = ({ equipment, workItems, onUpdate }) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(equipment[0]?.id || null);
  const [associatedIds, setAssociatedIds] = useState<Set<string>>(new Set());

  const selectedEquipment = equipment.find(e => e.id === selectedEquipmentId);

  useEffect(() => {
    if (selectedEquipment) {
      setAssociatedIds(new Set(selectedEquipment.associatedWorkItemIds || []));
    } else {
      setAssociatedIds(new Set());
    }
  }, [selectedEquipment]);
  
  const handleSave = () => {
      if(selectedEquipmentId) {
          onUpdate(selectedEquipmentId, Array.from(associatedIds));
          alert('Đã lưu quy trình công việc!');
      }
  };
  
  const handleToggleWorkItem = (itemId: string) => {
      setAssociatedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
              newSet.delete(itemId);
          } else {
              newSet.add(itemId);
          }
          return newSet;
      });
  };
  
  const isModified = selectedEquipment ? 
    JSON.stringify(Array.from(associatedIds).sort()) !== JSON.stringify([...(selectedEquipment.associatedWorkItemIds || [])].sort())
    : false;


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
      <div className="md:col-span-1 border rounded-lg p-2 flex flex-col">
        <h3 className="text-md font-semibold p-2 text-black">1. Chọn thiết bị</h3>
        <div className="flex-grow overflow-y-auto">
            <ul className="divide-y divide-gray-100">
                {equipment.map(e => (
                    <li key={e.id}>
                        <button 
                            onClick={() => setSelectedEquipmentId(e.id)}
                            className={`w-full text-left p-3 rounded-md text-sm ${selectedEquipmentId === e.id ? 'bg-gray-200 font-bold text-black' : 'hover:bg-gray-100 text-black'}`}
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
                <h3 className="text-lg font-semibold text-black mb-2">2. Gán công việc cho: <span className="text-blue-600">{selectedEquipment.name}</span></h3>
                <p className="text-sm text-gray-600 mb-4">Chọn các công việc từ danh mục chung sẽ được thực hiện trên thiết bị này.</p>
                <div className="flex-grow border rounded-lg p-4 overflow-y-auto space-y-3">
                    {workItems.map(item => (
                        <label key={item.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={associatedIds.has(item.id)}
                                onChange={() => handleToggleWorkItem(item.id)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-black">{item.description}</span>
                        </label>
                    ))}
                </div>
                 <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={!isModified}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </>
          ) : (
              <div className="flex items-center justify-center h-full text-center text-gray-500 border rounded-lg bg-gray-50">
                  <p>Vui lòng chọn một thiết bị để gán công việc.</p>
              </div>
          )}
      </div>
    </div>
  );
};

export default EquipmentTasksPage;
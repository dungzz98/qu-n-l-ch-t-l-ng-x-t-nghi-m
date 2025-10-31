import React, { useState, useMemo } from 'react';
import { TestParameter, ChemicalMaster, Instrument, RoomLocation, StorageLocation, ControlMaterial, EQAMaterial, DocumentCategory, User, WorkSchedule, Holiday } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ImportIcon } from './icons/ImportIcon';
import CatalogImportModal from './ChemicalMasterImportModal';


type ActiveTab = 'tests' | 'chemicals' | 'equipment' | 'locations' | 'storage' | 'iqc' | 'eqa' | 'documents' | 'users' | 'schedule';

type ModalType = 'testParameter' | 'chemicalMaster' | 'instrument' | 'roomLocation' | 'storage' | 'controlMaterial' | 'eqaMaterial' | 'documentCategory';

interface SettingsPageProps {
    testParameters: TestParameter[];
    chemicalMasters: ChemicalMaster[];
    instruments: Instrument[];
    roomLocations: RoomLocation[];
    storageLocations: StorageLocation[];
    controlMaterials: ControlMaterial[];
    eqaMaterials: EQAMaterial[];
    documentCategories: DocumentCategory[];
    onOpenModal: (type: ModalType, item?: any) => void;
    onDeleteItem: (type: ModalType, id: string) => void;
    // Props for chemical master import
    onImportChemicalMasters: (file: File, mode: 'replace' | 'append') => void;
    onDownloadChemicalTemplate: () => void;
    // Props for user and schedule management
    users: User[];
    currentUser: User;
    onOpenUserFormModal: (user: User | null) => void;
    onDeleteUser: (userId: string) => void;
    workSchedule: WorkSchedule;
    holidays: Holiday[];
    onUpdateWorkSchedule: (schedule: WorkSchedule) => void;
    onAddHoliday: (holiday: Omit<Holiday, 'id'>) => void;
    onDeleteHoliday: (id: string) => void;
}


const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const { 
        testParameters, chemicalMasters, instruments, roomLocations, storageLocations, controlMaterials, eqaMaterials, documentCategories,
        onOpenModal, onDeleteItem, onImportChemicalMasters, onDownloadChemicalTemplate,
        users, currentUser, onOpenUserFormModal, onDeleteUser,
        workSchedule, holidays, onUpdateWorkSchedule, onAddHoliday, onDeleteHoliday
    } = props;
    
    const [activeTab, setActiveTab] = useState<ActiveTab>('tests');
    const [filterText, setFilterText] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // State for schedule tab
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
    const [schedule, setSchedule] = useState<WorkSchedule>(workSchedule);
    
    const filteredData = useMemo(() => {
        const lower = filterText.toLowerCase();
        if (!filterText) return {
            tests: testParameters,
            chemicals: chemicalMasters,
            equipment: instruments,
            locations: roomLocations,
            storage: storageLocations,
            iqc: controlMaterials,
            eqa: eqaMaterials,
            documents: documentCategories,
            users: users,
        };
        return {
            tests: testParameters.filter(i => i.name.toLowerCase().includes(lower)),
            chemicals: chemicalMasters.filter(i => i.name.toLowerCase().includes(lower) || i.casNumber.toLowerCase().includes(lower)),
            equipment: instruments.filter(i => i.name.toLowerCase().includes(lower) || (i.model || '').toLowerCase().includes(lower) || (i.serialNumber || '').toLowerCase().includes(lower)),
            locations: roomLocations.filter(i => i.name.toLowerCase().includes(lower)),
            storage: storageLocations.filter(i => i.name.toLowerCase().includes(lower)),
            iqc: controlMaterials.filter(i => i.name.toLowerCase().includes(lower) || i.lotNumber.toLowerCase().includes(lower)),
            eqa: eqaMaterials.filter(i => i.name.toLowerCase().includes(lower) || i.lotNumber.toLowerCase().includes(lower)),
            documents: documentCategories.filter(i => i.name.toLowerCase().includes(lower)),
            users: users.filter(i => i.fullName.toLowerCase().includes(lower) || i.username.toLowerCase().includes(lower)),
        };
    }, [filterText, testParameters, chemicalMasters, instruments, roomLocations, storageLocations, controlMaterials, eqaMaterials, documentCategories, users]);


    const TabButton: React.FC<{ tab: ActiveTab, label: string }> = ({ tab, label }) => (
        <button
          onClick={() => { setActiveTab(tab); setFilterText(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-black border border-gray-300 hover:bg-gray-100'}`}
        >
          {label}
        </button>
      );

    const getAddButtonText = () => {
        switch (activeTab) {
            case 'tests': return 'Thêm Xét nghiệm';
            case 'chemicals': return 'Thêm Hóa chất';
            case 'equipment': return 'Thêm Máy XN';
            case 'locations': return 'Thêm Vị trí';
            case 'storage': return 'Thêm Kho/Tủ';
            case 'iqc': return 'Thêm Vật liệu IQC';
            case 'eqa': return 'Thêm Vật liệu EQA';
            case 'documents': return 'Thêm Danh mục';
            case 'users': return 'Thêm Người dùng';
            default: return 'Thêm mới';
        }
    };
    
    const getModalType = (): ModalType | 'user' => {
         switch (activeTab) {
            case 'tests': return 'testParameter';
            case 'chemicals': return 'chemicalMaster';
            case 'equipment': return 'instrument';
            case 'locations': return 'roomLocation';
            case 'storage': return 'storage';
            case 'iqc': return 'controlMaterial';
            case 'eqa': return 'eqaMaterial';
            case 'documents': return 'documentCategory';
            case 'users': return 'user';
        }
    }
    
    const handleAddClick = () => {
        const type = getModalType();
        if (type === 'user') {
            onOpenUserFormModal(null);
        } else {
            onOpenModal(type);
        }
    };
    
    const handleHolidaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newHoliday.date && newHoliday.name) {
            onAddHoliday(newHoliday);
            setNewHoliday({ date: '', name: '' });
        }
    };

    const handleScheduleUpdate = () => {
        onUpdateWorkSchedule(schedule);
        alert("Đã cập nhật giờ làm việc.");
    };

    const renderTable = () => {
        switch(activeTab) {
            case 'tests': return (
                <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">TEa (%)</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Đơn vị</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.tests.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.tea}</td><td className="px-4 py-3 text-gray-700">{i.unit}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('testParameter', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('testParameter', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
            case 'chemicals': return (
                 <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Số CAS</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Đơn vị</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.chemicals.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.casNumber}</td><td className="px-4 py-3 text-gray-700">{i.defaultUnit}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('chemicalMaster', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('chemicalMaster', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
            case 'equipment': return (
                 <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Model</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Serial</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Vị trí</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.equipment.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.model}</td><td className="px-4 py-3 text-gray-700">{i.serialNumber}</td><td className="px-4 py-3 text-gray-700">{i.location}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('instrument', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('instrument', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
            case 'locations': return (
                 <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên Vị trí/Phòng ban</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mô tả</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.locations.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.description}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('roomLocation', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('roomLocation', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
            case 'storage': return (
                 <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên Kho/Tủ</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mô tả</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.storage.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.description}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('storage', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('storage', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
            case 'iqc': return (
                 <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Mức</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Số lô</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">HSD</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.iqc.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.level}</td><td className="px-4 py-3 text-gray-700">{i.lotNumber}</td><td className="px-4 py-3 text-gray-700">{i.expirationDate}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('controlMaterial', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('controlMaterial', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
             case 'eqa': return (
                 <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Nhà cung cấp</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Số lô</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">HSD</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{filteredData.eqa.map(i => <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{i.name}</td><td className="px-4 py-3 text-gray-700">{i.provider}</td><td className="px-4 py-3 text-gray-700">{i.lotNumber}</td><td className="px-4 py-3 text-gray-700">{i.expirationDate}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('eqaMaterial', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('eqaMaterial', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                    </tr>)}</tbody></table>
            );
            case 'documents': return (
                <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên Danh mục</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
                   <tbody className="bg-white divide-y divide-gray-200">{filteredData.documents.map(i => <tr key={i.id} className="hover:bg-gray-50">
                       <td className="px-4 py-3 font-medium text-black">{i.name}</td>
                       <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>onOpenModal('documentCategory', i)} className="text-gray-700 hover:text-black"><EditIcon/></button><button onClick={()=>onDeleteItem('documentCategory', i.id)} className="text-gray-700 hover:text-black"><TrashIcon/></button></div></td>
                   </tr>)}</tbody></table>
           );
           case 'users': return (
            <table className="min-w-full"><thead className="bg-white"><tr className="border-b-2 border-black"><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Tên đăng nhập</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Họ và Tên</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Vai trò</th><th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Hành động</th></tr></thead>
               <tbody className="bg-white divide-y divide-gray-200">{filteredData.users.map(user => <tr key={user.id} className="hover:bg-gray-50">
                   <td className="px-4 py-3 font-medium text-black">{user.username}</td>
                   <td className="px-4 py-3 text-gray-700">{user.fullName}</td>
                   <td className="px-4 py-3 text-gray-700"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></td>
                   <td className="px-4 py-3"><div className="flex items-center gap-3"><button onClick={() => onOpenUserFormModal(user)} className="text-gray-700 hover:text-black"><EditIcon /></button><button onClick={() => onDeleteUser(user.id)} className="text-gray-700 hover:text-black"><TrashIcon /></button></div></td>
               </tr>)}</tbody></table>
            );
            case 'schedule': return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-900 p-6 rounded-lg text-gray-200">
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Cài đặt Giờ làm việc</h3>
                        <div className="space-y-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Giờ bắt đầu</label>
                                    <input type="time" value={schedule.startTime} onChange={e => setSchedule(s => ({...s, startTime: e.target.value}))} className="mt-1 block w-full border rounded-md p-2 bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">Giờ kết thúc</label>
                                    <input type="time" value={schedule.endTime} onChange={e => setSchedule(s => ({...s, endTime: e.target.value}))} className="mt-1 block w-full border rounded-md p-2 bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                </div>
                            </div>
                            <button onClick={handleScheduleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu giờ làm việc</button>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold mb-4 text-white">Quản lý Ngày nghỉ lễ</h3>
                        <form onSubmit={handleHolidaySubmit} className="flex gap-2 mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                            <input type="date" value={newHoliday.date} onChange={e => setNewHoliday(h => ({...h, date: e.target.value}))} required className="flex-grow border rounded-md p-2 bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"/>
                            <input type="text" placeholder="Tên ngày lễ" value={newHoliday.name} onChange={e => setNewHoliday(h => ({...h, name: e.target.value}))} required className="flex-grow border rounded-md p-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"/>
                            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><PlusIcon/></button>
                        </form>
                         <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-lg bg-gray-800">
                            <table className="min-w-full"><tbody className="divide-y divide-gray-700">
                                {holidays.map(h => <tr key={h.id}>
                                    <td className="px-4 py-2 text-gray-300">{new Date(h.date + 'T00:00:00').toLocaleDateString('vi-VN')}</td>
                                    <td className="px-4 py-2 font-medium text-white">{h.name}</td>
                                    <td className="px-4 py-2 text-right"><button onClick={() => onDeleteHoliday(h.id)} className="text-gray-400 hover:text-white"><TrashIcon className="w-4 h-4"/></button></td>
                                </tr>)}
                            </tbody></table>
                        </div>
                    </div>
                </div>
            )
        }
    }

    return (
        <>
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-black">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold">Cài đặt chung</h2>
                    <div className="flex items-center gap-2">
                        {activeTab === 'chemicals' && <button onClick={() => setIsImportModalOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-100"><ImportIcon/>Nhập Excel</button>}
                        {activeTab !== 'schedule' && <button onClick={handleAddClick} className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"><PlusIcon/>{getAddButtonText()}</button>}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-4">
                    <TabButton tab="tests" label="Xét nghiệm" />
                    <TabButton tab="chemicals" label="Hóa chất - Vật tư" />
                    <TabButton tab="equipment" label="Máy xét nghiệm" />
                    <TabButton tab="locations" label="Vị trí" />
                    <TabButton tab="storage" label="Kho-Tủ" />
                    <TabButton tab="iqc" label="Vật liệu Nội kiểm" />
                    <TabButton tab="eqa" label="Vật liệu Ngoại kiểm" />
                    <TabButton tab="documents" label="Danh mục Tài liệu" />
                    <TabButton tab="users" label="Người dùng" />
                    <TabButton tab="schedule" label="Lịch làm việc" />
                </div>
                {activeTab !== 'schedule' && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="block w-full max-w-sm rounded-md border border-gray-300 bg-white py-2 px-4 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-black"
                    />
                </div>
                )}
                <div className="overflow-x-auto">
                {renderTable()}
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

export default SettingsPage;
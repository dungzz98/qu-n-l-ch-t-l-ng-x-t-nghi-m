import React, { useState, useRef, useEffect } from 'react';
import { Chemical, ChemicalMaster, DisposalRecord, Instrument, OnInstrumentStock, PlanningSlip, StorageLocation, User } from '../types';
import DashboardPage from './DashboardPage';
import InventoryTable from './InventoryTable';
import StockInPage from './StockInPage';
import StockOutPage from './StockOutPage';
import OnInstrumentStockPage from './OnInstrumentStockPage';
import ReportsPage from './ReportsPage';
import PlanningPage from './PlanningPage';
import PhysicalCountPage from './PhysicalCountPage';
import DisposalPage from './DisposalPage';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

type SubPage = 'dashboard' | 'inventory' | 'stockIn' | 'stockOut' | 'onInstrument' | 'reports' | 'planning' | 'physicalCount' | 'disposal';

interface WarehouseManagementPageProps {
    chemicals: Chemical[];
    chemicalMasters: ChemicalMaster[];
    storageLocations: StorageLocation[];
    instruments: Instrument[];
    planningSlips: PlanningSlip[];
    disposalRecords: DisposalRecord[];
    onInstrumentStock: OnInstrumentStock[];
    currentUser: User | null;
    focusedItemId: string | null;
    
    onEditChemical: (chemical: Chemical) => void;
    onDeleteChemical: (id: string) => void;
    onGetSafetyInfo: (chemical: Chemical) => void;
    onOpenAdjustModal: (chemical: Chemical) => void;
    onOpenUsageLog: (chemical: Chemical) => void;
    onOpenBarcodeModal: (chemical: Chemical) => void;
    onOpenSafetyDoc: (chemical: Chemical) => void;
    onAddLot: (master: ChemicalMaster) => void;
    onRecordUsage: (chemical: Chemical) => void;
    onOpenMoveToInstrumentModal: (chemical: Chemical) => void;
    onInstrumentAdjust: (stock: OnInstrumentStock, action: 'use' | 'return' | 'discard') => void;
    onSavePlanningSlip: (items: any[]) => PlanningSlip;
    onViewPlanningSlip: (slip: PlanningSlip) => void;
    onUpdatePhysicalCount: (id: string, qty: number, person: string) => void;
    onAddDisposalRecord: (record: Omit<DisposalRecord, 'id'>) => void;
    onUpdateDisposalRecord: (record: DisposalRecord) => void;
    onDeleteDisposalRecord: (id: string) => void;
    onPrintDisposalRecord: (record: DisposalRecord) => void;
    onExportDisposalRecord: (record: DisposalRecord) => void;
}


const WarehouseManagementPage: React.FC<WarehouseManagementPageProps> = (props) => {
    const [activeSubPage, setActiveSubPage] = useState<SubPage>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const subPages: { id: SubPage; label: string }[] = [
        { id: 'dashboard', label: 'Bảng điều khiển' },
        { id: 'inventory', label: 'Tồn kho' },
        { id: 'stockIn', label: 'Nhập kho' },
        { id: 'stockOut', label: 'Xuất kho' },
        { id: 'onInstrument', label: 'Hóa chất trên máy' },
        { id: 'reports', label: 'Báo cáo' },
        { id: 'planning', label: 'Dự trù' },
        { id: 'physicalCount', label: 'Kiểm kê' },
        { id: 'disposal', label: 'Biên bản hủy' },
    ];
    
    const currentPageLabel = subPages.find(p => p.id === activeSubPage)?.label || 'Quản lý Kho';
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleSelectPage = (page: SubPage) => {
        setActiveSubPage(page);
        setIsMenuOpen(false);
    };


    const renderContent = () => {
        switch (activeSubPage) {
            case 'dashboard':
                return <DashboardPage 
                    chemicals={props.chemicals} 
                    onInstrumentStock={props.onInstrumentStock} 
                    monitoredAreas={[]} 
                    monitoredEquipment={[]} 
                    areaEnvLogs={[]} 
                    equipmentTempLogs={[]}
                    waterSources={[]}
                    waterConductivityLogs={[]}
                    onBackup={() => {}}
                    onRestore={() => {}}
                />;
            case 'inventory':
                return <InventoryTable chemicals={props.chemicals} onEdit={props.onEditChemical} onDelete={props.onDeleteChemical} onGetSafetyInfo={props.onGetSafetyInfo} onOpenAdjustModal={props.onOpenAdjustModal} onOpenUsageLog={props.onOpenUsageLog} onOpenBarcodeModal={props.onOpenBarcodeModal} onOpenSafetyDoc={props.onOpenSafetyDoc} focusedItemId={props.focusedItemId} />;
            case 'stockIn':
                return <StockInPage chemicalMasters={props.chemicalMasters} onAddLot={props.onAddLot} onImport={() => {}} onDownloadTemplate={() => {}} />;
            case 'stockOut':
                return <StockOutPage chemicals={props.chemicals} onRecordUsage={props.onRecordUsage} onOpenMoveToInstrumentModal={props.onOpenMoveToInstrumentModal} />;
            case 'onInstrument':
                return <OnInstrumentStockPage onInstrumentStock={props.onInstrumentStock} instruments={props.instruments} chemicals={props.chemicals} onAdjust={props.onInstrumentAdjust} />;
            case 'reports':
                return <ReportsPage chemicals={props.chemicals} storageLocations={props.storageLocations} instruments={props.instruments} />;
            case 'planning':
                return <PlanningPage chemicals={props.chemicals} chemicalMasters={props.chemicalMasters} planningSlips={props.planningSlips} onSaveSlip={props.onSavePlanningSlip} onViewSlip={props.onViewPlanningSlip} />;
            case 'physicalCount':
                return <PhysicalCountPage chemicals={props.chemicals} currentUser={props.currentUser} storageLocations={props.storageLocations} instruments={props.instruments} onUpdate={props.onUpdatePhysicalCount} />;
            case 'disposal':
                return <DisposalPage records={props.disposalRecords} currentUser={props.currentUser} onAdd={props.onAddDisposalRecord} onUpdate={props.onUpdateDisposalRecord} onDelete={props.onDeleteDisposalRecord} onPrint={props.onPrintDisposalRecord} onExport={props.onExportDisposalRecord} />;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="mb-6 flex items-baseline gap-4">
                 <h1 className="text-2xl font-bold text-slate-800">Quản lý Kho</h1>
                 <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 text-lg font-semibold text-slate-600 hover:text-slate-900 focus:outline-none"
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                    >
                        <span>/ {currentPageLabel}</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                {subPages.map(page => (
                                    <a
                                        key={page.id}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleSelectPage(page.id);
                                        }}
                                        className={`block px-4 py-2 text-sm ${activeSubPage === page.id ? 'font-semibold bg-slate-100 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                        role="menuitem"
                                    >
                                        {page.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default WarehouseManagementPage;
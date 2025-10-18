import React, { useState, useRef, useEffect } from 'react';
import { ManualPreparationLog, Chemical, ChemicalMaster, User, IQCResult, TestParameter, ControlMaterial, ControlLotTarget, NonConformity, PreventiveActionReport } from '../types';
import PreparationLogPage from './PreparationLogPage';
import IQCPage from './IQCPage';
import NonConformityPage from './NonConformityPage';
import PreventiveActionsPage from './PreventiveActionsPage';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

type SubPage = 'preparationLog' | 'iqc' | 'nonConformity' | 'preventiveActions';

interface QualityManagementPageProps {
    manualLogEntries: ManualPreparationLog[];
    chemicals: Chemical[];
    chemicalMasters: ChemicalMaster[];
    currentUser: User | null;
    onAddManualEntry: (logData: Omit<ManualPreparationLog, 'id'>) => void;
    
    testParameters: TestParameter[];
    controlMaterials: ControlMaterial[];
    controlLotTargets: ControlLotTarget[];
    iqcResults: IQCResult[];
    onAddIQCResult: () => void;
    
    nonConformities: NonConformity[];
    onAddOrUpdateNC: (item: NonConformity | null) => void;
    onDeleteNC: (id: string) => void;
    onExportToDoc: (items: NonConformity[]) => void;
    onExportToExcel: (items: NonConformity[]) => void;
    onExportCorrectiveActionToDoc: (item: NonConformity) => void;
    onExportCorrectiveActionLogToDoc: (items: NonConformity[]) => void;
    onExportCorrectiveActionLogToExcel: (items: NonConformity[]) => void;
    
    // FIX: Added missing properties to the interface to match what's being passed from App.tsx.
    preventiveActionReports: PreventiveActionReport[];
    onAddOrUpdatePreventiveAction: (item: PreventiveActionReport | null) => void;
    onDeletePreventiveAction: (id: string) => void;
    onExportPreventiveActionToDoc: (item: PreventiveActionReport) => void;
}

const QualityManagementPage: React.FC<QualityManagementPageProps> = (props) => {
    const [activeSubPage, setActiveSubPage] = useState<SubPage>('nonConformity');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const subPages: { id: SubPage; label: string }[] = [
        { id: 'iqc', label: 'Nội kiểm (IQC)' },
        { id: 'nonConformity', label: 'Sự không phù hợp' },
        { id: 'preventiveActions', label: 'Hành động Phòng ngừa' },
        { id: 'preparationLog', label: 'Sổ Pha chế' },
    ];
    
    const currentPageLabel = subPages.find(p => p.id === activeSubPage)?.label || 'Quản lý Chất lượng';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleSelectPage = (page: SubPage) => {
        setActiveSubPage(page);
        setIsMenuOpen(false);
    };

    const renderContent = () => {
        switch (activeSubPage) {
            case 'preparationLog':
                return <PreparationLogPage 
                    chemicals={props.chemicals}
                    manualLogEntries={props.manualLogEntries}
                    chemicalMasters={props.chemicalMasters}
                    currentUser={props.currentUser}
                    onAddManualEntry={props.onAddManualEntry}
                />;
            case 'iqc':
                return <IQCPage 
                    testParameters={props.testParameters}
                    controlMaterials={props.controlMaterials}
                    controlLotTargets={props.controlLotTargets}
                    iqcResults={props.iqcResults}
                    onAddResult={props.onAddIQCResult}
                />;
            case 'nonConformity':
                return <NonConformityPage
                    nonConformities={props.nonConformities}
                    onAddOrUpdate={props.onAddOrUpdateNC}
                    onDelete={props.onDeleteNC}
                    currentUser={props.currentUser}
                    onExportToDoc={props.onExportToDoc}
                    onExportToExcel={props.onExportToExcel}
                    onExportCorrectiveActionToDoc={props.onExportCorrectiveActionToDoc}
                    onExportCorrectiveActionLogToDoc={props.onExportCorrectiveActionLogToDoc}
                    onExportCorrectiveActionLogToExcel={props.onExportCorrectiveActionLogToExcel}
                />;
             case 'preventiveActions':
                return <PreventiveActionsPage
                    reports={props.preventiveActionReports}
                    onAddOrUpdate={props.onAddOrUpdatePreventiveAction}
                    onDelete={props.onDeletePreventiveAction}
                    onExportToDoc={props.onExportPreventiveActionToDoc}
                />;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="mb-6 flex items-baseline gap-4">
                 <h1 className="text-2xl font-bold text-slate-800">Quản lý Chất lượng</h1>
                 <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 text-lg font-semibold text-slate-600 hover:text-slate-900 focus:outline-none"
                    >
                        <span>/ {currentPageLabel}</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                {subPages.map(page => (
                                    <a
                                        key={page.id}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handleSelectPage(page.id); }}
                                        className={`block px-4 py-2 text-sm ${activeSubPage === page.id ? 'font-semibold bg-slate-100 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
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

export default QualityManagementPage;
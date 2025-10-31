import React, { useState, useRef, useEffect } from 'react';
import { NonConformity, PreventiveActionReport, User } from '../types';
// FIX: Changed to named import to resolve module resolution error.
import { NonConformityPage } from './NonConformityPage';
import { PreventiveActionsPage } from './PreventiveActionsPage';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

type SubPage = 'nonConformity' | 'preventiveActions';

interface NonConformityModulePageProps {
    nonConformities: NonConformity[];
    onAddOrUpdateNC: (item: NonConformity | null) => void;
    onDeleteNC: (id: string) => void;
    currentUser: User | null;
    onExportToDoc: (items: NonConformity[]) => void;
    onExportToExcel: (items: NonConformity[]) => void;
    onExportCorrectiveActionToDoc: (item: NonConformity) => void;
    onExportCorrectiveActionLogToDoc: (items: NonConformity[]) => void;
    onExportCorrectiveActionLogToExcel: (items: NonConformity[]) => void;
    
    preventiveActionReports: PreventiveActionReport[];
    onAddOrUpdatePreventiveAction: (item: PreventiveActionReport | null) => void;
    onDeletePreventiveAction: (id: string) => void;
    onExportPreventiveActionToDoc: (item: PreventiveActionReport) => void;
}

const NonConformityModulePage: React.FC<NonConformityModulePageProps> = (props) => {
    const [activeSubPage, setActiveSubPage] = useState<SubPage>('nonConformity');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const subPages: { id: SubPage; label: string }[] = [
        { id: 'nonConformity', label: 'Sự không phù hợp' },
        { id: 'preventiveActions', label: 'Hành động Phòng ngừa' },
    ];
    
    const currentPageLabel = subPages.find(p => p.id === activeSubPage)?.label || 'Sự không phù hợp';

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
            case 'nonConformity':
                return <NonConformityPage
                    nonConformities={props.nonConformities}
                    onAddOrUpdateNC={props.onAddOrUpdateNC}
                    onDeleteNC={props.onDeleteNC}
                    currentUser={props.currentUser}
                    onExportToDoc={props.onExportToDoc}
                    onExportToExcel={props.onExportToExcel}
                    onExportCorrectiveActionToDoc={props.onExportCorrectiveActionToDoc}
                    onExportCorrectiveActionLogToDoc={props.onExportCorrectiveActionLogToDoc}
                    onExportCorrectiveActionLogToExcel={props.onExportCorrectiveActionLogToExcel}
                    // FIX: Pass missing preventive action props to NonConformityPage.
                    preventiveActionReports={props.preventiveActionReports}
                    onAddOrUpdatePreventiveAction={props.onAddOrUpdatePreventiveAction}
                    onDeletePreventiveAction={props.onDeletePreventiveAction}
                    onExportPreventiveActionToDoc={props.onExportPreventiveActionToDoc}
                />;
            case 'preventiveActions':
                // FIX: Pass missing properties `nonConformities`, `focusedItemId`, and `onNavigate` to `PreventiveActionsPage`.
                return <PreventiveActionsPage
                    reports={props.preventiveActionReports}
                    onAddOrUpdate={props.onAddOrUpdatePreventiveAction}
                    onDelete={props.onDeletePreventiveAction}
                    onExportToDoc={props.onExportPreventiveActionToDoc}
                    nonConformities={props.nonConformities}
                    focusedItemId={focusedPaId}
                    onNavigate={handleNavigate}
                />;
            default:
                return null;
        }
    };
    
    // The below state and handlers are used by child components.
    const [focusedNcId, setFocusedNcId] = useState<string | null>(null);
    const [focusedPaId, setFocusedPaId] = useState<string | null>(null);

    useEffect(() => {
        if (focusedNcId || focusedPaId) {
            const timer = setTimeout(() => {
                setFocusedNcId(null);
                setFocusedPaId(null);
            }, 2500); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [focusedNcId, focusedPaId]);

    const handleNavigate = (tab: 'list' | 'corrective_actions' | 'preventive_actions', id: string) => {
        setActiveSubPage(tab as SubPage);
        if (tab === 'preventive_actions') {
          setFocusedPaId(id);
          setFocusedNcId(null);
        } else {
          setFocusedNcId(id);
          setFocusedPaId(null);
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-baseline gap-4">
                 <h1 className="text-2xl font-bold text-slate-800">Sự không phù hợp</h1>
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

export default NonConformityModulePage;
import React, { useState, useRef, useEffect } from 'react';
import { SearchResult } from '../types';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ToolIcon } from './icons/ToolIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { SearchIcon } from './icons/SearchIcon';

interface GlobalSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
    results: SearchResult[];
    onResultClick: (result: SearchResult) => void;
    isLoading: boolean;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ query, onQueryChange, results, onResultClick, isLoading }) => {
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // FIX: Typed the accumulator and initial value for the reduce function to ensure type safety.
    const groupedResults = results.reduce((acc: Record<string, SearchResult[]>, result) => {
        if (!acc[result.category]) {
            acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    const getIconForCategory = (category: string) => {
        switch (category) {
            case 'Kho': return <ArchiveBoxIcon className="w-5 h-5 text-slate-500" />;
            case 'Thiết bị': return <ToolIcon className="w-5 h-5 text-slate-500" />;
            case 'Nhân sự': return <AcademicCapIcon className="w-5 h-5 text-slate-500" />;
            case 'Tài liệu': return <BookOpenIcon className="w-5 h-5 text-slate-500" />;
            case 'Sự không phù hợp': return <ExclamationTriangleIcon className="w-5 h-5 text-slate-500" />;
            default: return null;
        }
    };

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm toàn hệ thống..."
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="block w-full rounded-md border-0 bg-slate-100 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                />
            </div>

            {isFocused && query && (
                <div className="absolute z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-slate-500">Đang tìm kiếm...</div>
                    ) : results.length > 0 ? (
                        <div>
                            {Object.entries(groupedResults).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</h3>
                                    <ul>
                                        {items.map(result => (
                                            <li
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => {
                                                    onResultClick(result);
                                                    setIsFocused(false);
                                                }}
                                                className="cursor-pointer px-4 py-3 hover:bg-slate-100 border-b border-slate-100 last:border-b-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1">{getIconForCategory(result.category)}</div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{result.title}</p>
                                                        <p className="text-xs text-slate-500">{result.details}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy kết quả nào.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
import React, { useState, useMemo } from 'react';
import { TestParameter, ControlMaterial, ControlLotTarget, IQCResult, WestgardViolation } from '../types';
import LeveyJenningsChart from './LeveyJenningsChart';
import { analyzeWestgard } from '../services/westgardService';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { BeakerIcon } from './icons/BeakerIcon';

interface IQCPageProps {
    testParameters: TestParameter[];
    controlMaterials: ControlMaterial[];
    controlLotTargets: ControlLotTarget[];
    iqcResults: IQCResult[];
    onAddResult: () => void;
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const IQCPage: React.FC<IQCPageProps> = ({ testParameters, controlMaterials, controlLotTargets, iqcResults, onAddResult }) => {
    const [selectedTestId, setSelectedTestId] = useState<string>(testParameters[0]?.id || '');
    const [selectedControlId, setSelectedControlId] = useState<string>(controlMaterials[0]?.id || '');

    const availableControlsForTest = useMemo(() => {
        const controlIds = controlLotTargets
            .filter(t => t.testParameterId === selectedTestId)
            .map(t => t.controlMaterialId);
        return controlMaterials.filter(cm => controlIds.includes(cm.id));
    }, [selectedTestId, controlLotTargets, controlMaterials]);

    // Effect to update selected control if it's not available for the new test
    React.useEffect(() => {
        if (!availableControlsForTest.some(c => c.id === selectedControlId)) {
            setSelectedControlId(availableControlsForTest[0]?.id || '');
        }
    }, [selectedTestId, availableControlsForTest, selectedControlId]);

    const currentTarget = useMemo(() => {
        return controlLotTargets.find(t => t.testParameterId === selectedTestId && t.controlMaterialId === selectedControlId);
    }, [selectedTestId, selectedControlId, controlLotTargets]);

    const filteredResults = useMemo(() => {
        return iqcResults
            .filter(r => r.testParameterId === selectedTestId && r.controlMaterialId === selectedControlId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30); // Show last 30 points
    }, [selectedTestId, selectedControlId, iqcResults]);
    
    const violations = useMemo<WestgardViolation[]>(() => {
        if (!currentTarget || !filteredResults.length) return [];
        return analyzeWestgard(filteredResults, currentTarget.mean, currentTarget.sd);
    }, [filteredResults, currentTarget]);
    
    const sixSigmaMetrics = useMemo(() => {
        if (!currentTarget || filteredResults.length < 20) return null;
        const selectedTest = testParameters.find(t => t.id === selectedTestId);
        if (!selectedTest) return null;
        
        const meanOfData = filteredResults.reduce((acc, r) => acc + r.value, 0) / filteredResults.length;
        const bias = Math.abs(meanOfData - currentTarget.mean);
        const biasPercent = (bias / currentTarget.mean) * 100;

        const sumOfSquares = filteredResults.reduce((acc, r) => acc + Math.pow(r.value - meanOfData, 2), 0);
        const sdOfData = Math.sqrt(sumOfSquares / (filteredResults.length - 1));
        const cvPercent = (sdOfData / meanOfData) * 100;
        
        const sigma = (selectedTest.tea - biasPercent) / cvPercent;

        return {
            bias: bias.toFixed(2),
            biasPercent: biasPercent.toFixed(2),
            cvPercent: cvPercent.toFixed(2),
            sigma: sigma.toFixed(2),
        };
    }, [currentTarget, filteredResults, testParameters, selectedTestId]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Phần mềm Nội kiểm (IQC)</h2>
                    <p className="text-sm text-slate-500 mt-1">Phân tích dữ liệu, biểu đồ Levey-Jennings và quy tắc Westgard.</p>
                </div>
                <button onClick={onAddResult} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Nhập kết quả QC
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-md border">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Chọn Xét nghiệm</label>
                    <select value={selectedTestId} onChange={e => setSelectedTestId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                        {testParameters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Chọn Mức Control</label>
                    <select value={selectedControlId} onChange={e => setSelectedControlId(e.target.value)} disabled={!selectedTestId} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                        {availableControlsForTest.map(c => <option key={c.id} value={c.id}>{c.level} ({c.lotNumber})</option>)}
                    </select>
                </div>
                {sixSigmaMetrics && (
                    <div className="bg-white p-2 border rounded-md text-sm">
                        <p className="font-semibold text-center text-slate-700">Hiệu suất</p>
                        <div className="flex justify-around items-center mt-1">
                             <div className="text-center">
                                <p className="text-xs text-slate-500">CV%</p>
                                <p className="font-bold text-slate-800">{sixSigmaMetrics.cvPercent}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Bias%</p>
                                <p className="font-bold text-slate-800">{sixSigmaMetrics.biasPercent}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Six Sigma</p>
                                <p className="font-bold text-lg text-blue-600">{sixSigmaMetrics.sigma}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {currentTarget ? (
                <div>
                    <div className="mb-6">
                        <LeveyJenningsChart data={filteredResults} mean={currentTarget.mean} sd={currentTarget.sd} violations={violations} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-md font-semibold text-slate-700 mb-2">Dữ liệu QC (30 điểm gần nhất)</h3>
                            <div className="overflow-auto border rounded-lg max-h-96">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Thời gian</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Kết quả</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Người nhập</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredResults.slice().reverse().map(r => {
                                            const isViolated = violations.some(v => v.resultId === r.id && v.rule !== '1-2s');
                                            return (
                                                <tr key={r.id} className={`${isViolated ? 'bg-red-50' : ''}`}>
                                                    <td className="px-4 py-2 text-sm text-slate-600">{formatDateTime(r.date)}</td>
                                                    <td className={`px-4 py-2 text-sm font-semibold ${isViolated ? 'text-red-700' : 'text-slate-800'}`}>{r.value.toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-sm text-slate-600">{r.recordedBy}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                         <div>
                            <h3 className="text-md font-semibold text-slate-700 mb-2">Cảnh báo Westgard</h3>
                            <div className="overflow-auto border rounded-lg max-h-96 p-4 space-y-2">
                               {violations.length > 0 ? violations.map((v, i) => (
                                   <div key={i} className={`p-2 rounded-md text-sm ${v.rule === '1-2s' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                       <span className="font-bold">{v.rule.toUpperCase()}:</span> {v.message}
                                   </div>
                               )) : (
                                   <div className="text-center text-slate-500 pt-10">
                                       <BeakerIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                       <p>Không có vi phạm nào được phát hiện.</p>
                                   </div>
                               )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 text-slate-500">
                    <p>Vui lòng chọn một xét nghiệm và mức control để xem dữ liệu.</p>
                    <p>Nếu không có lựa chọn nào, hãy cấu hình trong phần Cài đặt.</p>
                </div>
            )}
        </div>
    );
};

export default IQCPage;

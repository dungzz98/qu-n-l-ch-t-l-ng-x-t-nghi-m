import React from 'react';
import { IQCResult, WestgardViolation } from '../types';

interface LeveyJenningsChartProps {
    data: IQCResult[];
    mean: number;
    sd: number;
    violations: WestgardViolation[];
}

const LeveyJenningsChart: React.FC<LeveyJenningsChartProps> = ({ data, mean, sd, violations }) => {
    const width = 800;
    const height = 400;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };

    if (data.length === 0) {
        return (
            <div style={{ width, height }} className="flex items-center justify-center bg-slate-50 border rounded-lg">
                <p className="text-slate-500">Chưa có dữ liệu để hiển thị biểu đồ.</p>
            </div>
        );
    }
    
    // Calculate y-axis range based on 3SD
    const yMax = mean + 4 * sd;
    const yMin = mean - 4 * sd;

    const yToPx = (y: number) => {
        return padding.top + ((yMax - y) / (yMax - yMin)) * (height - padding.top - padding.bottom);
    };

    const xToPx = (index: number) => {
        return padding.left + (index / (data.length - 1 || 1)) * (width - padding.left - padding.right);
    };

    const sdLines = [-3, -2, -1, 1, 2, 3].map(multiple => ({
        y: yToPx(mean + multiple * sd),
        label: `${multiple > 0 ? '+' : ''}${multiple}SD`,
        color: Math.abs(multiple) === 3 ? '#ef4444' : (Math.abs(multiple) === 2 ? '#f59e0b' : '#a3a3a3'),
        dashed: Math.abs(multiple) !== 3
    }));

    const violationIds = new Set(violations.filter(v => v.rule !== '1-2s').map(v => v.resultId));

    return (
        <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
            {/* Y-axis labels */}
            {[...sdLines, {y: yToPx(mean), label: 'Mean', color: '#3b82f6', dashed: false}].map(line => (
                <text key={line.label} x={padding.left - 8} y={line.y + 4} textAnchor="end" fontSize="10" fill={line.color} fontWeight="bold">
                    {line.label}
                </text>
            ))}
            <text x={padding.left - 8} y={yToPx(mean) + 4} textAnchor="end" fontSize="10" fill="#3b82f6" fontWeight="bold">Mean</text>

            {/* Grid lines */}
            {sdLines.map(line => (
                <line key={line.label} x1={padding.left} y1={line.y} x2={width - padding.right} y2={line.y} stroke={line.color} strokeWidth="1" strokeDasharray={line.dashed ? "4 2" : "none"} opacity="0.7" />
            ))}
            <line x1={padding.left} y1={yToPx(mean)} x2={width - padding.right} y2={yToPx(mean)} stroke="#3b82f6" strokeWidth="1.5" />
            
            {/* Axis lines */}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#9ca3af" strokeWidth="1" />
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#9ca3af" strokeWidth="1" />
            
            {/* Data line */}
            <path
                d={data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xToPx(i)},${yToPx(d.value)}`).join(' ')}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
            />

            {/* Data points */}
            {data.map((d, i) => {
                const isViolated = violationIds.has(d.id);
                const isWarning = !isViolated && violations.some(v => v.resultId === d.id && v.rule === '1-2s');
                const pointColor = isViolated ? '#dc2626' : (isWarning ? '#f59e0b' : '#1d4ed8');

                return (
                    <circle key={d.id} cx={xToPx(i)} cy={yToPx(d.value)} r={isViolated ? 5 : 4} fill={pointColor} stroke="#fff" strokeWidth="1">
                        <title>{`Ngày: ${new Date(d.date).toLocaleDateString('vi-VN')}\nGiá trị: ${d.value}`}</title>
                    </circle>
                );
            })}
             {/* X-axis labels (first and last point) */}
            {data.length > 0 && (
                <>
                    <text x={xToPx(0)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#334155">
                        {new Date(data[0].date).toLocaleDateString('vi-VN')}
                    </text>
                    {data.length > 1 && (
                         <text x={xToPx(data.length - 1)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#334155">
                            {new Date(data[data.length - 1].date).toLocaleDateString('vi-VN')}
                        </text>
                    )}
                </>
            )}
        </svg>
    );
};

export default LeveyJenningsChart;

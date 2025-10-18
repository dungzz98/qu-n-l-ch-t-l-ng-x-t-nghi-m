// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { IQCResult, WestgardViolation } from '../types';

export function analyzeWestgard(results: IQCResult[], mean: number, sd: number): WestgardViolation[] {
    if (results.length === 0 || sd === 0) {
        return [];
    }
    
    // Sort results by date ascending
    const sortedResults = [...results].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const violations: WestgardViolation[] = [];

    for (let i = 0; i < sortedResults.length; i++) {
        const current = sortedResults[i];
        const currentValue = current.value;
        const z_score = (currentValue - mean) / sd;

        // --- Warning Rule ---
        // 1-2s: One point is outside +/- 2s
        if (Math.abs(z_score) > 2) {
             violations.push({
                resultId: current.id,
                rule: '1-2s',
                message: `Cảnh báo 1-2s: Điểm ${currentValue.toFixed(2)} nằm ngoài giới hạn 2SD.`,
            });
        }

        // --- Rejection Rules ---
        // 1-3s: One point is outside +/- 3s
        if (Math.abs(z_score) > 3) {
            violations.push({
                resultId: current.id,
                rule: '1-3s',
                message: `Vi phạm 1-3s: Điểm ${currentValue.toFixed(2)} nằm ngoài giới hạn 3SD.`,
            });
        }
        
        // 2-2s: Two consecutive points are outside +/- 2s on the same side
        if (i > 0) {
            const prev = sortedResults[i-1];
            const prev_z_score = (prev.value - mean) / sd;
            if ( (z_score > 2 && prev_z_score > 2) || (z_score < -2 && prev_z_score < -2) ) {
                 violations.push({
                    resultId: current.id,
                    rule: '2-2s',
                    message: `Vi phạm 2-2s: 2 điểm liên tiếp ngoài 2SD cùng phía.`,
                });
            }
        }
        
        // R-4s: Range between two consecutive points exceeds 4s
        if (i > 0) {
            const prev = sortedResults[i-1];
            const prevValue = prev.value;
            if (Math.abs(currentValue - prevValue) > 4 * sd) {
                 violations.push({
                    resultId: current.id,
                    rule: 'R-4s',
                    message: `Vi phạm R-4s: Khoảng cách giữa 2 điểm liên tiếp > 4SD.`,
                });
            }
        }

        // 4-1s: Four consecutive points are outside +/- 1s on the same side
        if (i >= 3) {
            const last4 = sortedResults.slice(i-3, i+1).map(r => (r.value - mean) / sd);
            if (last4.every(z => z > 1) || last4.every(z => z < -1)) {
                 violations.push({
                    resultId: current.id,
                    rule: '4-1s',
                    message: `Vi phạm 4-1s: 4 điểm liên tiếp ngoài 1SD cùng phía.`,
                });
            }
        }

        // 10-x: Ten consecutive points are on the same side of the mean
        if (i >= 9) {
            const last10 = sortedResults.slice(i-9, i+1).map(r => r.value);
            if (last10.every(v => v > mean) || last10.every(v => v < mean)) {
                 violations.push({
                    resultId: current.id,
                    rule: '10-x',
                    message: `Vi phạm 10-x: 10 điểm liên tiếp nằm cùng một phía so với giá trị trung bình.`,
                });
            }
        }
    }
    
    // Deduplicate violations for the same result point
    const uniqueViolations = Array.from(new Map(violations.map(v => [v.resultId + v.rule, v])).values());
    
    return uniqueViolations;
}
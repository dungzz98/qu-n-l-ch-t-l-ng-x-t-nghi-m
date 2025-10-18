import React, { useEffect, useState } from 'react';
// FIX: The imported file './types' was not a module. With the new types.ts, this now works.
import { Chemical } from '../types';

// The JsBarcode library is loaded from a script tag in index.html
declare var JsBarcode: any;

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chemical: Chemical | null;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const BarcodeModal: React.FC<BarcodeModalProps> = ({ isOpen, onClose, chemical }) => {
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    if (isOpen && chemical && chemical.barcode) {
      // Use setTimeout to ensure elements are in the DOM before JsBarcode runs
      setTimeout(() => {
        try {
          // Barcode for the preview in the modal
          JsBarcode("#barcode-svg-preview", chemical.barcode, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 60,
            displayValue: true,
            fontOptions: "bold",
            fontSize: 16,
            textMargin: 5
          });

          // Barcodes for the printable area
          JsBarcode(".barcode-svg-print", chemical.barcode, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.5,
            height: 35,
            displayValue: true,
            fontOptions: "bold",
            fontSize: 14,
            textMargin: 2
          });
        } catch (e) {
          console.error("Could not generate barcode:", e);
        }
      }, 0);
    }
  }, [isOpen, chemical, copies]);

  if (!isOpen || !chemical) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* This is the hidden area that will be printed */}
      {/* It's positioned off-screen but will be moved to 0,0 for printing via CSS */}
      <div id="printable-barcode-area" style={{ position: 'absolute', left: '-9999px' }}>
        {Array.from({ length: copies }).map((_, index) => (
          <div key={index} className="label-container p-2 flex flex-col justify-between items-center text-black" style={{ boxSizing: 'border-box', width: '100mm', height: '50mm', fontFamily: 'Arial, sans-serif' }}>
            <div className="text-center w-full">
              <h3 className="font-bold leading-tight truncate" style={{ fontSize: '14pt' }}>{chemical.name}</h3>
            </div>
            <div className="flex justify-center w-full my-1">
                <svg className="barcode-svg-print"></svg>
            </div>
            <div className="text-center w-full flex justify-between font-semibold" style={{ fontSize: '10pt' }}>
              <span>Số lô: {chemical.lotNumber}</span>
              <span>HSD: {formatDate(chemical.expirationDate)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* This is the visible modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-xl p-6 m-4 w-full max-w-sm flex flex-col">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-semibold text-slate-700">In Mã Barcode</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl leading-none">&times;</button>
          </div>
          
          <div className="my-6 text-center">
              <h3 className="text-lg font-bold text-slate-800">{chemical.name}</h3>
              <p className="text-sm text-slate-600">Số lô: {chemical.lotNumber}</p>
              <p className="text-sm text-slate-600 mb-2">HSD: {formatDate(chemical.expirationDate)}</p>
              <div className="flex justify-center">
                  <svg id="barcode-svg-preview"></svg>
              </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="copies-input" className="text-sm font-medium text-slate-600">Số lượng tem:</label>
            <input 
              id="copies-input"
              type="number"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="block w-24 border border-slate-300 rounded-md shadow-sm p-2 bg-white text-slate-900 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Số lượng tem cần in"
            />
          </div>

          <div className="mt-auto flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
              Đóng
            </button>
            <button type="button" onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              In {copies} tem
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarcodeModal;
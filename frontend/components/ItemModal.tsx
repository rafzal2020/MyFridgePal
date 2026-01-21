"use client"
import { useState, useRef, useEffect } from 'react';
import { Item } from '../app/types';

interface ItemModalProps {
    fridgeId?: number; // Required for Add mode
    item?: Item;       // Required for Edit mode
    onClose: () => void;
    onSave: () => void; // Trigger refresh
}

export default function ItemModal({ fridgeId, item, onClose, onSave }: ItemModalProps) {
    const isEdit = !!item;

    // Form State
    const [name, setName] = useState(item?.name || "");
    const [quantity, setQuantity] = useState(item?.quantity || 1);
    const [unit, setUnit] = useState(item?.unit || "");
    const [expirationDate, setExpirationDate] = useState(item?.expiration_date || "");
    const [notes, setNotes] = useState(item?.notes || "");

    // UI State
    const [loading, setLoading] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [scannedNutrition, setScannedNutrition] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // OCR Handler
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setScanLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/scan-nutrition", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setScannedNutrition(data);
                alert("Label scanned successfully! Nutritional data extracted.");
            } else {
                alert("Failed to scan label.");
            }
        } catch (error) {
            console.error("Scan error:", error);
            alert("Error scanning label.");
        } finally {
            setScanLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const body: any = {
            name,
            quantity: Number(quantity),
            unit: unit || null,
            expiration_date: expirationDate || null,
            notes: notes || null
        };

        // If OCR data was scanned, send it. 
        // Otherwise, backend handles AI generation based on Name + Notes.
        if (scannedNutrition) {
            body.nutritional_info = scannedNutrition;
        }

        try {
            let url, method;

            if (isEdit && item) {
                url = `http://localhost:8000/items/${item.id}`;
                method = 'PUT';
            } else {
                if (!fridgeId) throw new Error("Fridge ID missing for Add mode");
                url = `http://localhost:8000/fridges/${fridgeId}/items/`;
                method = 'POST';
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                onSave();
                onClose();
            } else {
                alert("Failed to save item");
            }
        } catch (error) {
            console.error("Error saving item:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
                    {isEdit ? "Edit Item" : "Add New Item"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                            placeholder="e.g. Greek Yogurt"
                            required
                            autoFocus={!isEdit}
                        />
                    </div>

                    {/* Quantity & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quantity</label>
                            <input
                                type="number"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit</label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                                placeholder="pcs, kg..."
                            />
                        </div>
                    </div>

                    {/* Expiration */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Expiration Date</label>
                        <input
                            type="date"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Notes / Context
                            <span className="text-xs text-zinc-500 ml-2 font-normal">(AI uses this for nutrition)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 h-24 resize-none"
                            placeholder="e.g. Low fat, 8oz bottle..."
                        />
                    </div>

                    {/* OCR Scan */}
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Nutrition Data
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={scanLoading}
                                className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {scanLoading ? (
                                    <span>Scanning...</span>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                        Scan Label
                                    </>
                                )}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        {scannedNutrition ? (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                                ✓ Scanned data ready (Cal: {scannedNutrition.calories})
                            </p>
                        ) : (
                            <p className="text-xs text-zinc-400 mt-2 italic">
                                If no scan, generic AI data will be fetched based on Name & Notes.
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || scanLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : (isEdit ? "Save Changes" : "Add Item")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

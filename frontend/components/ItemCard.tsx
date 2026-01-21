import { Item } from '../app/types';

interface ItemCardProps {
    item: Item;
    onDelete: (id: number) => void;
    onEdit?: (item: Item) => void;
}

export default function ItemCard({ item, onDelete, onEdit }: ItemCardProps) {
    const getExpirationStatus = () => {
        if (!item.expiration_date) return { color: "text-zinc-500", label: null, border: "border-zinc-200 dark:border-zinc-700" };

        const today = new Date();
        // Reset time to compare dates only
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(item.expiration_date);
        expDate.setHours(0, 0, 0, 0);

        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                color: "text-red-600 font-bold",
                label: `Expired ${Math.abs(diffDays)} day(s) ago`,
                border: "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
            };
        } else if (diffDays <= 3) {
            return {
                color: "text-amber-600 font-bold",
                label: `Expires in ${diffDays} day(s)`,
                border: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
            };
        }
        return {
            color: "text-zinc-500 dark:text-zinc-400",
            label: `Exp: ${item.expiration_date}`,
            border: "border-zinc-200 dark:border-zinc-700"
        };
    };

    const status = getExpirationStatus();

    return (
        <div className={`rounded-xl p-4 shadow-sm border group ${status.border} relative`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</h4>
                    <div className="text-sm mt-1 space-x-2">
                        <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                            Qty: {item.quantity} {item.unit}
                        </span>
                        {item.expiration_date && (
                            <span className={status.color}>
                                {status.label}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Edit Item"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {item.notes && (
                <div className="mb-3 bg-zinc-50 dark:bg-zinc-900 px-2 py-1.5 rounded text-xs text-zinc-600 dark:text-zinc-400 italic border border-zinc-100 dark:border-zinc-800">
                    "{item.notes}"
                </div>
            )}

            {item.nutritional_info && (
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-700 pt-2 flex gap-3">
                    {item.nutritional_info.calories && <span>{item.nutritional_info.calories} kcal</span>}
                    {item.nutritional_info.protein && <span>{item.nutritional_info.protein}g P</span>}
                    {item.nutritional_info.carbs && <span>{item.nutritional_info.carbs}g C</span>}
                    {item.nutritional_info.sugar && <span>{item.nutritional_info.sugar}g S</span>}
                    {item.nutritional_info.fat && <span>{item.nutritional_info.fat}g F</span>}
                </div>
            )}
        </div>
    );
}

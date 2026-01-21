import Link from 'next/link';
import { Fridge } from '../app/types';

interface FridgeCardProps {
    fridge: Fridge;
}

export default function FridgeCard({ fridge }: FridgeCardProps) {
    return (
        <Link href={`/fridges/${fridge.id}`} className="block">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{fridge.name}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    {fridge.items.length} Items
                </p>
            </div>
        </Link>
    );
}

"use client"
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ItemCard from '@/components/ItemCard';
import ItemModal from '@/components/ItemModal';
import NutritionChart from '@/components/NutritionChart';
import { Fridge, Item } from '../../types';

export default function FridgeDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [fridge, setFridge] = useState<Fridge | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    // Unified Modal State: null = closed, 'ADD' = adding, Item object = editing
    const [modalState, setModalState] = useState<'ADD' | Item | null>(null);

    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            const fridgeRes = await fetch(`http://localhost:8000/fridges/${id}`);
            if (!fridgeRes.ok) {
                router.push('/');
                return;
            }
            setFridge(await fridgeRes.json());

            const itemsRes = await fetch(`http://localhost:8000/fridges/${id}/items/`);
            if (itemsRes.ok) {
                setItems(await itemsRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDeleteItem = async (itemId: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch(`http://localhost:8000/items/${itemId}`, { method: 'DELETE' });
            if (res.ok) {
                setItems(items.filter(item => item.id !== itemId));
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading...</div>;
    if (!fridge) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="mb-8 max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        ← Back
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{fridge.name}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">{items.length} Items</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={async () => {
                            if (!confirm("Are you sure you want to delete this fridge? All items in it will be lost.")) return;
                            try {
                                const res = await fetch(`http://localhost:8000/fridges/${id}`, { method: 'DELETE' });
                                if (res.ok) router.push('/');
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        className="text-red-500 hover:text-red-700 font-medium px-4"
                    >
                        Delete Fridge
                    </button>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 md:w-64 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                    <button
                        onClick={() => setModalState('ADD')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition-colors whitespace-nowrap"
                    >
                        + Add Item
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto space-y-8">
                {items.length > 0 && (
                    <div className="relative group">
                        <NutritionChart items={items} title={`Nutrition in ${fridge.name}`} />
                        <div className="absolute top-4 right-4">
                            <Link
                                href={`/fridges/${id}/nutrition`}
                                className="bg-white/90 dark:bg-zinc-800/90 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-blue-50 transition-colors border border-zinc-200 dark:border-zinc-700"
                            >
                                View Health Report &rarr;
                            </Link>
                        </div>
                    </div>
                )}

                {filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                        <p className="text-xl text-zinc-500">
                            {searchQuery ? "No items match your search." : "This fridge is empty."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setModalState('ADD')}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Add your first item
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onDelete={handleDeleteItem}
                                onEdit={(i) => setModalState(i)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {modalState && (
                <ItemModal
                    fridgeId={parseInt(id)}
                    item={typeof modalState === 'object' ? modalState as Item : undefined}
                    onClose={() => setModalState(null)}
                    onSave={fetchData}
                />
            )}
        </div>
    );
}

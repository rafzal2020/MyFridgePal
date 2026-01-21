"use client"
import { useState, useEffect } from 'react';
import FridgeCard from '../components/FridgeCard';
import ItemCard from '@/components/ItemCard';
import NutritionChart from '@/components/NutritionChart';
import { Fridge, Item } from './types';

export default function Home() {
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [expiringItems, setExpiringItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFridgeName, setNewFridgeName] = useState("");

  const fetchData = async () => {
    try {
      const fridgesRes = await fetch('http://localhost:8000/fridges/');
      const fridgesData = fridgesRes.ok ? await fridgesRes.json() : [];
      setFridges(fridgesData);

      const expiringRes = await fetch('http://localhost:8000/items/expiring');
      if (expiringRes.ok) setExpiringItems(await expiringRes.json());

      // Fetch all items for global stats
      // Since we don't have a dedicated global items endpoint, we can aggregate from fridges
      // OR better, create a quick helper or just fetch for each fridge
      const allItemsPromises = fridgesData.map((f: Fridge) =>
        fetch(`http://localhost:8000/fridges/${f.id}/items/`).then(r => r.json())
      );
      const itemsArrays = await Promise.all(allItemsPromises);
      const flatItems = itemsArrays.flat();
      setAllItems(flatItems);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFridge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFridgeName.trim()) return;

    try {
      const res = await fetch('http://localhost:8000/fridges/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFridgeName }),
      });

      if (res.ok) {
        setShowModal(false);
        setNewFridgeName("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create fridge:", error);
    }
  };

  const handleDismissItem = async (itemId: number) => {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:8000/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
            MyFridgePal
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Smart inventory for your kitchen
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="/recipes"
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-6 py-3 rounded-full font-semibold shadow-sm hover:shadow-md transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <span className="text-xl">👨‍🍳</span> Find Recipes
          </a>
          <a
            href="/goals"
            className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 px-6 py-3 rounded-full font-semibold shadow-sm hover:shadow-md transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <span className="text-xl">🎯</span> Goal Coach
          </a>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition-colors"
          >
            + Add Fridge
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-12">

        {/* Stats Section */}
        {/* Stats Section */}
        {allItems.length > 0 && (
          <section className="mb-8">
            <NutritionChart items={allItems} title="Global Nutrition Snapshot" />
          </section>
        )}

        {/* Alerts Section */}
        {expiringItems.length > 0 && (
          <section className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-100 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Attention Needed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiringItems.map(item => (
                <div key={item.id} className="relative">
                  <ItemCard item={item} onDelete={handleDismissItem} />
                  {/* Note: Delete logic is not fully wired here for simplicity, reusing card for display */}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Your Fridges</h2>
          {loading ? (
            <div className="text-zinc-500">Loading fridges...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fridges.map((fridge) => (
                <FridgeCard key={fridge.id} fridge={fridge} />
              ))}
              {fridges.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                  <p className="text-xl text-zinc-500">No fridges found. Create one to get started!</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Add New Fridge</h2>
            <form onSubmit={handleCreateFridge}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Fridge Name
                </label>
                <input
                  type="text"
                  value={newFridgeName}
                  onChange={(e) => setNewFridgeName(e.target.value)}
                  placeholder="e.g. Kitchen Pantry"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

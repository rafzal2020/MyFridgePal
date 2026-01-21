"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterCanMake, setFilterCanMake] = useState(false);
    const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'finder' | 'saved'>('finder');

    useEffect(() => {
        fetchSavedRecipes();
    }, []);

    const fetchSavedRecipes = async () => {
        try {
            const res = await fetch('http://localhost:8000/recipes/');
            if (res.ok) {
                const data = await res.json();
                setSavedRecipes(data);
            }
        } catch (error) {
            console.error("Failed to fetch saved recipes:", error);
        }
    };

    const fetchRecipes = async () => {
        setLoading(true);
        setViewMode('finder');
        try {
            const res = await fetch('http://localhost:8000/recipes/generate', {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setRecipes(data);
            }
        } catch (error) {
            console.error("Failed to fetch recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (recipe: any) => {
        try {
            const res = await fetch('http://localhost:8000/recipes/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipe)
            });
            if (res.ok) {
                fetchSavedRecipes();
                alert("Recipe saved!");
            }
        } catch (error) {
            console.error("Failed to save:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this saved recipe?")) return;
        try {
            const res = await fetch(`http://localhost:8000/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) fetchSavedRecipes();
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    // Filter logic for finder
    const displayedRecipes = filterCanMake
        ? recipes.filter(r => r.missing_ingredients.length === 0)
        : recipes;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="mb-8 max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        ← Back to Fridges
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Recipe Finder</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Based on your global inventory</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-white dark:bg-zinc-800 p-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                    <button
                        onClick={() => setViewMode('finder')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'finder'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                            }`}
                    >
                        🔎 Generator
                    </button>
                    <button
                        onClick={() => setViewMode('saved')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'saved'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                            }`}
                    >
                        ❤️ Saved ({savedRecipes.length})
                    </button>
                </div>
            </header>

            {viewMode === 'finder' && (
                <div className="mb-8 max-w-5xl mx-auto flex justify-end gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <input
                            type="checkbox"
                            checked={filterCanMake}
                            onChange={(e) => setFilterCanMake(e.target.checked)}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Can make now</span>
                    </label>

                    <button
                        onClick={fetchRecipes}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Finding...' : 'Find New Recipes'}
                    </button>
                </div>
            )}

            <main className="max-w-5xl mx-auto">
                {viewMode === 'finder' ? (
                    // GENERATOR VIEW
                    <>
                        {recipes.length === 0 && !loading && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                                <p className="text-xl text-zinc-500">Click "Find New Recipes" to ask the chef!</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayedRecipes.map((recipe, idx) => (
                                <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleSave(recipe)}
                                            className="bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-400 hover:text-red-500 p-2 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-600 transition-colors"
                                            title="Save Recipe"
                                        >
                                            ❤️
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start mb-4 pr-12">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{recipe.title}</h3>
                                            <div className="text-sm text-zinc-500 mt-1">
                                                ⏱ {recipe.time} • {recipe.difficulty}
                                            </div>
                                        </div>
                                        {recipe.missing_ingredients.length === 0 ? (
                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full border border-amber-200">
                                                - {recipe.missing_ingredients.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Ingredients & Steps same as before */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">You Have:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {recipe.matching_ingredients.map((ing: string, i: number) => (
                                                    <span key={i} className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded text-xs">
                                                        ✓ {ing}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {recipe.missing_ingredients.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">You Need:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {recipe.missing_ingredients.map((ing: string, i: number) => (
                                                        <span key={i} className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-xs">
                                                            ✗ {ing}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700 mt-auto">
                                            <details className="group/details">
                                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-zinc-700 dark:text-zinc-300">
                                                    <span>Instructions</span>
                                                    <span className="transition group-open/details:rotate-180">▼</span>
                                                </summary>
                                                <div className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 space-y-2">
                                                    {recipe.instructions.map((step: string, i: number) => (
                                                        <p key={i}>{i + 1}. {step}</p>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    // SAVED VIEW
                    <>
                        {savedRecipes.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                                <p className="text-xl text-zinc-500">No saved recipes yet. Go find some!</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {savedRecipes.map((recipe, idx) => (
                                <div key={idx} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(recipe.id)}
                                            className="bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-400 hover:text-red-600 p-2 rounded-full shadow-sm border border-zinc-200 dark:border-zinc-600 transition-colors"
                                            title="Remove"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{recipe.title}</h3>
                                            <div className="text-sm text-zinc-500 mt-1">
                                                ⏱ {recipe.time} • {recipe.difficulty}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        {/* Minimized view for saved recipes, mostly just instructions */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">Ingredients:</h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {recipe.matching_ingredients.join(", ")}
                                                {recipe.missing_ingredients.length > 0 && " + needed: " + recipe.missing_ingredients.join(", ")}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700 mt-auto">
                                            <details className="group/details">
                                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-zinc-700 dark:text-zinc-300">
                                                    <span>Instructions</span>
                                                    <span className="transition group-open/details:rotate-180">▼</span>
                                                </summary>
                                                <div className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 space-y-2">
                                                    {recipe.instructions.map((step: string, i: number) => (
                                                        <p key={i}>{i + 1}. {step}</p>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

"use client"
import { useState } from 'react';
import Link from 'next/link';

export default function GoalCoachPage() {
    const [goal, setGoal] = useState("");
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<any>(null);

    const PRESETS = [
        "Weight Loss / Low Carb",
        "Muscle Gain / High Protein",
        "Heart Health / Low Sodium",
        "Budget Friendly / Low Waste",
        "Quick & Easy Meals"
    ];

    const fetchAdvice = async (selectedGoal: string) => {
        setLoading(true);
        setGoal(selectedGoal); // Update input if preset clicked
        try {
            const res = await fetch('http://localhost:8000/goals/advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal: selectedGoal }),
            });
            if (res.ok) {
                const data = await res.json();
                setAdvice(data);
            } else {
                alert("Failed to get advice. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching advice:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8 font-[family-name:var(--font-geist-sans)]">
            <header className="mb-8 max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        ← Back to Fridges
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">AI Goal Coach</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Personalized dietary advice based on your fridge</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto space-y-8">
                {/* Input Section */}
                <section className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <label className="block text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        What is your health or dietary goal?
                    </label>

                    <div className="flex gap-2 mb-6 flex-wrap">
                        {PRESETS.map(preset => (
                            <button
                                key={preset}
                                onClick={() => fetchAdvice(preset)}
                                className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 text-zinc-600 dark:text-zinc-300 text-sm font-medium transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g. 'I want to eat more vegetables' or 'Training for a marathon'"
                            className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && fetchAdvice(goal)}
                        />
                        <button
                            onClick={() => fetchAdvice(goal)}
                            disabled={loading || !goal.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                        >
                            {loading ? 'Thinking...' : 'Get Advice'}
                        </button>
                    </div>
                </section>

                {/* Results Section */}
                {advice && (
                    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Score Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Coach's Assessment</h2>
                                    <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
                                        "{advice.assessment}"
                                    </p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center min-w-[100px]">
                                    <span className="text-sm font-medium uppercase tracking-wider opacity-80">Score</span>
                                    <span className="text-4xl font-bold">{advice.score}/10</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* EAT List */}
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl p-6">
                                <h3 className="text-green-800 dark:text-green-400 font-bold flex items-center gap-2 mb-4">
                                    <span>✅</span> Eat These
                                </h3>
                                <ul className="space-y-2">
                                    {advice.eat_list.map((item: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                    {advice.eat_list.length === 0 && <li className="text-zinc-400 italic text-sm">Nothing specific found.</li>}
                                </ul>
                            </div>

                            {/* AVOID List */}
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6">
                                <h3 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2 mb-4">
                                    <span>❌</span> Avoid These
                                </h3>
                                <ul className="space-y-2">
                                    {advice.avoid_list.map((item: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                            {item}
                                        </li>
                                    ))}
                                    {advice.avoid_list.length === 0 && <li className="text-zinc-400 italic text-sm">Great job! Nothing to avoid.</li>}
                                </ul>
                            </div>

                            {/* BUY List */}
                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-2xl p-6">
                                <h3 className="text-purple-800 dark:text-purple-400 font-bold flex items-center gap-2 mb-4">
                                    <span>🛒</span> Buy Next
                                </h3>
                                <ul className="space-y-2">
                                    {advice.shopping_list.map((item: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                                            <span className="text-purple-500">+</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

"use client"
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NutritionAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await fetch(`http://localhost:8000/fridges/${id}/analysis`);
                console.log("Analysis response status:", res.status);

                if (res.ok) {
                    const data = await res.json();
                    console.log("Analysis data:", data);
                    setAnalysis(data);
                } else {
                    const errText = await res.text();
                    console.error("Analysis failed:", res.status, errText);
                    throw new Error(`Server returned ${res.status}: ${errText}`);
                }
            } catch (error: any) {
                console.error("Failed to fetch analysis:", error);
                setError(error.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-500">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p>AI is analyzing your fridge...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto">
                <Link href={`/fridges/${id}`} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 inline-block">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Nutrition Analysis</h1>

                {analysis ? (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col items-center text-center">
                            <h2 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">Health Score</h2>
                            <div className={`
                                w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold mb-6
                                ${analysis.score >= 8 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                    analysis.score >= 5 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}
                            `}>
                                {analysis.score}/10
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed text-lg">
                                {analysis.analysis}
                            </p>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <span className="text-blue-500">💡</span> Recommendations
                            </h2>
                            <ul className="space-y-4">
                                {analysis.recommendations?.map((rec: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-zinc-700 dark:text-zinc-300">
                                        <span className="text-blue-500 font-bold">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-zinc-500 flex flex-col items-center">
                        <p className="mb-4 text-red-500 font-medium">Error: {error || "Could not generate analysis."}</p>
                        <p className="text-sm mb-4">Please check the console for details.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

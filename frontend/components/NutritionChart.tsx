"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Item } from '../app/types';

interface NutritionChartProps {
    items: Item[];
    title?: string;
}

export default function NutritionChart({ items, title = "Nutritional Overview" }: NutritionChartProps) {
    const calculateTotals = () => {
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            sugar: 0,
        };

        items.forEach(item => {
            if (item.nutritional_info) {
                // Determine multiplier based on quantity if needed, but usually nutrition is per unit * quantity
                // Assuming nutritional_info returned by backend is already total for the item's quantity 
                // OR we need to multiply.
                // Let's assume the backend returns it PER UNIT for now, so we multiply by quantity.
                // Re-reading crud.py: `nutrition = ai_service.get_nutrition_info(item.name, item.quantity, item.unit)`
                // The AI service asks for nutrition for "{quantity} {unit} of {item_name}".
                // So the returned data is ALREADY for the total quantity.

                totals.calories += (item.nutritional_info.calories || 0);
                totals.protein += (item.nutritional_info.protein || 0);
                totals.carbs += (item.nutritional_info.carbs || 0);
                totals.fat += (item.nutritional_info.fat || 0);
                totals.sugar += (item.nutritional_info.sugar || 0);
            }
        });

        return [
            { name: 'Protein (g)', value: totals.protein, color: '#8884d8' },
            { name: 'Carbs (g)', value: totals.carbs, color: '#82ca9d' },
            { name: 'Sugar (g)', value: totals.sugar, color: '#fda4af' }, // Pink
            { name: 'Fat (g)', value: totals.fat, color: '#ffc658' },
        ];
    };

    const data = calculateTotals();
    const totalCalories = items.reduce((sum, item) => sum + (item.nutritional_info?.calories || 0), 0);

    if (items.length === 0) return null;

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-zinc-100">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Total Calories: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{totalCalories.toLocaleString()} kcal</span>
            </p>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" fontSize={12} tick={{ fill: '#71717a' }} />
                        <YAxis fontSize={12} tick={{ fill: '#71717a' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

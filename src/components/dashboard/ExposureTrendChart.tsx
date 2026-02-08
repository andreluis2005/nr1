import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ExposureTrendChart() {
    const { exposureHistory } = useData();

    if (!exposureHistory || exposureHistory.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-neutral-150 p-6 h-64 flex flex-col items-center justify-center text-center">
                <TrendingDown className="w-8 h-8 text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-500 italic">Tendência técnica ficará disponível após os primeiros snapshots.</p>
            </div>
        );
    }

    // Formatar dados para o gráfico
    const chartData = exposureHistory.map(snapshot => ({
        data: new Date(snapshot.data_snapshot).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        exposicao: snapshot.exposicao_total,
    }));

    return (
        <div className="bg-white rounded-xl border border-neutral-150 p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Tendência de Exposição</h2>
                    <p className="text-sm text-neutral-500">Evolução da carga de risco técnico</p>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="data"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '12px'
                            }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="exposicao"
                            stroke="#2563EB"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

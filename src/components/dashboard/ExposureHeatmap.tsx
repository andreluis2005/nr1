import { Thermometer } from 'lucide-react';
import { useData } from '@/context/DataContext';

export function ExposureHeatmap() {
    const { exposureData, setores } = useData();

    if (!exposureData || !exposureData.exposicaoPorSetor) {
        return (
            <div className="bg-white rounded-xl border border-neutral-150 p-6 h-full flex items-center justify-center">
                <p className="text-sm text-neutral-500 italic">Dados de exposição não disponíveis.</p>
            </div>
        );
    }

    // Mapear exposição para nomes de setores para exibição
    const sectorExposure = Object.entries(exposureData.exposicaoPorSetor).map(([id, value]) => {
        const setor = setores.find(s => s.id === id);
        return {
            nome: setor?.nome || id,
            valor: value as number
        };
    }).sort((a, b) => b.valor - a.valor);

    const maxExposure = Math.max(...sectorExposure.map(s => s.valor), 1);

    return (
        <div className="bg-white rounded-xl border border-neutral-150 p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Mapa de Calor (Exposição)</h2>
                    <p className="text-sm text-neutral-500">Intensidade técnica por setor</p>
                </div>
            </div>

            <div className="space-y-4">
                {sectorExposure.length > 0 ? (
                    sectorExposure.map((item, index) => {
                        const percentage = (item.valor / maxExposure) * 100;
                        // Intensidade puramente proporcional sem semântica crítica de thresholds (Ouro Contract)
                        const baseColor = 'bg-primary-600';

                        return (
                            <div key={index} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-neutral-700 truncate max-w-[150px]">{item.nome}</span>
                                    <span className="text-neutral-500">{item.valor} pts</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${baseColor} transition-all duration-1000 ease-out`}
                                        style={{
                                            width: `${percentage}%`,
                                            opacity: 0.3 + (percentage / 100) * 0.7 // Intensidade proporcional
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-neutral-500">Nenhum risco detectado nos setores.</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                <span>Baixa Intensidade</span>
                <span>Alta Intensidade</span>
            </div>
        </div>
    );
}

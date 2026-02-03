import { avaliarNR1 } from "@/domains/risks/nr1.engine";

export function NR1StatusCard() {
    const resultado = avaliarNR1({
        cnae: "6201-5/01",
        numeroFuncionarios: 12,
        possuiPGR: false,
        possuiInventarioRiscos: false,
        possuiPlanoAcao: false,
    });

    return (
        <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
            <h3>Status NR-1</h3>

            <p>
                <strong>Conformidade:</strong>{" "}
                {resultado.statusConformidade}
            </p>

            <p>
                <strong>Riscos identificados:</strong>{" "}
                {resultado.riscos.length}
            </p>

            <ul>
                {resultado.riscos.map((risco) => (
                    <li key={risco.id}>
                        {risco.descricao} —{" "}
                        <strong>{risco.nivel}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}

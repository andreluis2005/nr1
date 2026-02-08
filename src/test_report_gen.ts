import { generateNR1Report, calculateHash } from './core/agents/technicalAgent';

const mockTemplate = `
# RELATÓRIO TESTE
Empresa: {{empresa.razao_social}}
Hash: {{hash_relatorio}}
Total Riscos: {{indicadores.total_riscos}}

{{#each inventario}}
| {{nome}} | {{exposicao}} |
{{/each}}
`;

const mockData = {
    empresa: { razao_social: 'Empresa Teste LTDA', cnpj: '00.000.000/0001-91', cnae: '62.01-5-00', endereco: 'Rua X' },
    indicadores: { total_riscos: 5, riscos_criticos: 1, exposicao_total: 1500.5 },
    exposicao_por_setor: [],
    exposicao_por_funcao: [],
    inventario: [
        { nome: 'Ruído', setor: 'Produção', severidade: 4, probabilidade: 3, rating: 12, num_trabalhadores: 10, exposicao: 120 },
        { nome: 'Calor', setor: 'Cozinha', severidade: 5, probabilidade: 4, rating: 20, num_trabalhadores: 5, exposicao: 100 }
    ],
    metadados: {
        data_emissao: '08/02/2026',
        periodo_referencia: 'Fevereiro 2026',
        versao_relatorio: '1.0.0',
        timestamp_geracao: new Date().toISOString()
    }
};

async function test() {
    console.log('--- TESTANDO GERAÇÃO DE RELATÓRIO ---');
    const reportPart1 = generateNR1Report(mockTemplate, mockData);
    const hash = await calculateHash(reportPart1);
    const finalReport = reportPart1.replace('{{hash_relatorio}}', hash);

    console.log('Relatório Gerado:\n', finalReport);
    console.log('Hash Gerado:', hash);

    if (finalReport.includes('Empresa Teste LTDA') && finalReport.includes(hash)) {
        console.log('\n✅ SUCESSO: Placeholders e Hash validados.');
    } else {
        console.log('\n❌ ERRO: Falha na validação.');
    }
}

test();

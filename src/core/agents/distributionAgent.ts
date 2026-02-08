import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/lib/supabase';
import { calculateHash } from './technicalAgent';

export interface ExportMetadata {
    userId: string;
    reportId: string;
    companyId: string;
    ipAddress: string;
    userAgent: string;
}

/**
 * Agente de Distribuição v1
 * - Converte Markdown para PDF de forma determinística
 * - Valida integridade via Hash SHA-256 antes da geração
 * - Insere Selo de Integridade em todas as páginas
 * - Registra log de auditoria da exportação
 */
export async function exportReportToPDF(
    markdown: string,
    expectedHash: string,
    metadata: ExportMetadata
): Promise<Blob> {
    console.log('[Phase 7B] Iniciando exportação de relatório...', metadata.reportId);

    // 1. Validação de Integridade Pré-Renderização (CONDIÇÃO DE GUARDA)
    const recalculatedHash = await calculateHash(markdown);
    if (recalculatedHash !== expectedHash) {
        console.error('[Phase 7B] Falha de Integridade detectada!', { expectedHash, recalculatedHash });
        throw new Error('Falha de Integridade: O conteúdo do relatório divergiu do hash registrado e a exportação foi abortada.');
    }

    // 2. Setup do Documento PDF
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let cursorY = 20;

    // Função auxiliar para Selo de Integridade (Rodapé)
    const applyIntegritySeals = (d: any) => {
        const pageCount = d.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            d.setPage(i);
            d.setFontSize(7);
            d.setTextColor(150);

            // Linha separadora do rodapé
            d.setDrawColor(240);
            d.line(margin, d.internal.pageSize.height - 15, pageWidth - margin, d.internal.pageSize.height - 15);

            // Selo de Integridade
            d.text(
                `Selo de Integridade NR1 PRO | Documento Técnico Imutável | Hash: ${expectedHash}`,
                margin,
                d.internal.pageSize.height - 10
            );

            // Paginação
            d.text(
                `Página ${i} de ${pageCount}`,
                pageWidth - margin - 15,
                d.internal.pageSize.height - 10
            );
        }
    };

    // 3. Renderização Determinística do Markdown
    const lines = markdown.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            cursorY += 5;
            continue;
        }

        // Detecção de Tabelas (Markdown simples)
        if (line.startsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }
            i--; // Ajuste de ponteiro

            // Processamento de linhas da tabela
            const rows = tableLines
                .filter(l => !l.includes('---')) // Ignora delimitadores de header
                .map(l => l.split('|').map(c => c.trim()).filter(c => c !== ''));

            if (rows.length > 0) {
                const head = rows[0];
                const body = rows.slice(1);

                doc.autoTable({
                    head: [head],
                    body: body,
                    startY: cursorY,
                    margin: { left: margin, right: margin },
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
                    alternateRowStyles: { fillColor: [249, 250, 251] }
                });
                cursorY = doc.lastAutoTable.finalY + 10;
            }
            continue;
        }

        // Títulos (H1 e H2)
        if (line.startsWith('# ')) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 41, 59); // Slate 800
            doc.text(line.replace('# ', ''), margin, cursorY);
            cursorY += 12;
        } else if (line.startsWith('## ')) {
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(71, 85, 105); // Slate 600
            doc.text(line.replace('## ', ''), margin, cursorY);
            cursorY += 10;
        } else if (line.startsWith('---')) {
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.line(margin, cursorY, pageWidth - margin, cursorY);
            cursorY += 8;
        } else if (line.startsWith('>')) {
            // Blockquotes / Notas
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100);
            const text = line.replace('>', '').trim();
            const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin - 10);

            // Desenha barra lateral da nota
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(1);
            doc.line(margin, cursorY - 4, margin, cursorY + (splitText.length * 4));

            doc.text(splitText, margin + 5, cursorY);
            cursorY += (splitText.length * 4) + 6;
        } else {
            // Texto Normal
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);

            // Remove negritos simples (**text**) para renderização limpa
            const cleanLine = line.replace(/\*\*/g, '');
            const splitText = doc.splitTextToSize(cleanLine, pageWidth - 2 * margin);
            doc.text(splitText, margin, cursorY);
            cursorY += (splitText.length * 5) + 2;
        }

        // Controle de Quebra de Página
        if (cursorY > doc.internal.pageSize.height - 35) {
            doc.addPage();
            cursorY = 20;
        }
    }

    // Aplicação final de selos e numeração
    applyIntegritySeals(doc);

    // 4. Registro de Log de Auditoria (Governança Phase 7B)
    try {
        const { error: logError } = await supabase.from('auditoria_logs').insert({
            usuario_id: metadata.userId,
            empresa_id: metadata.companyId,
            acao: 'export_pdf',
            entidade: 'relatorios_tecnicos',
            entidade_id: metadata.reportId,
            dados_novos: {
                hash: expectedHash,
                format: 'pdf',
                engine_version: 'v1.0-distribution',
                export_timestamp: new Date().toISOString()
            },
            ip_address: metadata.ipAddress,
            user_agent: metadata.userAgent
        });

        if (logError) console.warn('[Phase 7B] Erro ao registrar log de exportação:', logError);
    } catch (e) {
        console.warn('[Phase 7B] Exceção ao registrar log:', e);
    }

    return doc.output('blob');
}

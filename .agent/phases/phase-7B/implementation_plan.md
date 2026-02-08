**Estado:** APPROVED  
**Phase:** Phase 7B – Distribuição e Formalização da Evidência NR-1  
**Data:** 2026-02-08  
**Aprovado por:** Arquitetura NR1 PRO (2026-02-08)  

---

## REGISTRO DE APROVAÇÃO

O presente Implementation Plan foi revisado quanto à sua aderência:

- À governança definida em `IMPLEMENTATION_GOVERNANCE.md`
- À continuidade técnica da Phase 7A (fonte única de verdade em Markdown)
- Aos princípios de integridade, rastreabilidade e cadeia de custódia da evidência NR-1

Fica autorizado o início da execução da Phase 7B exclusivamente dentro do escopo aqui definido.

Qualquer alteração estrutural, ampliação de escopo ou inclusão de mecanismos não previstos (ex: assinatura digital ICP-Brasil ou persistência de PDFs) exige a criação de uma nova versão deste plano.

---

## 1. VISÃO GERAL DA PHASE 7B
A Phase 7B estabelece a camada de governança de saída e distribuição do sistema NR1 PRO. Enquanto a Phase 7A garantiu a criação de uma evidência técnica imutável em Markdown, esta fase foca na transformação desse artefato para formatos de consumo humano (PDF) e na garantia de que a cadeia de custódia permaneça íntegra durante o processo de entrega ao usuário final ou autoridades.

## 2. ARQUITETURA DO PROCESSO DE DISTRIBUIÇÃO
O processo de distribuição será desacoplado do motor de geração:
- **Consumo**: Leitura do arquivo Markdown canônico e seus metadados de integridade.
- **Transformação**: Conversão determinística para PDF, preservando a semântica e a ordem das seções.
- **Sinalização**: Inclusão automática de marcas de integridade (Hash SHA-256) em todas as páginas do documento derivado.

## 3. FLUXO DE EVIDÊNCIA (RELATÓRIO → PDF → ENTREGA)
1. **Requisição**: Usuário autenticado solicita o download/exportação de um relatório específico.
2. **Validação de Fonte**: O sistema verifica o Hash SHA-256 do Markdown original contra o banco de dados antes de iniciar a renderização.
3. **Renderização Estática**: Conversão do Markdown para um PDF estático.
4. **Incorporação de Metadados**: O Hash de integridade da Phase 7A é inserido no rodapé do PDF como "Selo de Integridade Digital".
5. **Timestamping**: Registro do momento exato da exportação (divergente da data de emissão técnica).

## 4. ESTRATÉGIA DE INTEGRIDADE E VERIFICAÇÃO
A validade do PDF deriva inteiramente do Markdown original:
- **Hash Visível**: O hash SHA-256 deve ser legível no PDF para conferência manual ou via sistema.
- **Validação Cruzada**: O sistema deve prover uma funcionalidade (conceitual) onde o upload do PDF permita extrair o hash e verificar sua autenticidade no log de auditoria da Phase 7A.
- **Marca d'Água de Evidência**: Identificação do sistema (NR1 PRO) e da versão do engine SST no corpo do documento.

## 5. GOVERNANÇA DE ACESSO E AUDITORIA
- **Rastreabilidade de Download**: Cada evento de exportação deve ser registrado em log, contendo: `User ID`, `Report ID`, `Timestamp`, `IP Address`.
- **Controle de Acesso (RBAC)**: Apenas perfis autorizados (Admin, Gestor SST, Auditor) podem disparar a geração de PDF.
- **Imutabilidade do Derivado**: O PDF gerado é uma "foto" do estado técnico e não permite edições pós-processamento.

## 6. CRITÉRIOS DE CONCLUSÃO DA PHASE
A Phase 7B será considerada concluída após:
- [ ] Motor de renderização Markdown para PDF validado (preservação de tabelas e estrutura).
- [ ] Inclusão do Hash SHA-256 da Phase 7A no layout do PDF confirmada.
- [ ] Log de auditoria de distribuição capturando eventos de exportação.
- [ ] Mecanismo de verificação de integridade pós-exportação validado.

## 7. LIMITAÇÕES E ESCOPO NEGADO
- **Assinatura Digital**: Não contempla a integração com certificados ICP-Brasil (Assinatura Qualificada). A validade é técnica e interna do sistema.
- **Customização de Layout**: O estilo do PDF é fixo e padronizado para auditoria; não haverá editor de temas ou cores.
- **Armazenamento de PDF**: O sistema não armazena os PDFs gerados, apenas os logs de sua criação. A fonte de verdade permanece sendo o Markdown da Phase 7A.

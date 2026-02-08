# IMPLEMENTATION PLAN — PHASE 7A
**Estado:** LOCKED  
**Phase:** Phase 7A – Relatório Técnico NR-1 Imutável  
**Data:** 2026-02-07  
**Aprovado por:** Arquitetura NR1 PRO (2026-02-07)  
**Autorizado por:** Product Owner (Retroativo em 2026-02-08)  

---

## 1. VISÃO GERAL
A Phase 7A foca na materialização do estado técnico do Gerenciamento de Riscos Ocupacionais (GRO) em um artefato documental estático. O objetivo é garantir que os dados processados pelo motor regulatório sejam consolidados em um relatório técnico que sirva como evidência de exposição ocupacional em um marco temporal específico.

## 2. ARQUITETURA DO MOTOR DE GERAÇÃO
O motor de geração (Report Engine) operará como um transformador puramente funcional:
- **Input**: Snapshots técnicos e metadados da organização.
- **Processamento**: Hidratação de indicadores (total de riscos, níveis de severidade, matriz de probabilidade e cálculo de exposição).
- **Formatador**: Injeção de dados no template canônico `RELATORIO_TECNICO_NR1.md`.
- **Output**: Instância final do relatório em formato Markdown.

## 3. FLUXO DE DADOS (SNAPSHOTS)
Para garantir a fidelidade técnica, o relatório consome dados exclusivamente de snapshots:
1. **Seleção**: Identificação do Snapshot ID de referência.
2. **Extração**: Leitura das tabelas de riscos, setores e funções associadas ao snapshot.
3. **Consolidação**: Agregação dos valores para os indicadores macros do relatório.
4. **Acoplamento**: Registro da relação unívoca entre o Report ID e o Snapshot ID.

## 4. ESTRATÉGIA DE IMUTABILIDADE
A imutabilidade é garantida por design:
- **Criação de Arquivo Único**: Cada execução gera uma nova instância de relatório.
- **Bloqueio de Edição**: O sistema não provê interface para alteração de relatórios gerados.
- **Integridade Temporal**: Registros de data de emissão e período de referência são extraídos diretamente do snapshot.

## 5. GERAÇÃO E PERSISTÊNCIA DE HASH
A integridade do documento é validada via criptografia:
- **Algoritmo**: SHA-256 aplicado ao conteúdo integral do documento.
- **Placeholder**: O hash resultante é inserido no placeholder `{{hash_relatorio}}` no rodapé do documento.
- **Registro de Auditoria**: O hash é persistido em tabela de metadados do sistema para validação posterior de autenticidade (anti-tamper).

## 6. CRITÉRIOS DE CONCLUSÃO DA PHASE
A Phase 7A será considerada concluída após a validação dos parâmetros:
- [ ] Motor de substituição de placeholders operacional.
- [ ] Rastreabilidade confirmada: Relatório -> Snapshot técnico.
- [ ] Hash SHA-256 gerado e validado contra o conteúdo do arquivo.
- [ ] Persistência dos metadados de integridade no banco de dados.
- [ ] Exportação do arquivo final no formato Markdown (.md) sem alterações estruturais no template.

---

## 7. LIMITAÇÕES
- O escopo limita-se à geração da evidência técnica em Markdown.
- Não inclui visualização de PDF ou regras de distribuição (escopo da Phase 7B).
- Não emite juízo de valor sobre a adequação dos riscos declarados.

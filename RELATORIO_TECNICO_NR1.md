# RELATÓRIO TÉCNICO DE AVALIAÇÃO DE RISCOS OCUPACIONAIS  
## NR-1 – Gerenciamento de Riscos Ocupacionais (GRO)

---

## 1. IDENTIFICAÇÃO DA EMPRESA

**Razão Social:** {{empresa.razao_social}}  
**CNPJ:** {{empresa.cnpj}}  
**CNAE Principal:** {{empresa.cnae}}  
**Endereço:** {{empresa.endereco}}  

**Data de Emissão do Relatório:** {{data_emissao}}  
**Período de Referência Técnica:** {{periodo_referencia}}  

---

## 2. IDENTIFICAÇÃO DO DOCUMENTO

**Tipo de Documento:** Relatório Técnico de Avaliação de Exposição a Riscos Ocupacionais  
**Base Legal:** Norma Regulamentadora nº 1 (NR-1) – GRO / PGR  
**Sistema Emissor:** NR1 PRO – Plataforma de Governança SST  

**Versão do Relatório:** {{versao_relatorio}}  
**Hash de Integridade:** {{hash_relatorio}}  

> Este relatório é um artefato técnico imutável, gerado automaticamente a partir de dados estruturados registrados no sistema.

---

## 3. OBJETIVO DO RELATÓRIO

Este relatório tem como objetivo **registrar e evidenciar tecnicamente** a exposição ocupacional a riscos identificados na organização, conforme os princípios do Gerenciamento de Riscos Ocupacionais (GRO), atendendo aos requisitos da NR-1.

O documento **não emite juízo de conformidade legal**, **não prescreve ações corretivas** e **não substitui laudos, pareceres ou avaliações profissionais especializadas**.

---

## 4. METODOLOGIA TÉCNICA ADOTADA

### 4.1 Identificação de Riscos
Os riscos ocupacionais foram identificados a partir dos cadastros técnicos realizados pela organização, associados a:
- Setores
- Funções
- Agentes de risco
- Parâmetros técnicos declarados

### 4.2 Avaliação de Risco
Cada risco foi avaliado tecnicamente por meio da **Matriz de Risco**, considerando:
- Severidade
- Probabilidade

**Rating Técnico = Severidade × Probabilidade**

### 4.3 Cálculo de Exposição
A exposição ao risco foi calculada de forma objetiva, multiplicando o rating técnico pelo número de trabalhadores potencialmente expostos.

> Exposição = Rating Técnico × Trabalhadores Expostos

---

## 5. RESULTADOS TÉCNICOS CONSOLIDADOS

### 5.1 Indicadores Gerais

- **Total de Riscos Identificados:** {{indicadores.total_riscos}}  
- **Riscos Técnicos Críticos (rating elevado):** {{indicadores.riscos_criticos}}  
- **Exposição Técnica Total:** {{indicadores.exposicao_total}}  

---

### 5.2 Distribuição da Exposição por Setor

| Setor | Exposição Técnica |
|-----|------------------|
{{#each exposicao_por_setor}}
| {{setor}} | {{valor}} |
{{/each}}

---

### 5.3 Distribuição da Exposição por Função

| Função | Exposição Técnica |
|------|------------------|
{{#each exposicao_por_funcao}}
| {{funcao}} | {{valor}} |
{{/each}}

---

## 6. INVENTÁRIO TÉCNICO DE RISCOS

| Risco | Setor | Severidade | Probabilidade | Rating | Trabalhadores Expostos | Exposição |
|-----|------|-----------|---------------|--------|------------------------|-----------|
{{#each inventario}}
| {{nome}} | {{setor}} | {{severidade}} | {{probabilidade}} | {{rating}} | {{num_trabalhadores}} | {{exposicao}} |
{{/each}}

---

## 7. SÉRIE TEMPORAL E HISTÓRICO (QUANDO APLICÁVEL)

Este relatório pode incorporar dados históricos provenientes de snapshots técnicos diários imutáveis.

> Alterações realizadas após a data de referência **não impactam** os registros históricos apresentados.

---

## 8. LIMITAÇÕES E ESCOPO

- Este relatório reflete exclusivamente os dados técnicos registrados no sistema na data de referência.
- Não substitui avaliações presenciais, medições ambientais ou análises ergonômicas.
- Não representa certificação de conformidade legal.
- A interpretação regulatória é responsabilidade do empregador e de seus responsáveis técnicos.

---

## 9. DECLARAÇÃO DE INTEGRIDADE

Declara-se que este relatório foi gerado automaticamente por sistema informatizado, com base em dados estruturados fornecidos pela organização, respeitando princípios de integridade, rastreabilidade e imutabilidade histórica.

---

## 10. ASSINATURA TÉCNICA DO SISTEMA

**Sistema:** NR1 PRO  
**Módulo Técnico:** Agente Técnico v2 – Avaliação de Exposição  
**Motor Regulatório:** NR-1 Engine (Atemporal)  

**Data e Hora de Geração:** {{timestamp_geracao}}  

---

*Documento gerado eletronicamente. Dispensa assinatura manual.*

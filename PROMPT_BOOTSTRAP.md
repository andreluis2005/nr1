# Prompt de Inicialização (Bootstrap) - NR1 PRO

Este documento serve como a **diretriz mestre** para qualquer nova instância de IA ou desenvolvedor que for atuar no projeto NR1 PRO. Ele deve ser fornecido integralmente para garantir a integridade arquitetural do sistema.

---

## 🚀 Contexto do Projeto
O NR1 PRO é um sistema de gestão de Segurança e Saúde no Trabalho (SST) baseado estritamente na Norma Regulamentadora nº 01 (NR-1). A arquitetura é centrada em um **Motor Regulatório** puramente lógico.

## 🛡️ Regras de Ouro (Anti-Regressão)
1. **Contrato Ouro**: Toda lógica de decisão sobre conformidade, risco, cores ou labels regulatórios deve residir EXCLUSIVAMENTE em `src/domains/risks/nr1.engine.ts`.
2. **UI Burra**: Componentes React e páginas são cascas declarativas. É PROIBIDO calcular status de conformidade ou inferir riscos na camada de UI.
3. **Imutabilidade do Motor**: O motor deve permanecer uma função pura. Não deve haver chamadas ao Supabase, APIs ou manipulação de DOM dentro do `nr1.engine.ts`.
4. **Acoplamento via Contexto**: A UI deve consumir dados e estados regulatórios apenas através dos hooks do `DataContext` (ex: `useData()`).

## 📚 Referências Normativas
- **Documento Regulatório**: Veja `NR1_REGULATORY_CONTRACT.md` no root.
- **Documento de Arquitetura**: Veja `ARCHITECTURE.md` no root.

## 🛠️ Como atuar no Projeto
Ao receber uma solicitação de feature ou correção:
1. **Audite a Intenção**: A mudança afeta o status de conformidade da empresa?
    - Se **SIM**, a alteração começa obrigatoriamente pelo `nr1.engine.ts`.
    - Se **NÃO** (ex: layout, filtros, CRUD simples), siga os padrões de componentes existentes.
2. **Respeite o Desacoplamento**: Nunca importe o motor em componentes. Use os hooks intermediários que publicam o estado via contexto.
3. **Mantenha a Semântica**: Use a nomenclatura oficial de estados (`ESTRUTURA_INCOMPLETA`, `CONFORME_OURO`, etc) em vez de descrições genéricas.

---

## 🚨 Checklist de Verificação de IA
Antes de entregar qualquer código, você deve confirmar:
- [ ] Eu adicionei alguma lógica de `if/else` sobre conformidade na UI? (Deve ser Não)
- [ ] Eu alterei o motor regulatório sem atualizar a documentação do contrato?
- [ ] Eu usei referências legadas como `indiceConformidade` ou `pgrStatus`? (Estes termos foram deletados).
- [ ] O código respeita a hierarquia de camadas descrita no `ARCHITECTURE.md`?

---
**Firmado para preservação da qualidade arquitetural do NR1 PRO.**

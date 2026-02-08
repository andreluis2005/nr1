# IMPLEMENTATION GOVERNANCE (NR1 PRO)

Este documento define as normas, o ciclo de vida e a governança para todos os **Implementation Plans** do sistema NR1 PRO. Ele atua como uma meta-norma para garantir a previsibilidade, a segurança arquitetural e a rastreabilidade das decisões de engenharia.

---

## 1. PAPEL DO DOCUMENTO
Um **Implementation Plan** é o artefato formal de planejamento técnico que precede qualquer alteração significativa no sistema. Sua função é descrever o "como" uma feature ou alteração será executada, garantindo que a implementação esteja alinhada com o contrato regulatório e a arquitetura do sistema.

**O que ele não deve conter**:
- Lógica de negócio não aprovada.
- Código executável final.
- Ambiguidades ou múltiplas opções sem decisão clara.

## 2. CICLO DE VIDA DE UM IMPLEMENTATION PLAN
Cada plano deve declarar obrigatoriamente um dos seguintes estados:

- **DRAFT**: Plano em fase de rascunho. Alterações frequentes são permitidas. Não tem validade técnica.
- **REVIEW**: Plano finalizado pelo autor e submetido para revisão da arquitetura ou do produto.
- **APPROVED**: Plano validado e autorizado para execução. É a única base válida para alterações de código.
- **LOCKED**: Plano executado integralmente. Torna-se um registro histórico imutável.
- **DEPRECATED**: Plano substituído por uma nova versão ou descartado.

## 3. REGRAS DE CRIAÇÃO
- **Autoria**: Qualquer desenvolvedor ou arquiteto pode propor um plano.
- **Estrutura**: Deve seguir o template oficial de planos de implementação.
- **Localização**: Deve ser armazenado em diretório específico de planejamento ou vinculado a uma fase de desenvolvimento.
- **Nomeação**: Deve ser descritivo e, se aplicável, numerado de acordo com a fase correspondente.

## 4. REGRAS DE APROVAÇÃO
- **Executoriedade**: Um plano **não pode** ser executado sem estar explicitamente no estado `APPROVED`.
- **Registro**: A aprovação deve ser registrada no cabeçalho do arquivo com data e identificação do aprovador.
- **Imutabilidade pós-aprovação**: Uma vez aprovado, o conteúdo técnico do plano não pode ser alterado sob o mesmo arquivo.

## 5. REGRAS DE EXECUÇÃO
- **Alinhamento**: O código implementado deve refletir fielmente o plano aprovado.
- **Não-Retroatividade**: A execução de um plano não autoriza alterações históricas em artefatos já bloqueados (`LOCKED`).
- **Validade**: Planos nos estados `DRAFT` ou `REVIEW` não autorizam o uso de ferramentas de escrita ou alteração de estado no repositório.

## 6. VERSIONAMENTO E SUPERSESSÃO
- **Evolução**: Alterações fundamentais em um plano aprovado exigem a criação de uma nova versão (ex: `v2`, `v3`).
- **Supersessão**: O novo plano deve declarar explicitamente qual versão anterior ele está substituindo.
- **Histórico**: Planos antigos substituídos devem ser movidos para o estado `DEPRECATED`.

## 7. PRINCÍPIOS DE SEGURANÇA CONCEITUAL
- **Prevenção de Deriva**: O plano serve para evitar a introdução de features "escondidas" ou alterações não documentadas.
- **Separação de Preocupações**: Governança (o quê e por que) e Implementação (como realizar) devem estar claramente delimitadas.
- **Rigor Normativo**: A conformidade com este documento é pré-requisito para a aceitação de qualquer contribuição técnica ao projeto.

---

*“Nada avança sem um implementation plan aprovado.”*

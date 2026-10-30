# Spec Delta

## ADDED Requirements

### Requirement: Skills panel groups the list with Live
Cuando la sección Skills está visible y `skilldex.showLiveArea` está activa, su panel SHALL agrupar en un solo contenedor la lista scrolleable de skills y el bloque Live, con Live debajo de la lista. El panel de Rules MUST NOT incluir ese bloque ni ese contenedor. Ocultar Skills, u ocultar el área Live, MUST ocultar el bloque Live. El scroll de la lista de skills MUST NOT desplazarse con el bloque Live.

#### Scenario: Live stays under the scrolling skill list
- **WHEN** la sección Skills está visible y la lista de skills desborda
- **THEN** la lista MUST hacer scroll en su propio hueco
- **AND** el bloque Live MUST permanecer debajo de ese hueco, fuera del scroll

#### Scenario: Rules panel has no Live container
- **WHEN** se muestra la sección Rules
- **THEN** el panel MUST NOT incluir el contenedor que agrupa la lista de skills con Live

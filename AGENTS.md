# AGENTS.md — Engineering Standards

> Version: 3.0 compacta
> Rama canonica: `staging`
> Identidad: `GLOBAL-IA: REPO-IA: <mensaje>`

## Autoridad

Este archivo es la fuente global del workspace. Los `AGENTS.md` locales pueden operar aislados, pero si existe este archivo deben respetarlo.

## Reglas No Negociables

| Area | Regla |
|---|---|
| Respuesta | Iniciar siempre con `GLOBAL-IA: REPO-IA:` |
| Rama base | Trabajar desde `staging` |
| Ramas protegidas | No modificar directamente `main` ni `qa` |
| PR destino | Crear PRs hacia `staging` |
| Prohibido | PR/merge automatico hacia `qa`, `dev` o `main` |
| Seguridad | No exponer secretos, tokens ni PII |
| Calidad | No cerrar cambios sin validacion relevante |
| Git | Commits atomicos con Conventional Commits |

## Gate de Eficiencia

Antes de usar herramientas:

| Paso | Accion |
|---|---|
| 1 | Clasificar tarea: N1, N2 o N3 |
| 2 | Definir archivos/rutas/simbolos objetivo |
| 3 | Buscar con `rg`/glob antes de leer |
| 4 | Leer solo rangos necesarios |
| 5 | Paralelizar operaciones independientes |
| 6 | No releer archivos editados salvo conflicto/error/verificacion externa |
| 7 | Reclasificar si el alcance crece |

| Nivel | Criterio | Modelo | Estrategia |
|---|---|---|---|
| N1 | <=2 archivos, cambio conocido | Ligero | `rg` -> rango -> test puntual |
| N2 | 3-5 archivos o modulo conocido | Estandar | busqueda paralela -> lectura seccional -> edicion enfocada |
| N3 | >5 archivos, seguridad, arquitectura o bug incierto | Potente | exploracion resumida -> plan -> pruebas amplias |

## Ingenieria

- Aplicar Clean Architecture, SOLID, DRY, bajo acoplamiento y alta cohesion.
- Reutilizar patrones locales antes de crear abstracciones.
- Refactorizar primero si la complejidad impide extender con claridad.
- Logs estructurados, accionables y sin datos sensibles.
- Cambios de API deben actualizar Swagger/OpenAPI.

## Testing

Todo cambio de codigo requiere validacion proporcional al riesgo:

- Happy path.
- Error esperado.
- Edge case relevante.
- Si no se puede ejecutar, documentar causa y validacion alternativa.

## Workflow Git

Resumen obligatorio:

```bash
git fetch origin
git checkout staging
git rebase origin/staging
git checkout -b <feature|fix|refactor|hotfix>/<descripcion>
```

- Sincronizar con `rebase`, no merge.
- Publicar ramas con upstream.
- Usar `--force-with-lease` despues de rebase.
- Nunca resolver conflictos eligiendo automaticamente `--ours` o `--theirs`.
- Si hay ambiguedad de negocio en conflicto, escalar al usuario.

Detalle operativo: `docs/agents/git-flow.md`.

## Entrega

| Caso | Requisito |
|---|---|
| Sin cambios de archivos | No generar preview de commit/PR |
| Con cambios | Ejecutar validacion, commit, push y preview |
| Rama `feature/*`, `fix/*`, `refactor/*`, `hotfix/*` | Crear o referenciar PR hacia `staging` |
| No se puede commitear | Entregar comando sugerido listo |

Preview/plantilla de PR: `docs/agents/pr-template.md`.

## OpenSpec

Para archivos en `openspec/`:

- `proposal.md` inicia con tabla TL;DR: Contexto | Objetivo | Impacto.
- Usar `##`/`###`, separadores `---` y bullets claros.
- Si hay mas de 3 componentes, incluir diagrama Mermaid en `design.md`.
- `tasks.md` debe agrupar por capa con checkboxes.

Detalle: `docs/agents/openspec.md`.

## Antipatrones Prohibidos

| Antipatron | Correccion |
|---|---|
| Leer archivo completo para encontrar simbolo | `rg` + rango |
| Releer archivo editado para confirmar | diff/test/verificacion externa |
| Busquedas independientes secuenciales | paralelizar |
| Modelo potente para estado simple | usar N1 |
| Modelo ligero para seguridad/arquitectura | escalar a N3 |
| Explicaciones largas en cambios triviales | respuesta proporcional |
| Merge directo a `staging` sin PR | solo si el usuario lo pide explicitamente |

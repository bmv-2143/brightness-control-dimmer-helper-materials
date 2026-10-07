# Связи AS-IS → решения → TO-BE → примеры → проверки

[Глоссарий: термины и обозначения](glossary.md). Местные пояснения сохраняют тот же смысл.

Источники: [инвентаризация](legacy-behavior-inventory.md), [решения](behavior-decisions.md), [спецификация](product-specification.md), [план](test-plan.md). RULE определены в6 документах [features](features/brightness-and-dimming.md); SCN — в6 файлах `../../features/*.feature`. TEST — только запланированная проверка, не существующий/пройденный тест.

Диапазоны в таблице включительны. SCN-001–SCN-043 соответствуют одноимённым TEST; добавленные SCN-044–SCN-059 соответствуют TEST-053–TEST-068 по явной таблице ниже, поскольку TEST-044–TEST-052 уже заняты дополнительными проверками. Это связь документов, не автоматическое исполнение Gherkin. Некоторые проверки разделяют несколько LB, общую логику и платформенный эффект.

| LB | DEC | FEAT | RULE | SCN | TEST |
|---|---|---|---|---|---|
| LB-001 | DEC-001 | FEAT-001 | RULE-001 | SCN-001–SCN-002 | TEST-001–TEST-002 |
| LB-002 | DEC-001 | FEAT-001 | RULE-002 | SCN-003 | TEST-003,TEST-045,TEST-048 |
| LB-003 | DEC-002 | FEAT-002 | RULE-003 | SCN-004–SCN-005 | TEST-004–TEST-005,TEST-048 |
| LB-004 | DEC-003 | FEAT-003 | RULE-004 | SCN-006 | TEST-006 |
| LB-005 | DEC-004 | FEAT-004 | RULE-006 | SCN-009 | TEST-009 |
| LB-006 | DEC-003 | FEAT-003 | RULE-005 | SCN-007–SCN-008 | TEST-007–TEST-008 |
| LB-007 | DEC-005 | FEAT-005 | RULE-007 | SCN-010–SCN-011 | TEST-010–TEST-011 |
| LB-008 | DEC-006 | FEAT-006 | RULE-008 | SCN-012 | TEST-012 |
| LB-009 | DEC-006 | FEAT-006 | RULE-009 | SCN-013–SCN-015 | TEST-013–TEST-015 |
| LB-010 | DEC-006 | FEAT-006 | RULE-008,RULE-009 | SCN-012–SCN-015 | TEST-012–TEST-015 |
| LB-011 | DEC-007 | FEAT-007 | RULE-010 | SCN-016 | TEST-016 |
| LB-012 | DEC-007 | FEAT-007 | RULE-011 | SCN-017 | TEST-017,TEST-023 |
| LB-013 | DEC-007 | FEAT-007 | RULE-012 | SCN-018 | TEST-018 |
| LB-014 | DEC-007 | FEAT-007 | RULE-013 | SCN-019 | TEST-019 |
| LB-015 | DEC-008 | FEAT-008 | RULE-014 | SCN-020 | TEST-020,TEST-047 |
| LB-016 | DEC-008 | FEAT-008 | RULE-014,RULE-004 | SCN-020,SCN-006 | TEST-020,TEST-006 |
| LB-017 | DEC-008 | FEAT-008 | RULE-015 | SCN-021 | TEST-021 |
| LB-018 | DEC-009 | FEAT-008 | DROP: force-close shade, controls сохранены | — | TEST-044 |
| LB-019 | DEC-010 | FEAT-008 | RULE-018 | SCN-025 | TEST-025 |
| LB-020 | DEC-011 | FEAT-009 | RULE-019 | SCN-026 | TEST-026 |
| LB-021 | DEC-011 | FEAT-009 | RULE-019,RULE-008 | SCN-026,SCN-012 | TEST-026,TEST-012 |
| LB-022 | DEC-011 | FEAT-009 | RULE-019 | SCN-026 | TEST-026,TEST-047 |
| LB-023 | DEC-011 | FEAT-009 | RULE-020,RULE-021 | SCN-027–SCN-029 | TEST-027–TEST-029 |
| LB-024 | DEC-011 | FEAT-009 | RULE-020 | SCN-027 | TEST-027 |
| LB-025 | DEC-011 | FEAT-009 | RULE-021 | SCN-029 | TEST-029 |
| LB-026 | DEC-011 | FEAT-009 | RULE-022; DROP только keyguard17..20 mechanism | SCN-030 | TEST-030,TEST-044,TEST-046 |
| LB-027 | DEC-012 | FEAT-010 | RULE-024 | SCN-032 | TEST-032,TEST-046 |
| LB-028 | DEC-012 | FEAT-010 | RULE-023 | SCN-031 | TEST-031 |
| LB-029 | DEC-013 частично принят | FEAT-011/FEAT-012 | RULE-041–RULE-046; отказ Auto/записи Q-001 PENDING_USER | SCN-051–SCN-059 | TEST-060–TEST-068 |
| LB-030 | DEC-014 | FEAT-011 | RULE-025 | SCN-033 | TEST-033,TEST-047 |
| LB-031 | DEC-015 | FEAT-011 | DROP: forced crash restart, storage сохранено | — | TEST-044 |
| LB-032 | DEC-016 | FEAT-012 | RULE-026 | SCN-034 | TEST-034 |
| LB-033 | DEC-016 | FEAT-012 | RULE-027,RULE-025 | SCN-035,SCN-033 | TEST-035,TEST-033 |
| LB-034 | DEC-016 | FEAT-012 | RULE-028 | SCN-036 | TEST-036,TEST-047 |
| LB-035 | DEC-016 | FEAT-012 | RULE-026 | SCN-034 | TEST-034 |
| LB-036 | DEC-017 | FEAT-013 | RULE-029 | SCN-037 | TEST-037,TEST-045 |
| LB-037 | DEC-010 | FEAT-014 | RULE-016 | SCN-022 | TEST-022 |
| LB-038 | DEC-010 | FEAT-014 | RULE-017 | SCN-023–SCN-024 | TEST-023–TEST-024 |
| LB-039 | DEC-010 | FEAT-014 | RULE-017 | SCN-024 | TEST-024 |
| LB-040 | DEC-018 | FEAT-015 | RULE-030 | SCN-038 | TEST-038 |
| LB-041 | DEC-018 | FEAT-015 | RULE-031 | SCN-039 | TEST-039,TEST-049 |
| LB-042 | DEC-018 | FEAT-015 | RULE-031 | SCN-039 | TEST-039,TEST-049 |
| LB-043 | DEC-019 | FEAT-015 | DROP: partial custom selector; fixed list сохранён | — | TEST-044 |
| LB-044 | DEC-020 | FEAT-015 | DROP: disabled Accessibility workaround; exclusions сохранены | — | TEST-044 |
| LB-045 | DEC-021 | FEAT-016 | RULE-036,RULE-040 | SCN-044–SCN-045,SCN-049–SCN-050 | TEST-053–TEST-054,TEST-058–TEST-059 |
| LB-046 | DEC-021 | FEAT-016 | RULE-037 | SCN-046 | TEST-055; editor semantics TEST-013–TEST-015 |
| LB-047 | DEC-022 | FEAT-017 | RULE-038 | SCN-047 | TEST-056 |
| LB-048 | DEC-023 | FEAT-018 | RULE-039,RULE-040 | SCN-048–SCN-049 | TEST-057–TEST-058 |
| LB-049 | DEC-024 | FEAT-019 | RULE-032 | SCN-040 | TEST-040 |
| LB-050 | DEC-025 | FEAT-019 | DROP: hidden Premium taps | — | TEST-040,TEST-044 |
| LB-051 | DEC-026 | FEAT-020 | RULE-033 | SCN-041 | TEST-041 |
| LB-052 | DEC-027 | FEAT-021 | RULE-034 | SCN-042 | TEST-042,TEST-050 |
| Нет LB: заданные min/target/toolchain, TESTING.md и offline независимость E05 | DEC-028 | FEAT-021 / все CAP | RULE-035 | SCN-043 | TEST-043,TEST-047,TEST-050 |

## Где находятся RULE/SCN

| Группа | Нормативные правила | Gherkin |
|---|---|---|
| Свет | [RULE-001–RULE-007](features/brightness-and-dimming.md) | [SCN-001–SCN-011](../../features/brightness-and-dimming.feature) |
| Controls/widgets | [RULE-008–RULE-015,RULE-019–RULE-022](features/controls-and-widgets.md) | [SCN-012–SCN-021,SCN-026–SCN-030](../../features/controls-and-widgets.feature) |
| Permissions/exclusions | [RULE-016–RULE-018,RULE-030–RULE-031](features/permissions-and-exclusions.md) | [SCN-022–SCN-025,SCN-038–SCN-039](../../features/permissions-and-exclusions.feature) |
| State/timer/safety | [RULE-023–RULE-029,RULE-041–RULE-046](features/state-and-recovery.md) | [SCN-031–SCN-037,SCN-051–SCN-059](../../features/state-and-recovery.feature) |
| Help/constraints | [RULE-032–RULE-035](features/help-and-constraints.md) | [SCN-040–SCN-043](../../features/help-and-constraints.feature) |
| Монетизация | [RULE-036–RULE-040](features/monetization.md) | [SCN-044–SCN-050](../../features/monetization.feature) |

## Проверка документов

После ответов 2026-10-05–07:59 уникальных SCN,46 уникальных RULE, один Feature и `# language: en` в каждом из6 файлов. SCN и FEAT заданы tags; RULE ID в названии Rule. Новые SCN-044–SCN-059 связаны с TEST-053–TEST-068. Начальные состояния/Examples проверены вручную; это не запуск acceptance и не машинная parser-валидация.

Готовый Gherkin parser не найден в доступных MCP tools, Python runtime, bundled Node modules и пользовательских global npm modules. Библиотеки не устанавливались. Машинная проверка текстовых ссылок/ID/числа Feature не является parser-валидацией Gherkin; синтаксис подтверждён только ручным просмотром. Будущий parser check — TEST-051, до автоматического исполнения сценариев. Никакого собственного parser не создавалось.

## Дополнение о защитном minimum и будущем исследовании

| Основание | Решение | Feature | RULE / SCN | TEST |
|---|---|---|---|---|
| LB-002/LB-003, комментарий Const:54–60 и прямое поручение пользователя | DEC-029 KEEP, CONFIRMED_BY_USER только для защиты и уточнений | FEAT-001/FEAT-002 | RULE-002/RULE-003; SCN-003 с дополнительными Examples1..4, SCN-004 | TEST-003,TEST-004,TEST-048 |
| Идея пользователя о будущем опыте с подтверждением и откатом; в Legacy не реализована | DEC-030 INVESTIGATE, CONFIRMED_BY_USER только как кандидат будущей работы | Связана с CAP-001/FEAT-001; нового принятого Feature нет | Нет утверждённого RULE/SCN; текущий floor действует | TEST-052 — будущая оценка реализуемости, не acceptance кандидата |

После дополнения35 RULE/43 SCN сохранены, Examples SCN-003 расширены.52 TEST: первый51 с прежними ID, TEST-052 отдельно исследовательский. Историческое свидетельство не повышает confidence runtime-результата Legacy; молчание не подтверждает возможность диагностики.

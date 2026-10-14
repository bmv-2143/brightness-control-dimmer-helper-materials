# Связи AS-IS → решения → TO-BE → примеры → проверки

[Глоссарий: термины и обозначения](glossary.md). Местные пояснения сохраняют тот же смысл.

Источники: [инвентаризация](legacy-behavior-inventory.md), [решения](behavior-decisions.md), [спецификация](product-specification.md), [план](test-plan.md). RULE определены в6 документах [features](features/brightness-and-dimming.md); SCN — в6 файлах `../../features/*.feature`. TEST — только запланированная проверка, не существующий/пройденный тест.

Диапазоны в таблице включительны. SCN-001–SCN-043 соответствуют одноимённым TEST; добавленные SCN-044–SCN-062 соответствуют TEST-053–TEST-071 по явной таблице ниже, поскольку TEST-044–TEST-052 уже заняты дополнительными проверками. Это связь документов, не автоматическое исполнение Gherkin. Некоторые проверки разделяют несколько LB, общую логику и платформенный эффект.

| LB | DEC | FEAT | RULE | SCN | TEST |
|---|---|---|---|---|---|
| LB-001 | DEC-001 CONFIRMED_BY_USER, default255/OEM совместимость | FEAT-001 | RULE-001 | SCN-001–SCN-002 | TEST-001–TEST-002 |
| LB-002 | DEC-001 CONFIRMED_BY_USER, default255/OEM совместимость | FEAT-001 | RULE-002 | SCN-003 | TEST-003,TEST-045,TEST-048 |
| LB-003 | DEC-002 CONFIRMED_BY_USER; численный перенос принят2026-10-09 | FEAT-002 | RULE-003 | SCN-004–SCN-005 | TEST-004–TEST-005,TEST-048 |
| LB-004 | DEC-003 CONFIRMED_BY_USER | FEAT-003 | RULE-004 | SCN-006 | TEST-006 |
| LB-005 | DEC-004 | FEAT-004 | RULE-006 | SCN-009 | TEST-009 |
| LB-006 | DEC-003 CONFIRMED_BY_USER | FEAT-003 | RULE-005 | SCN-007–SCN-008 | TEST-007–TEST-008 |
| LB-007 | DEC-005 CONFIRMED_BY_USER | FEAT-005 | RULE-007 | SCN-010–SCN-011 | TEST-010–TEST-011 |
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
| LB-027 | DEC-012 CONFIRMED_BY_USER | FEAT-010 | RULE-024 | SCN-032 | TEST-032,TEST-046 |
| LB-028 | DEC-012 CONFIRMED_BY_USER | FEAT-010 | RULE-023 | SCN-031 | TEST-031 |
| LB-029 | DEC-013 CONFIRMED_BY_USER | FEAT-011/FEAT-012 | RULE-041–RULE-048; Q-001 CLOSED_BY_USER | SCN-051–SCN-062 | TEST-060–TEST-071 |
| LB-030 | DEC-014 CONFIRMED_BY_USER | FEAT-011 | RULE-025 | SCN-033 | TEST-033,TEST-047 |
| LB-031 | DEC-015 | FEAT-011 | DROP: forced crash restart, storage сохранено | — | TEST-044 |
| LB-032 | DEC-016 CONFIRMED_BY_USER | FEAT-012 | RULE-026 | SCN-034 | TEST-034 |
| LB-033 | DEC-016 CONFIRMED_BY_USER | FEAT-012 | RULE-027,RULE-025 | SCN-035,SCN-033 | TEST-035,TEST-033 |
| LB-034 | DEC-016 CONFIRMED_BY_USER | FEAT-012 | RULE-028 | SCN-036 | TEST-036,TEST-047 |
| LB-035 | DEC-016 CONFIRMED_BY_USER | FEAT-012 | RULE-026 | SCN-034 | TEST-034 |
| LB-036 | DEC-017 CHANGE/CONFIRMED_BY_USER | FEAT-013 | RULE-029: только active negative session | SCN-037 | TEST-037,TEST-045 |
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
| LB-049 | DEC-024 CONFIRMED_BY_USER | FEAT-019 | RULE-032 | SCN-040 | TEST-040 |
| LB-050 | DEC-025 CONFIRMED_BY_USER | FEAT-019 | DROP: hidden Premium taps | — | TEST-040,TEST-044 |
| LB-051 | DEC-026 CONFIRMED_BY_USER | FEAT-020 | RULE-033 | SCN-041 | TEST-041 |
| LB-052 | DEC-027 CONFIRMED_BY_USER | FEAT-021 | RULE-034 | SCN-042 | TEST-042,TEST-050 |
| Нет LB: заданные min/target/toolchain, TESTING.md и offline независимость E05 | DEC-028 | FEAT-021 / все CAP | RULE-035 | SCN-043 | TEST-043,TEST-047,TEST-050 |

## Где находятся RULE/SCN

| Группа | Нормативные правила | Gherkin |
|---|---|---|
| Свет | [RULE-001–RULE-007](features/brightness-and-dimming.md) | [SCN-001–SCN-011](../../features/brightness-and-dimming.feature) |
| Controls/widgets | [RULE-008–RULE-015,RULE-019–RULE-022](features/controls-and-widgets.md) | [SCN-012–SCN-021,SCN-026–SCN-030](../../features/controls-and-widgets.feature) |
| Permissions/exclusions | [RULE-016–RULE-018,RULE-030–RULE-031](features/permissions-and-exclusions.md) | [SCN-022–SCN-025,SCN-038–SCN-039](../../features/permissions-and-exclusions.feature) |
| State/timer/safety | [RULE-023–RULE-029,RULE-041–RULE-048](features/state-and-recovery.md) | [SCN-031–SCN-037,SCN-051–SCN-062](../../features/state-and-recovery.feature) |
| Help/constraints | [RULE-032–RULE-035](features/help-and-constraints.md) | [SCN-040–SCN-043](../../features/help-and-constraints.feature) |
| Монетизация | [RULE-036–RULE-040](features/monetization.md) | [SCN-044–SCN-050](../../features/monetization.feature) |

## Проверка документов

После ответов 2026-10-05–08:62 уникальных SCN,48 уникальных RULE, один Feature и `# language: en` в каждом из6 файлов. SCN и FEAT заданы tags; RULE ID в названии Rule. Новые SCN-044–SCN-062 связаны с TEST-053–TEST-071. Начальные состояния/Examples проверены вручную; это не запуск acceptance и не машинная parser-валидация.

Готовый Gherkin parser не найден в доступных MCP tools, Python runtime, bundled Node modules и пользовательских global npm modules. Библиотеки не устанавливались. Машинная проверка текстовых ссылок/ID/числа Feature не является parser-валидацией Gherkin; синтаксис подтверждён только ручным просмотром. Будущий parser check — TEST-051, до автоматического исполнения сценариев. Никакого собственного parser не создавалось.

## Дополнение о защитном minimum и будущем исследовании

| Основание | Решение | Feature | RULE / SCN | TEST |
|---|---|---|---|---|
| LB-002/LB-003, комментарий Const:54–60 и прямое поручение пользователя | DEC-029 KEEP, CONFIRMED_BY_USER только для защиты и уточнений | FEAT-001/FEAT-002 | RULE-002/RULE-003; SCN-003 с дополнительными Examples1..4, SCN-004 | TEST-003,TEST-004,TEST-048 |
| Идея пользователя о будущем опыте с подтверждением и откатом; в Legacy не реализована | DEC-030 INVESTIGATE, CONFIRMED_BY_USER только как кандидат будущей работы | Связана с CAP-001/FEAT-001; нового принятого Feature нет | Нет утверждённого RULE/SCN; текущий floor действует | TEST-052 — будущая оценка реализуемости, не acceptance кандидата |

После дополнения35 RULE/43 SCN сохранены, Examples SCN-003 расширены.52 TEST: первый51 с прежними ID, TEST-052 отдельно исследовательский. Историческое свидетельство не повышает confidence runtime-результата Legacy; молчание не подтверждает возможность диагностики.

## Подтверждение двух пунктов —2026-10-08

RULE-007/SCN-010–SCN-011/TEST-010–TEST-011 и RULE-023/SCN-031/TEST-031
подтверждены как поведение, не как выполненные испытания. Принято также отсутствие
повторной команды/снятия активного overlay при обычном открытии.
RULE-024/SCN-032/TEST-032/TEST-046 и RULE-025/SCN-033/TEST-033/TEST-047
остаются на review: открытие не означает принятия recreation/повтордоставки.

## Следующий ответ первого блока —2026-10-08

Подтверждены RULE-003/SCN-004–SCN-005/TEST-004–TEST-005,
RULE-005/SCN-007–SCN-008/TEST-007–TEST-008 и RULE-025/SCN-033/TEST-033.
Общее TEST-047 содержит и другие, ещё не подтверждённые функции: его нельзя
объявлять принятым целиком по этому ответу. Перенос negative presets и
RULE-024/SCN-032/TEST-032/TEST-046 остаются на review, DEC-015 также открыт.
Все SCN/TEST — спецификация будущей проверки, не выполненное испытание.

## Подтверждение пунктов1–3 —2026-10-09

RULE-024/SCN-032/TEST-032 и часть TEST-046 о prefs upgrade приняты.
Принята также часть TEST-044 об отсутствии forced crash restart DEC-015;
остальные части этих общих TEST не подтверждаются автоматически.
Перенос negative presets из DEC-002 связан с RULE-024: сохранить числа,
не применять автоматически при upgrade, однократное краткое сообщение.
Все SCN/TEST запланированы, не выполнялись. DEC-001 ещё на review.

## Подтверждён default255 и требование OEM совместимости —2026-10-09

RULE-001–RULE-002/SCN-001–SCN-003/TEST-001–TEST-003 подтверждены для default255;
нестандартная совместимость — принятое требование с будущей технической проверкой.
E04/реестр устройств связывает мотив с преобразованиями step/sync/boot/floor.
Новых OEM алгоритмов, RULE/SCN/TEST ID или результатов испытаний нет.
Группы1–2 закрыты; DEC-016/DEC-017 — следующий review.

## Приняты случаи группы3 —2026-10-12

[Случаи1–17](timer-and-safety-cases.md#связи-и-закрытие-группы3) связаны со стабильными
RULE-026–RULE-029/SCN-034–SCN-037/TEST-034–TEST-037. DEC-016 подтверждён;
DEC-017 подтверждён для отрицательных сессий, positive manual применимость открыта.
Случай11 уточняет уже принятое RULE-007/SCN-010/TEST-010. Случай12 подтверждает
только timer часть RULE-027/SCN-039/TEST-039, не всю семантику exclusions.
TEST-045/TEST-047 остаются будущими characterization/platform проверками;
ничего не выполнено и общий состав этих TEST не подтверждён целиком.

## Группа3 закрыта полностью —2026-10-12

Пользователь принял вариант2: защитная последовательность действует только в
актуальной отрицательной сессии; positive manual25 остаётся25. DEC-017 теперь
подтверждён полностью для этого контракта. [Случай18](timer-and-safety-cases.md).
RULE-029/SCN-037/TEST-037 согласованы, прежние открытые статусы исторические.
Следующий блок — группа4: DEC-008/DEC-009/DEC-010, затем группы5–7/MVVM план.
15 ADOPTED_BY_AGENT/15 CONFIRMED_BY_USER;48 RULE/62 SCN/71 TEST, ID сохранены.
Реализация/испытания/архив не начаты; архив перед реализацией после плана.

## Принята группа4 —2026-10-12

DEC-008/009/010 подтверждены по случаям1–8. RULE-014–RULE-018 сохраняют прежние
SCN-020–SCN-025/TEST-020–TEST-025; отсутствие force-close системной панели
покрывает принятая часть TEST-044. Сведения [Honor Magic 7 Pro](notification-device-evidence.md)
уточняют RULE-014/SCN-020/TEST-020 (читаемость/цельные подписи/таймер) и
RULE-015/SCN-021/TEST-021 (стабильный ID/отсутствие роста каналов при recreation).
48 RULE/62 SCN/71 TEST без новых ID. Группы1–4 закрыты; устройство/новый макет/FGS
и миграция старых каналов агентом не проверены.

## Принята группа5 —2026-10-12

[Все16 случаев](../workflows/group5-widgets-and-exclusions-review.md) приняты.
Случаи1–8 → DEC-011/RULE-019–022/SCN-026–030/TEST-026–030;
общие presets используют ранее существующие RULE-008–009/SCN-012–015/TEST-012–015
только в указанном widget объёме, это не принятие всего DEC-006 группы7.
Случаи9–16 → DEC-018/RULE-030–031/SCN-038–039/TEST-038–039/049;
случай10 → DEC-019/020 и принятая часть TEST-044.
Unknown/revoke/явное off покрыты SCN-039/TEST-039; sleep/prefs BUG-001 —
SCN-026/TEST-026/028, без вывода о причине. Реальные detector/host/upgrade нужны отдельно.
22 CONFIRMED_BY_USER/8 ADOPTED_BY_AGENT;48 RULE/62 SCN/71 TEST, ID сохранены.

Уточнение пользователя2026-10-12 по потенциальному null LB-035/E23 связано с
DEC-016/RULE-026/SCN-034–035/TEST-034–035: безопасны открытие и Save/Cancel/Back/
закрытие без движения slider и без callback изменения. Число и ID артефактов
не меняются; runtime воспроизведение Legacy и проверка новой версии не выполнены.

## Принята группа6 —2026-10-14

Пользователь 2026-10-14: «Принимаем все предложения 1-12». Приняты [переработанные случаи группы6](../workflows/group6-help-sharing-and-accessibility-review.md): DEC-024–DEC-027 CONFIRMED_BY_USER. Теперь26 CONFIRMED_BY_USER/4 ADOPTED_BY_AGENT/0 PENDING_USER; остаются DEC-004/006/007/028 группы7. Всего30 DEC/48 RULE/62 SCN/71 TEST; ID сохранены. Принятие поведения не подтверждает реализацию или испытания.

Связи: случаи1–5 → DEC-024/RULE-032/SCN-040/TEST-040; случай6 → DEC-025
и принятая часть TEST-044; случаи7–8 → DEC-026/RULE-033/SCN-041/TEST-041;
случаи9–12 → DEC-027/RULE-034/SCN-042/TEST-042 и доступность TEST-050.
Взаимодействия используют ранее принятые правила сессии/таймера и TEST-031/035/036,
не принимают их заново. E10/E12/E35–E38 и P10–P15 остаются основаниями
кода/истории/документации, не доказательствами запуска. BUG-001–004 открыты,
причина BUG-001 неизвестна. UI-формы и диапазон группы7 не выбраны.

## Принята группа7 —2026-10-14

Пользователь: «Принимаем 1-13». Отдельно подтверждено прекращение поддержки
старых Android с использованием зависимостей, до которых проект уже обновлён.
[Все13 случаев группы7](../workflows/group7-controls-and-platform-review.md) подтверждают DEC-004/006/007/028.
Текущий итог:30 CONFIRMED_BY_USER/0 ADOPTED_BY_AGENT/0 PENDING_USER;
Q-001/Q-002 и группы1–7 закрыты. DEC-029/030 остаются в прежнем узком объёме.
Min26/compile-target37/bytecode17/JDK21 и подготовленный Kotlin/Compose стек
сохраняются; API21–25 новый выпуск не поддерживает. Нового обновления зависимостей нет.
Ранние открытые статусы выше исторические. Макеты, формы сообщений, launchMode,
платформенные механизмы и миграция ещё требуют плана/проверок.
BUG-001–004 открыты; принятие не подтверждает испытания или разрешение реализации.

Связи принятия: случай1→DEC-004/RULE-006/SCN-009/TEST-009;
случаи2–6→DEC-006/RULE-008–009/SCN-012–015/TEST-012–015,
истечение6Б→принятые RULE-028/TEST-036;
случаи7–11→DEC-007/RULE-010–013/SCN-016–019/TEST-016–019,
отказ9→TEST-023; случаи12–13→DEC-028/RULE-035/SCN-043/TEST-043/047.
Связанные RU/EN числовые примеры SCN/TEST-042 теперь используют101 вне[-75,100].
Стабильные ID сохранены;30 DEC/48 RULE/62 SCN/71 TEST. Новых сценариев/TEST не добавлено.

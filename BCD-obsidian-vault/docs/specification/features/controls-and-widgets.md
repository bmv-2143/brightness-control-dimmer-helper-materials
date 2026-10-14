# Панель, notification и widgets

[Глоссарий: термины и обозначения](../glossary.md). Местные пояснения сохраняют тот же смысл.

CAP-002/CAP-003. Семантика света общая с [brightness-and-dimming](brightness-and-dimming.md). Q-002 закрыт: доступность платных настроек задают RULE-036–RULE-038 в [monetization](monetization.md). Примеры editor/visibility ниже предполагают соответствующее действительное право.

| RULE / Feature / DEC | Формулировка, применимость и результат | Необходимые примеры |
|---|---|---|
| RULE-008 / FEAT-006 / DEC-006 | Принято2026-10-14. При отсутствии saved prefs main8: -75,-50,-25,0,25,50,75,100 иstep5; shared notification/controls widget4: -75,-25,25,75 иstep5. Валидные saved values не заменять defaults. Long tap main preset/+/− открывает preset/step editor; shared editor доступен через Settings и не зависит от включения controls | Точные8/4defaults; main/shared независимы; отдельные +/- widgets default10 уже приняты. Gates RULE-036–038 |
| RULE-009 / FEAT-006 / DEC-006 | Принято2026-10-14. Preset integer[-75,100], step integer[1,50]. Ok сохраняет выбранную настройку/labels и возвращает экран открытия без команды света; дальнейший управляющий tap применяет её. Cancel/Back/пустой Ok без записи. Invalid оставляет editor с читаемой ошибкой диапазона. Возврат/refresh не rearm и не оживляет истёкший dim | Границы preset-75/100, step1/50; UI invalid-76/101/0/51. Non-integer faults отдельно от обычного ввода. Main25→75/shared25→35 при свете50; шаги2/10 дают27→37→35; editor15:59/end16:00/Cancel16:01 сохраняет25 и не возвращает-25 |
| RULE-010 / FEAT-007 / DEC-007 | Принято2026-10-14. Пользовательское перемещение slider запрашивает изменившееся целое значение до release; программное отражение/animation не команда и не переводит Auto в manual. Без обещания физического результата каждого кадра | Drag25 с удержанием; OS Auto update без user gesture сохраняет Auto |
| RULE-011 / FEAT-007 / DEC-007 | Принято2026-10-14. close on select defaultfalse. Приtrue собственная панель закрывается после успешного preset/Auto; slider/+/− остаются открытыми. Установленный отказ оставляет панель и объяснение доступными — отличие от Legacy. Закрытие само не отменяет допустимый dim/deadline. Это не системный shade | true25/-25/Auto→close; trueplus/minus/slider→open; false25→open; noWRITE preset25 при manual50→open/отказ/50; partial не полный успех |
| RULE-012 / FEAT-007 / DEC-007 | Принято2026-10-14. Все visibility defaults=true; сохранённые настройки переживают reopen. Slider/rows/вложенные+/−/checkbox можно скрыть. Row3 скрывает Auto и+/−; скрытие checkbox не сбрасывает close/show controls. Settings всегда доступна, hide основных controls даёт подсказку даже при видимом checkbox | Hide slider/rows→hint/Settings, restore slider→visible/saved; row3false/show+/−true→нетAuto/+/−; hidecheckbox приclosetrue сохраняетtrue, выключение доступно вSettings |
| RULE-013 / FEAT-007 / DEC-007 | Принято2026-10-14. Launcher/value widget/область открытия Main в notification показывают одну панель без повторной команды/rearm. Back убирает панель, настройки и допустимая active session/deadline сохраняются. Фактически остановленную/истёкшую сессию не оживлять | Dim-25/end16:00, Home→вход15:00→Back→вход15:02 сохраняют срок. Конкретный launchMode/поведение незавершённого editor при внешнем входе ещё не выбраны |
| RULE-014 / FEAT-008 / DEC-008 | Принято2026-10-12. Быстрые notification controls optional defaultoff; on даёт4 presets/Auto/+/- и открытие Main, consistent mode/value. Длительное active dimming использует требуемый ОС foreground notice независимо от опции controls. Toggle controls не новая light command: не меняет яркость, overlay и deadline. Начальная конфигурация уведомления без звука/вибрации, пользовательский выбор канала сохраняется. Текущее значение/Auto читаемо в тексте, не только в малой иконке; подписи пресетов с минусом и % цельные, без переноса/обрезки. Макет, размеры и шрифты выбрать после проверки доступности | controls onnegative→-25 label/buttons;Auto→Auto;controlsoff active -50/end16:00→те же -50/end16:00 и required notice; -75%/-25%/100% и Auto читаемы, кнопки различимы; OS denial описан RULE-018 |
| RULE-015 / FEAT-008 / DEC-008 | Принято2026-10-12. Стабильный канал управления яркостью: не создавать новый ID при запуске/пересоздании сервиса или toggle controls и не пересоздавать канал для обхода user importance. Начальная importance HIGH без sound/vibration; смена user setting сохраняется при reopen/toggle/recreation. Доступ к системным channel settings заменяет принудительное возвращениеHIGH | UserLOW→toggleoff/on/reopen/recreation→тот же ID/LOW; число действующих каналов управления яркостью не растёт; OS notification blocked→BCD не выдаёт«разрешено» |
| RULE-019 / FEAT-009 / DEC-011 | Принято2026-10-12: сохранить4 home widget типа — value(openMain без light command), controls(shared с уведомлением4 presets/Auto/+/-), horizontal/vertical +/- с optionalAuto. Подписи там, где есть, отражают актуальное состояние; +/- не обязаны получать новую numeric label. Редактирование общих presets обновляет controls instances/уведомление без света. Сохранённые настройки переживают обычный сон; SCREEN_ON не повторяет preset; новое явное нажатие после unlock выполняет общий light contract либо честно показывает отказ | Auto вvalue; editshared25→35 без изменения50, затемtap35→35; четыре типа, sleep/unlock/repeat; BUG-001 причина неизвестна. Host/запуск/устройство ещё проверить |
| RULE-020 / FEAT-009 / DEC-011 | Принято2026-10-12: каждому +/- instance свой step1..50(default10), opacity оформления15..100 шаг5(default100), Auto visibility(defaultfalse). Update одного не меняет действие/вид другого; оформление не меняет экранную яркость/overlay и сохраняет различимость кнопок/нажатия | Astep2/Bstep10 от25:tapA→27,B→37,minusA→35; две одинаковые/разные ориентации, любой порядокupdate; оформление/Auto независимы |
| RULE-021 / FEAT-009 / DEC-011 | Принято2026-10-12: configure показывает saved параметры и сохраняет все per-ID settings вместе только по Save; Cancel/Back/invalidID не создаёт/меняет действующие settings. Отмена нового placement не оставляет действий нового ID. Delete удаляет все per-ID параметры/действия; позднее действие удалённого экземпляра не меняет свет, остальные сохраняются; новый instance не наследует остатки | 10/100/false→draft1/15/true:Save новые,Cancel/Back старые; invalidID без записи; deleteA/repeat/staletapA не меняют B/свет |
| RULE-022 / FEAT-009 / DEC-011 | Принято2026-10-12: перенос existing widget prefs сохраняет валидные шаг/оформление; explicit per-ID Auto имеет приоритет, при отсутствии использовать legacy global, затемfalse. Это единый TO-BE порядок, Legacy обслуживает старый/новые view IDs отдельно. Upgrade сам не применяет свет. Специальная ветвьAPI17..20 не переносится; современный lockscreen host отдельно не обещается | globaltrue/noID→visible;IDfalse/globaltrue→hidden;IDtrue/globalfalse→visible;нетобоих→hidden. Signed upgrade/старые layouts/host IDs ещё проверить |

Удалённые mechanisms DEC-009/DEC-011 не удаляют быстрый пользовательский доступ. Ни numeric icon asset design, ни RemoteViews/internal PendingIntent classes не нормативная архитектура. API37 memory limit P09 — будущая platform проверка.

Группа4 (DEC-008/DEC-009/DEC-010) принята. [Восемь случаев](../../workflows/group4-notifications-and-permissions-review.md)
и [свидетельства Honor Magic 7 Pro](../notification-device-evidence.md).
Принятый DEC-009 убирает принудительное закрытие системной панели и соответствующую
опцию на всех поддерживаемых API; это не настройка закрытия собственной панели BCD
из RULE-011, которая ещё относится к review DEC-007.
Читаемость RULE-014 уточнена по замечаниям пользователя; окончательный макет
не выбран. Проверить светлую/тёмную тему, увеличенный шрифт/масштаб интерфейса,
узкую доступную область и свёрнутое/развёрнутое уведомление на реальной прошивке.

## Принята группа5 —2026-10-12

[Случаи1–8](../../workflows/group5-widgets-and-exclusions-review.md) подтверждают
RULE-019–022. [Снимок Legacy](../widget-device-evidence.md) — справка по типам,
не утверждённые макеты. Shared presets приняты в widget объёме; DEC-006/007
группы7 остаются на review. Новых Android испытаний/исправлений BUG-001 нет.

## Принята группа7 —2026-10-14

Пользователь: «Принимаем 1-13». Отдельно подтверждено прекращение поддержки
старых Android с использованием зависимостей, до которых проект уже обновлён.
[Все13 случаев группы7](../../workflows/group7-controls-and-platform-review.md) подтверждают DEC-004/006/007/028.
Текущий итог:30 CONFIRMED_BY_USER/0 ADOPTED_BY_AGENT/0 PENDING_USER;
Q-001/Q-002 и группы1–7 закрыты. DEC-029/030 остаются в прежнем узком объёме.
Min26/compile-target37/bytecode17/JDK21 и подготовленный Kotlin/Compose стек
сохраняются; API21–25 новый выпуск не поддерживает. Нового обновления зависимостей нет.
Ранние открытые статусы выше исторические. Макеты, формы сообщений, launchMode,
платформенные механизмы и миграция ещё требуют плана/проверок.
BUG-001–004 открыты; принятие не подтверждает испытания или разрешение реализации.

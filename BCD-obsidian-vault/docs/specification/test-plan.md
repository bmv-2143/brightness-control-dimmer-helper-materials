# План последующего тестирования

[Глоссарий: термины и обозначения](glossary.md). Местные пояснения сохраняют тот же смысл.

TEST означает план, а не написанный или пройденный тест. Все SCN из [traceability](traceability.md) имеют план проверки. Цель acceptance — соответствие внешнему правилу; среда JVM/Android/UI/физический экран выбирается по доказуемому результату. Это не обязательная последовательная лестница unit→integration→E2E.

Fake — управляемая тестовая замена внешнего компонента; fixture — зафиксированные начальные данные; harness — окружение запуска проверок; readback — чтение настройки ОС после запроса; injected fault — намеренно моделируемая ошибка. Эти термины не означают существующие классы или уже установленную инфраструктуру.

## Минимальные среды и границы fake

- **L — быстрая JVM-проверка логики**: JUnit Jupiter6.1.3, JDK21, Coroutines Test1.11.0/virtual time. Real будущая логика BCD; fake системные raw/mode/grants/detector/clock/storage failure, только на явно заданной границе. Доказывает расчёт, выбор действия, state/deadline и отказ; не применение ОС, реальный overlay/касаний/UsageStats. Не требует запуска Android.
- **A — Android/platform-проверка**: JUnit4/AndroidX Test; real Settings.System, grants, channel, PendingIntent/widget host, lifecycle/alarm по цели. Fake разрешён только для недоступного детерминированного fault или clock/detection в специально помеченном случае; системный readback/host/overlay в platform-assertion не fake. Отдельный isolated emulator/device API26 и37, дополнительно31–35 по границам.
- **U — Android UI acceptance**: real Compose UI Test/ActivityScenario; UI Automator2.4.0 для system permission/notification/launcher/другого приложения. Real app state/persistence; сеть/монетизация могут быть отключены для независимых SCN, но это не тест paywall. Gherkin Given «editor доступен» явно задаёт действительное право по RULE-036–RULE-038; проверка его реального получения отдельно TEST-053–TEST-056.
- **D — физическое устройство**: real Settings/окно/touch/background и дисплей, хотя бы доступные разные OEM; API31+ и37 для overlay и новых ограничений,26 по возможности. Emulator проверяет API/UI, не реальную подсветку. Не придумывается количественный luminance SLA; различать readback, opacity обычной области и эффект дисплея.

P0 — core/safety/blocking release; P1 — основная функциональность/сохранение; P2 — вспомогательная информация. Общая зависимость всех строк — будущая реализация и согласованная связь SCN с тестом. Дополнительные зависимости указаны явно. Результаты L и A/D одной строки являются разными доказательствами одной цели, а не взаимозаменяемыми тестами.

## Проверки сценариев

| TEST / SCN | Цель, входные условия → действия → наблюдаемый результат | Среда, real/fake границы, API | Приоритет; зависимости |
|---|---|---|---|
| TEST-001 / SCN-001 | Разрешения есть; выбор -75,0,100 → принята именно выбранная цель | L: реальная проверка диапазона, fake grants; U: настоящий ввод, API26/37 | P0; DEC-001 |
| TEST-002 / SCN-002 | Manual25/raw63, без overlay/таймера; ввод -76/101/1.5/abc → ошибка без изменения состояния | L: запрет внешних действий; U: настоящий editor и сохранение | P0; доступный путь ввода после Q-002 |
| TEST-003 / SCN-003 | Затемнение и таймер активны; выбор0/1/2/3/4/5/6/25/100 → manual raw12 для0..5, затем15/63/255, снятие overlay/таймера, устойчивый повтор | L: формула и команды с fake adapter; A: реальный readback26/37; D: TEST-048 | P0; G01 |
| TEST-004 / SCN-004 | Оба grants есть, исключения/таймер выключены; -1/-25/-75 → raw12, alpha3/64/191 over255, касания проходят | L: только формула; A/D: реальные окна, касания и focus нижнего приложения26/31/37; контрольная область для opacity | P0; G02, реализуемость FGS |
| TEST-005 / SCN-005 | raw12 принят, alpha небезопасен; выбор-75 → частичная ошибка, нет блокирующего окна и скрытого clamp | L: fake ограничения opacity; A: воспроизводимый отказ окна при возможности; D: касания31+/37 | P0; injected fault не выдавать за реальный отказ ОС |
| TEST-006 / SCN-006 | Затемнение/таймер активны; Auto из panel/notification/widget → MODE_AUTO, снятие overlay/таймера, все labelsAuto, устойчивый повтор | L: переходы; A/U: настоящие surfaces и readback26/37, notice33+ | P0; G01/G05 |
| TEST-007 / SCN-007 | Auto raw128/255, прежнее число-50; шаг+5/-5 → цель55/95 | L: fake актуальный raw; A: читать реальный raw близко к действию, сохранять сведения о race | P0; G01, стабильный fixture не заменяет Auto на устройстве |
| TEST-008 / SCN-008 | Auto, чтение raw не удалось; плюс → ошибка, Auto сохранён, старое число не записано | L: injected read failure; U: отображение моделируемой ошибки, без утверждения об успехе ОС | P0; fault boundary только в будущем harness |
| TEST-009 / SCN-009 | Цели98/100/-73/-2/0; соответствующий шаг →100/100/-75/3/-5 | L: реальный clamp; A/U: переход через знак, raw и overlay | P0; G01/G02 |
| TEST-010 / SCN-010 | Sync=true, цель-25/таймер; внешнее изменение mode/raw → Auto или50 на всех surfaces, нет overlay/таймера/обратной записи | L: fake внешние события; A/U: настоящие Settings changes26/37 | P0; G01, порядок callbacks |
| TEST-011 / SCN-011 | Цель-25/таймер; собственный raw12 echo при sync=true или внешний raw128 при sync=false → цель/deadline сохранены, нет цикла | L: последовательности событий; A: настоящие observer callbacks, цель и observed state отображены отдельно | P0; G01; счётчик API calls не доказывает результат ОС |
| TEST-012 / SCN-012 | Нет prefs; открыть controls → точные8/4defaults и шаги5, независимость main/shared настроек | L: загрузка defaults; U: настоящие labels/settings26/37 | P1; доступ к settings зависит от Q-002 |
| TEST-013 / SCN-013 | Editor доступен, manualraw63; сохранить допустимый preset/step → pref/label изменены, свет прежний | L: запись настройки; U: настоящий editor/persistence; A: raw readback | P1; Q-002 |
| TEST-014 / SCN-014 | Preset25/step5; invalid ввод → editor открыт, ошибка, прежняя pref | L: validation; U: настоящий ввод и сохранённые значения | P1; Q-002 |
| TEST-015 / SCN-015 | Preset25; Cancel после ввода75 или пустой Done → preset25, свет не изменён | U: настоящий editor/lifecycle; A: readback; L: отсутствие записи | P1; Q-002 |
| TEST-016 / SCN-016 | Панель открыта, grants есть; drag25 с удержанием → raw63 до release; программное отражение не создаёт команду | U: Compose gesture/readback; L: различение user/programmatic event | P1; API26/37 |
| TEST-017 / SCN-017 | Close option on/off; fixed/Auto/step/slider → ожидаемое состояние панели, свет сохранён; отказ оставляет panel открытой | U: настоящий Activity lifecycle; A: raw/overlay; проверить defaultoff | P1; отказ дополнительно TEST-023 |
| TEST-018 / SCN-018 | Visibility доступна; hideall/row3 → hint/Settings доступны, нет вложенных+/-; restore сохраняется | U: реальные settings/reopen/hierarchy; L: зависимость групп | P1; Q-002 |
| TEST-019 / SCN-019 | Main открыт, dim активен; value widget → одна panel без новой команды; Back → panel закрыта, dim действует | U/A: настоящие launcher intents/task/overlay26/37 | P1; G03/G05 |
| TEST-020 / SCN-020 | Notification grant есть, dim разрешён; выключить controls → dim сохранён, обязательный notice передан ОС | A/U: настоящий FGS notice/shade/TaskManager26/33/37, без fake NotificationManager | P0; оценка законного FGS type/manifest, G03 |
| TEST-021 / SCN-021 | Channel существует, userLOW; toggle/reopen → тот же channel/LOW, без sound, blocked state учтён | A/U: реальные channel settings26/37 | P0; G03, наблюдать identity, не фиксировать внутренний класс |
| TEST-022 / SCN-022 | Матрица grants; manual/negative/Auto/help → соответствующий результат или объяснение доступа, grant перепроверен | L: fake grant matrix; A/U: настоящий special access UI26/37 и denial | P0; G03, OEM settings handlers |
| TEST-023 / SCN-023 | Overlay grant отсутствует; negative/deny → ошибка, nooverlay, panel доступна; поздний grant без новой команды → noapply | L: отсутствие deferred action; A/U: настоящие settings/re-entry26/37 | P0; G03 |
| TEST-024 / SCN-024 | Grants есть; writefalse/windowfail/revoke/missinghandler → точная ошибка/partial state | L: deterministic fake faults; A: реальный revoke/readback; U: error; отсутствие handler можно моделировать | P0; G01/G02; не обещать rollback настройки ОС |
| TEST-025 / SCN-025 | API31/32/33/37, grant matrix; enable controls → запрос только33+, честная shade availability, manual доступен | A/U: реальные POST dialog/channel; L: граница API32/33 | P0; P04/G03 |
| TEST-026 / SCN-026 | Четыре widgets, Auto128; open/preset25/+10/-10 → panelAuto/цели25/60/40 | A/U: настоящий host/PendingIntent/ОС26/37; L не доказывает host | P1; G05, фиксировать возможную race Auto |
| TEST-027 / SCN-027 | A:2/15/hidden, B:10/100/visible, цель25; updateB/tapA/tapB →27/37, styles сохранены | A/U: два настоящих instances и launcher update; L: независимость per-ID map | P0; G05, регрессия collision |
| TEST-028 / SCN-028 | Старые10/100/false; выбрать1/15/true Save/Cancel → все новые/все прежние; invalidID ничего не пишет | L: атомарный storage contract; A/U: настоящий configure/result/cancel | P1; G05 |
| TEST-029 / SCN-029 | Два instances; deleteA/repeat → все настройки/действияA удалены, B прежний | A: настоящий provider lifecycle/prefs; L: idempotent cleanup; U: launcher removal | P1; G05 |
| TEST-030 / SCN-030 | Legacy keys globaltrue/noID, IDfalse/globaltrue, оба отсутствуют → visible/hidden/hidden | L: migration fixtures, fake storage допустим; A: отдельная signed upgrade установка | P1; подпись/version/host identity неизвестны, TEST-046 |
| TEST-031 / SCN-031 | Fresh manual128 илиAuto; open/dismisshelp/reopen → ОС прежняя, display50илиAuto, nooverlay, help не навязывается | A/U: настоящие prefs/lifecycle/raw26/37 | P0; G07 |
| TEST-032 / SCN-032 | -25,deadline3h,preset75,step2,hiddenrow; recreate через1h без reboot → prefs/цель/deadline прежние; варианты external sync/grant | L: virtual clock/recreation fixture; A/U: настоящий process recreation/persistence/readback | P0; G03/G07; force-stop не recreation, reboot зависит от Q-001 |
| TEST-033 / SCN-033 | Та же операция-25 с deadline3h; redelivery через1h → один overlay/исходный deadline | L: replay/virtual time; A: настоящий restart/redelivery, если воспроизводим, с записью событий ОС | P0; G03, перезапуск не гарантируется |
| TEST-034 / SCN-034 | Timer settings доступны, off3h;30min/24h/invalid45/nochange/Cancel → соответствующая duration, off, no crash; enable приnegative начинает срок | L: допустимые durations; U: настоящий dialog dismissal/input/recreation | P1; Q-002 |
| TEST-035 / SCN-035 | Timer3h, -25at0; negative/duration/positive/Auto/off/externalsyncat1h → ожидаемый deadline либо cancel | L: настоящая timer logic/virtual clock; A: реальное scheduling/cancel без debug shortening | P0; G03 |
| TEST-036 / SCN-036 | Deadline3h; доставка вовремя/4h/cancelled → Auto/nooverlay либо manual25 сохранён; до срока no effect | L: virtual clock/state/stale alarm; A/D: настоящий sleep/Doze32+/37, задержка допустима | P0; G03; реальный30min интервал требует времени, сейчас не запускался |
| TEST-037 / SCN-037 | Events доступны, counter0; четыре заданных timestamps → Auto или нет; boundary1250/1251 сбрасывает последовательность | L: fake clock/events; A/D: настоящие screen events с provenance, не fake hardware assertion | P0; G07, OEM receiver behavior |
| TEST-038 / SCN-038 | Defaultoff, noUsage, WRITE granted; enable/deny → disabled/объяснение, manual работает, нет Accessibility request | A/U: настоящий Usage access/AppOps; L: логика отказа | P1; G04 |
| TEST-039 / SCN-039 | -25/timer/grants/exclusions; detectedGooglePlay → suspend; none/Auto/expiry/-50/25/revoke+exit → правильный restore либо отсутствие окна | L: fake detector только для state; A/D: настоящий detector/transitions отдельно TEST-049 | P0; G04; fake не доказывает распознавание текущего приложения |
| TEST-040 / SCN-040 | Первое help закрыто; reopen → точные объяснения, taps7/10 не меняют право доступа | U: настоящая help/links; editorial review по RULE/P источникам, сеть не нужна | P2; представление легитимного entitlement после Q-002 |
| TEST-041 / SCN-041 | Receiver доступен/нет, цель-25; Share/Cancel → правильный text/plain link, без settings/изменения света, отсутствие receiver объяснено | U/A: настоящий chooser и controlled receiver; injected resolver absence только для fault variant | P2; не обещать доступный listing |
| TEST-042 / SCN-042 | RU/EN, editor25; invalid101 → локальная error/прежняя pref, доступные имена/Auto | U: настоящие locale/Compose semantics, checks34+, ручной screenreader | P1; Q-002 для editor, TEST-050 |
| TEST-043 / SCN-043 | API26/37,target37, offline, grants;25/-25/Auto →63/12+overlay/Auto без ожидания сети | A/U: настоящий offline emulator; D: дисплей; отключённая монетизация не доказывает её будущую политику | P0; G01/G02/G03 |

## Дополнительные проверки и characterization

| TEST | Цель, условия/действия и ожидаемое доказательство | Среда/границы/приоритет/зависимости |
|---|---|---|
| TEST-044 | Review будущей реализации/release UI/manifest: нет принудительного закрытия shade, alarm для crash-loop, частичного custom selector, требования Accessibility, специальных layouts17..20 и secret Premium taps; controls/хранение/исключения сохранены | Review+U, настоящая release-конфигурация; P1. Проверка отсутствия DROP не новое Gherkin поведение. Легитимный Premium зависит от Q-002 |
| TEST-045 | Characterization AS-IS: State floor и helper round, предел alpha, clamp и ошибочный OR, счётчик4событий. Одинаковые входы → фактические outputs данной Legacy версии, не «правильные» TO-BE | Отдельная будущая Legacy harness задача без исправления production; Android stubs допустимы для чистых формул, reflection проверить отдельно. P1/G01/G07; старые tests не истина |
| TEST-046 | Characterization AS-IS: storage/default keys, numeric/sentinel Auto, main/shared/widget prefs, fallback и неполный cleanup. Затем upgrade fixtures → валидные presets/options сохранены, неоднозначный mode не включает overlay | Сначала AS-IS fixtures/harness, затем L migration и A отдельное signed upgrade. P0; подпись/version неизвестны, Premium Q-002. Не обещать grants/widgets после uninstall |
| TEST-047 | Оценить platform feasibility: FGS type/permissions target37, пользовательское действие из background, notification denial, OS stop/force-stop/kill и recreation, inexact non-wakeup alarm, widget resize/RemoteViews memory37 | A/D, настоящие API26/31/33/34/35/37 и OEM-устройства. P0/G03/G05. Boot-контракт RULE-041–RULE-048 принят; его техническая реализуемость ещё проверяется; типы/магазин не архитектура. Always-on не ожидаемый результат |
| TEST-048 | Проверить физический результат защищённых manual0/1/2/3/4/5/6/25/100 и negative-25/-75, поворот, system/protected windows и касания. Для ручных0..5 при снятом overlay отдельно проверить отсутствие полного потемнения/отключения экрана и потери управления из-за исторического дефекта. Зафиксировать видимость и возможность управления; недостаточная защита блокирует поддержку проверяемого устройства | D: реальный дисплей и OEM/API/firmware provenance, readback отдельно; screenshot/fake не доказывают отсутствие аппаратного дефекта. Не обходить floor ради этой проверки. P0/G01/G02/DEC-029; современные устройства и универсальность5 не проверены |
| TEST-049 | Fixed excluded app действительно распознаётся; revoke/locked user/multiwindow/быстрые переходы не дают ложной защиты; Auto/positive не восстанавливают overlay | D/A: реальные UsageStats и доступные fixed packages, без fake detector. P0/G04; если detection непригоден, пересмотреть DEC-018 вместо утверждения проверенной функции |
| TEST-050 | RU/EN, увеличенный системный текст, screenreader labels/focus/errors; Settings и recovery достижимы, основные команды offline. Сверить toolchain без новых latency/coverage gates | U: Compose accessibility34+ и ручной screenreader; review catalog/TESTING/API26/37; P1, настоящий UI/locale |
| TEST-051 | Готовым официальным/поддерживаемым Gherkin parser проверить6Feature/Rule/ScenarioOutline/Examples и tags, затем сверить ID с Kotlin checks; это будущая document validation, не собственный parser | Только последующая задача после решения нужности/совместимости dependency, вне Android deps без автоматической установки; P1. Сейчас ручнаяsyntaxcheck, неpassedparser |
| TEST-052 | Оценить реализуемость будущей индивидуальной диагностики DEC-030: сохранение предыдущего доступного mode/raw/overlay; возврат при отсутствии подтверждения, недоступном UI, отмене, уходе приложения, сбое/остановке процесса, задержке ОС и отзыве grants. Сначала доказать восстановление на моделируемом отказе и безопасном контрольном уровне; ниже floor не переходить до отдельного решения и проверенного recovery. Положительный результат не снижает default автоматически | Только план исследовательской проверки L/A/D, не acceptance утверждённой функции. Fake clock/process fault подтверждают лишь логику; реальное восстановление требует Android/OEM proof и отдельной процедуры. P0 как gate будущего эксперимента; duration, семантика0, mechanism, разрешения/магазин и calibration policy не выбраны. Нового RULE/SCN нет |

## Монетизация после ответа пользователя —2026-10-05

Q-002 закрыт, RULE-036–RULE-040/SCN-044–SCN-050 приняты в указанном объёме.
Тестовые fixtures не подтверждают наличие реального платежа. На этом этапе было59 TEST;
добавленные ниже семь — планы, а не написанные/пройденные тесты.

| TEST / SCN | Проверка и ожидаемый результат | Среда и граница доказательства |
|---|---|---|
| TEST-053 / SCN-044 | Существующий действительный premium_upgrade; автоматический query и ручной Restore после update/reinstall/нового устройства → прежние права без новой оплаты; отдельно pending, неподтверждённая покупка, wrong account/refund и сохранение SKU | L: реальные будущие правила прав/fake responses; A/U: Play test environment и подписанное совместимое обновление. Настоящее старое право требует подходящего test account/артефакта. Недоступность магазина фиксируется, fake-only не закрывает G06. P0 |
| TEST-054 / SCN-045 | Ранее подтверждённое действительное право; временная network/Billing ошибка → явная ошибка, право не стёрто только из-за отказа, свет не меняется. Отдельно successful no-purchase/revocation не путать с unknown | L: deterministic faults/cache provenance; U: error/restore actions; A: реальные reconnect/offline/account cases. Старый IS_PREMIUM не считать доказательством. P0 |
| TEST-055 / SCN-046 | Paid/game/none → прежние editor/timer/visibility/notification gates; help/Settings/restore/основные команды доступны. Восстановление и оплата не применяют новую световую команду | L: матрица прав и gates; U: реальные экраны и правила controls. P1 |
| TEST-056 / SCN-047 | Установленная игра/promo flag off/no paid → game право, без ложного paid restore. Отдельно remove game+paid → сохранение paid; neither → прежние ограничения | L: независимые основания; A/U: package identity/visibility/install-remove реального пакета или контролируемого fixture с явной границей. Fake не доказывает внешний listing. P1 |
| TEST-057 / SCN-048 | Settings/editor, none/paid/game и loaded/error → прежний banner или его отсутствие, свет неизменен. SDK lifecycle и реальные загрузки отдельно от fake | L/U: состояния и размещение; A: AdMob test ad units и допустимый аккаунт. Production revenue не проверяется показом тестового баннера; запросы SDK/consent требуют отдельного review. P1 |
| TEST-058 / SCN-049 | Первый production-профиль Play/AdMob: реальные заявленные provider dependencies, старый product ID/restore, отсутствие новых store offers/subscription. Ошибка региональной доступности не выдаётся за успех | Review dependency graph/merged manifest/профиля; A/U: test purchase/ad integration. Huawei/RuStore SDK не требуются; доступность аккаунта — операционная проверка G06 перед реальными испытаниями/выпуском, не условие выбора архитектуры. P0 |
| TEST-059 / SCN-050 | Недоступная subscription capability → no offer/no payment flow/no fake rights; fake active/expired/pending применяется только в тестовом окружении будущего общего контракта | L: запрет выдачи прав unavailable provider; U: production offers; review release dependency/source separation. Полная подписка/backend не реализуются этим планом. P1 |

## Принятые части reboot —2026-10-06

RULE-041–RULE-048 приняты пользователем; Q-001 закрыт2026-10-08. Техническая реализуемость boot ещё не проверена.
Теперь63 TEST; новые четыре строки — план проверки, не результаты выполнения.

| TEST / SCN | Проверка и ожидаемый результат | Среда и граница доказательства |
|---|---|---|
| TEST-060 / SCN-051 | Last negative/restore on/valid deadline: до первой разблокировки overlay отсутствует; после unlock при разрешённой обработке возвращается без открытия BCD. Повтор unlock/boot event не создаёт второе окно и не rearm. Отдельно grants/exclusions/platform refusal | L: детерминированные boot/unlock/grant события; A/D: настоящий reboot с PIN и без настроенной блокировки, реальный overlay, API26/37 и границы FGS. Fake не доказывает доставку ОС. P0/G03/G07 |
| TEST-061 / SCN-052 | Last negative/restore default off: reboot и первая разблокировка не возвращают overlay. Отдельно Auto/«Заданная яркость» не восстанавливают старый overlay; пользовательский явный выбор сохраняется при обновлении default | L/U: сохранённая настройка и матрица политик; A: reboot/unlock с настоящими grants. Параметры системной записи проверяются после отдельного решения. P0 |
| TEST-062 / SCN-053 | Start13:00+3h; reboot14:00 и15:00, unlock до16:00 → исходный end16:00. Время выключения/загрузки/ожидания учитывается; повторные события не продлевают. Отменённый старый alarm не меняет новую цель/boot policy | L: clock/boot identity/persistence и несколько reboot fixtures; A: настоящий reboot и сохранение срока, доставка alarm отдельно. Точность секунды и непрерывная работа не обещаются. Изменение часов/недостоверный срок — принятое правило RULE-046 с ещё не проверенным алгоритмом. P0/G03/G07 |
| TEST-063 / SCN-054 | Start13:00+3h; первая доступная обработка/unlock16:10 → истёкший overlay не создаётся даже временно и не получает новый срок. Отдельно устройство выключено в16:00: expiry учитывается при следующей обработке | L: проверка expiry до эффекта, recording actions; A/D: реальная отложенная обработка и отсутствие краткого затемнения. Fake-only не подтверждает безопасный OEM результат. P0 |

## Минимальный будущий acceptance driver

Достаточен тестовый driver с действиями выбрать numeric/Auto/step, изменить доступную настройку, открыть/закрыть/recreate UI и прочитать цель/ошибку/observed state. Для L — deterministic события clock/grants/externalraw/excludedpackage и recording fake внешних действий. Для A/U — реальные UI действия, системный readback mode/raw/grants, видимость notice/widget, overlay/touch нижнего приложения. Нужны cleanup исходных системных настроек и сохранение provenance: API/device,real/fake,начальное/конечное состояние,SCN ID.

Это описание тестовой границы, не проектирование внутренних классов/слоёв приложения. Не вводятся новые Android adapter/interface names как production requirements. Любой fake-clock test имеет отдельный real alarm proof; fake adapter accepting write не доказывает применение ОС. Для injected failures отметить, что они моделируют ошибку, а не характеризуют реальную ОС.

Минимальная связь `.feature` с Kotlin может быть обычными JUnit-тестами с явными SCN-ID в имени/metadata и review/check соответствия к документам. Это не автоматическое исполнение Gherkin; Outline rows должны быть перечислены в parameterized data, skipped/failing rows не скрывать. Cucumber/другая интеграция — последующая задача: оценить совместимость Jupiter JVM и JUnit4 instrumentation, Compose/Android runner, стоимость glue и необходимость. Никакие библиотеки сейчас не установлены.

## Согласование с новым проектом и порядок дальнейшей работы

Сверено с `BrightnessControlDimmer/TESTING.md`, `app/build.gradle.kts`, `gradle/libs.versions.toml`, AGENTS/QUALITY/MODERNIZATION на HEAD `87ef042e62c7a671fa4babfc932d27b55086efb1`: JVM Jupiter безVintage; AndroidJUnit4/AndroidJUnitRunner/ActivityScenario, UIAutomator2.4.0; accessibility34+; min26/target37/JDK21; Kover только JVM, без coverage gate. Template tests не проверяют свет. CLI/CI команды здесь не выполнялись.

Порядок: после закрытия Q-001/Q-002 провести review остальных18 решений, включая DEC-001 о шкале/reflection, сохранив историю → оценить G03/G04/G06/platform/store feasibility → минимальные проверки чистой логики с SCN и characterization fixtures → необходимые реальные Android/UI/D/store проверки. Независимую логику можно проверять до завершения platform feasibility. Порядок не требует написать все unit-тесты перед любой acceptance-проверкой.

Использовать dedicated devices без существующей Legacy установки, одинаковый applicationId может уничтожить чужие данные; migration только на отдельной копии. Выбирать `ANDROID_SERIAL`, не AGP `--serial`; не запускать конкурирующие Gradle builds. После будущих запусков проверять непустые XML results/failed/skipped, не только exitcode; reports оставить по TESTING.md. Подписи/productionversion/магазин/billinginfra решить в дальнейшей работе. Настоящий test implementation и все результаты ещё отсутствуют.

## Граница будущей диагностики устройства

Штатные acceptance TEST-003/TEST-048 проверяют сохранённый floor и не устанавливают опасные значения ниже него. Идея пользователя о проверке0..4 с автоматическим возвратом выделена в TEST-052/DEC-030: это исследовательский gate отдельной будущей задачи. До доказательства восстановления без читаемого экрана нельзя заявлять опыт безопасным или подменять его обычным in-process timer. Не установлены длительность подтверждения и числовая команда ОС для тестового0. Отсутствие сообщения пользователя не означает успешную видимость.

Платформенные основания задержек/ограничений перечислены в [source-evidence](source-evidence.md#историческое-основание-защитного-минимума). Код, harness, автоматическая проверка устройства и executable tests сейчас не созданы.


## Принятые параметры восстановления —2026-10-07

Теперь68 TEST; добавлены пять планируемых проверок. Ни одна не реализована/не запущена.

| TEST / SCN | Проверяемое поведение | Среда и ограничения |
|---|---|---|
| TEST-064 / SCN-055 | Last-45/restore on-off использует один процентный minimum raw12, без отдельного10; on допускает старый overlay только после unlock/при валидном сроке. Дополнительно Last3→12 и positive выше5 по обычной формуле | L: обе строки Outline/границы; A/D: режим/raw/действительное окно на isolated device, без намеренной установки ниже floor. P0 |
| TEST-065 / SCN-056 | Fresh boot policy Auto/fixed setting25; установка/первое открытие/редактирование не меняют свет. Fixed40→raw102 после reboot, значение сохраняется. Диапазон5..100/шаг1,4/101 отклоняются; fixed5→12 | L: storage/default/валидация; A/U: settings/reboot/readback, отсутствие overlay. Initial25 не перезаписывает сохранённое40 |
| TEST-066 / SCN-057 | Ранняя защита manual raw1/11→12, raw12/77 unchanged; после unlock fixed40→102. Дополнительно Auto unchanged, read/grant failure не трактовать как manual0, повтор callback не меняет принятую новую цель | L: все строки с fake OS, особенно ниже floor. A/D: доступность Direct Boot/read/write только на заранее допустимых безопасных состояниях; не устанавливать raw1/11 на физическом устройстве для проверки. Проверка не доказывает восстановление с первого кадра. P0/G03/G07 |
| TEST-067 / SCN-058 | Повреждённый/неполный срок либо надёжно установленная недостоверность времени→не создавать old overlay/не rearm. При same boot календарный скачок не сдвигает монотонный интервал; reboot нельзя сравнивать с elapsedRealtime предыдущей загрузки. Не требовать детекции всех изменений при выключении | L: fake clock/storage fault, recording effects; A: только необходимые реальные clock/reboot интеграции на isolated environment. UI не содержит перечень этих редких механизмов. P0 |
| TEST-068 / SCN-059 | Смена только timezone не отменяет достоверный срок и не меняет интервал3h; новый формат отображения конца не является новым deadline | L: clock/timezone state; A: системная timezone/reboot при достоверном сохранённом сроке. Без сетевой зависимости основных команд |

## Принятый отказ и частичное применение —2026-10-08

| TEST / SCN | Проверяемое поведение | Среда и ограничения |
|---|---|---|
| TEST-069 / SCN-060 | При отказе записи, отзыве grant между записями или partial mode/value не добавлять boot overlay; учесть доступные observed mode/raw, не объявлять полный успех. При недоступном readback результат неподтверждён, не raw0. Нет бесконечных повторов, обещаний атомарности/rollback или технического перечня в UI | L: три Outline rows, injected write/grant/read faults, запись эффектов и отсутствие retry loop; A/U: реальный grant/readback и короткое состояние отказа на isolated device. Без намеренной установки ниже защитного минимума. Резервные25 Auto не приняты этим тестом. Всего69 TEST; это план, не исполнение |

## Принятый резерв после отказа Auto —2026-10-08

| TEST / SCN | Проверяемое поведение | Среда и ограничения |
|---|---|---|
| TEST-070 / SCN-061 | При установленном отказе актуальной Auto boot цели и доступной manual записи одна резервная попытка25/raw63 без overlay. Сохранённая policy Auto не меняется, UI сообщает фактический резерв. Успех записи не доказывает физическую яркость | L: fake Auto failure/manual success/readback и recording actions; A/U: настоящий manual mode/raw и краткое состояние результата на isolated device. Не требовать несуществующего универсального OEM detector |
| TEST-071 / SCN-062 | НетWRITE/неизвестный результат Auto/новая цель40→нет reserve; reserve write failure→одна отказавшая попытка, без цикла/overlay/ложного успеха. Неизвестная поддержка не блокирует попытку Auto, задержка unlock не запускает reserve; repeated callback одной операции не умножает reserve | L: четыре Outline rows, fake permissions/read faults/stale events, число эффектов; A: grants/readback/lifecycle при технической реализуемости. Всего71 TEST; это план, не запуск |

## Статус согласования —2026-10-08

TEST-010–TEST-011 (внешняя синхронизация) и TEST-031 (обычное открытие)
проверяют принятое пользователем поведение. В TEST-031 учитывать повторное
открытие с действующим overlay (не снимать его и не менять deadline) и с уже
прекратившимся (не отображать старую цель как работающий overlay).
TEST-032/TEST-046 (recreation/миграция) и TEST-033/TEST-047 (повтордоставка)
этим ответом не подтверждены. Все перечисленные TEST запланированы, не выполнены.

## Приняты opacity, шаг Auto и повтордоставка —2026-10-08

TEST-004–TEST-005, TEST-007–TEST-008 и TEST-033 относятся к принятому
поведению. Общий TEST-047 не подтверждён целиком (он содержит другие функции).
TEST-032/TEST-046 и вариант миграции old negative presets ещё на review.
DEC-015/часть TEST-044 об отсутствии crash restart отдельно не подтверждены.
Проверки Android/OEM не запускались; реальные ограничения и race остаются
техническими проверками плана, не новыми вопросами продукта.

## Приняты remaining recovery/upgrade —2026-10-09

TEST-032 и часть TEST-046 о сохранении prefs/recovery теперь относятся к
принятому поведению; часть TEST-044 об отсутствии forced crash restart тоже.
Для signed upgrade проверить сохранённые negative presets численно, отсутствие
автоприменения старого затемнения и однократность краткого сообщения о его силе.
Невалидные/неоднозначные prefs не включают overlay. Испытания не запускались.

# Покрытие исследования и отдельная проверка

[Глоссарий: термины и обозначения](glossary.md). Местные пояснения сохраняют тот же смысл.

Версия и локальная рабочая копия: [workflow-progress](workflow-progress.md). Первый проход: карта репозитория→manifest→production/resources→prefs→входы→общий State→побочные эффекты→tests/документация. Второй проход отдельно: обратный поиск callers/manifest/вариантов, сравнение формул и defaults, восстановление control/state chains, исправление группировки. Запуск приложения/сборки/тестов не выполнялся.

Группы ниже определяются путями от Legacy root, включая все файлы соответствующего типа. «Просмотрено» означает просмотр содержательного назначения, символов/связей и относящихся к поведению фрагментов; не построчную экспертизу каждого вспомогательного метода.

| Область/файлы | Статус | Объём и результат |
|---|---|---|
| Root settings.gradle/build.gradle/gradle.properties, wrapper properties; build.gradle/proguard всех трёх модулей | просмотрено | Build variants, SDK, зависимости и auxiliary modules; Amazon source не configured variant |
| BrightnessControlDimmer/src/main/AndroidManifest.xml и manifests HumbleLogger/icon generator | просмотрено | Activities/services/receivers/permissions/queries/application; commented Accessibility; no provider/shortcut entry |
| BrightnessControlDimmer/src/main/java/**: utils, service, screen/brightness, screen/overlay | просмотрено | Все классы по назначению и callers; ключевые State/Service/Utils/Overlay методы и observer/alarm/error/lifecycle цепочки подробно |
| Та же production группа: broadcasts, app/appstatewatcher, app/devicekeyswatcher, app/persistence, exceptions | просмотрено | Boot/screen events, usage checks, Accessibility candidate, storage, forced restart и callbacks |
| Та же группа: ui/**, widget/** | просмотрено | Main/editor/settings/permissions/help/Premium; четыре providers/config activities; все resource onClick и service intents сверены |
| Та же группа: billing/** включая obsolete, ads/**, remoteconfig/**, crashlytics/** | просмотрено | Active purchase/restore/grant vs disconnected handlers; ad lifecycle/remote flag/telemetry. Серверы/SDK бинарники не исследовались как реализация BCD |
| BrightnessControlDimmer/src/{debug,googleplay,amazon}/** | просмотрено | Store constants и Amazon layout; реальная выбираемость по build.gradle |
| BrightnessControlDimmer/src/main/res/{layout,menu,xml,values,values-ru}/** | просмотрено | Layout controls/onClick, all preferences/defaults, widget descriptors, strings/keys/help/error, styles; XML intent и implementation отделены |
| Остальные текстовые XML res: drawable, anim, dimens qualifiers, mipmap-anydpi | просмотрено | Назначение/ссылки: opacity resources, selectors, launcher, анимация/размеры; не отдельные пользовательские возможности |
| BrightnessControlDimmer/src/androidTest/** | просмотрено | Suites и все классы: список методов, fixtures/целевые assertions по яркости/prefs/UI/boot; placeholders/устаревшие assumptions. Не runtime и не доказательство актуальной compilability |
| HumbleLogger/src/{main,test,androidTest}/**, notification_small_icon_generator/src/** | просмотрено | Логирование, генерация numeric bitmap; auxiliary manifests/resources и template tests; не приложение BCD |
| devscripts/*.bat, misc/*.py/*.xml, googleplay/output.json, local output-metadata.json | просмотрено | Dev emulator operations/opacity helper/findbugs/build metadata, не новые функции приложения |
| README/документы/комментарии; res/raw/navigation поиск | просмотрено | Существенного самостоятельного README поведения не найдено; комментарии и strings учтены, значимых raw/navigation файлов в карте не найдено |
| google-services.json | просмотрено | Назначение Firebase конфигурации; идентификаторы/ключи не копируются в документы |
| PNG/JPG/WebP/GIF/launcher/numeric assets, local AAR/JAR, wrapper JAR | исключено с обоснованием | Бинарные изображения/библиотеки, не authored behavioral source; numeric asset map/generator и вызовы проверены, визуальная/SDK реализация не декомпилирована |
| .git/**, .idea/**, .iml, .gradle/**, **/build/**, APK/AAB/подписи, Desktop.ini | исключено с обоснованием | История/IDE/cache/generated/машинные метаданные; HEAD/status и configuration происхождение проверены отдельно; секреты и binary outputs не переносились |
| Новый проект AGENTS.md, MODERNIZATION.md, TESTING.md, QUALITY.md, app/build.gradle.kts, libs.versions.toml и template tests | просмотрено | Только ограничения и уже существующая infrastructure; template/archived prototype не требования поведения |

## Результаты нормализации — второй проход

1. Прослежены main/widget/notification/timer/boot входы к одному State. Отдельный Auto sentinel не делает сохранённый numeric режим достоверным. LB-027 оставлен MEDIUM из-за конкурирующих путей; runtime не заменён удобной трактовкой.
2. Проверен active integer floor вместо helper round и устаревших tests raw0. LB-002 HIGH именно для active request, не физического результата.
3. Проверены manifest и debug входы: выбор списка LB-043 переименован в partial, а не dead; secret help LB-050 достижим через XML, не отнесён к deadcode. Accessibility LB-044 кандидат недостижимости Android binding, а не всех методов класса.
4. Notification/default XML не принят за кодовый набор; widget step default10 отделён от unused constant5. Per-widget collision LB-024 — INFERRED/MEDIUM, не выполненный эксперимент.
5. Удалены из продуктовой группировки technical logger/generator/obsolete handler/workaround thread. У CAP/FEAT/LB нет номера, выведенного из filenames; объединений/удалений уже опубликованных ID не было, таблица перенумерации не требуется.
6. У watcher отдельно подтверждён fixed list и отдельно недостаточное основание «реальный foreground»: LB-041 MEDIUM. Notification/show icon/FGS и runtime permission33 отделены от обещания бесконечного background.
7. Test suites, declared components, onClick и external/widget/boot intents перепроверены. Кодовые API checks сопоставлены с P01–P09. Скрытые варианты/внешние приложения и OEM callbacks статически не исключены полностью.
8. Заключительная сверка точных символов исправила сокращённые описательные имена методов в source-evidence на настоящие `fromPercentToSystemBrightness`, `updateBackgroundAlpha`, `queryInAppPurchaseStatus` и другие. Изменилось качество ссылок, не confidence фактов. У LB-019 уточнён второй вход notification request — `PermissionConfigurationActivity.runPermissionsCheck`, помимо icon checkbox. В Share обнаружен параметр ah; его отсутствие в TO-BE явно записано как CHANGE в DEC-026.

Первый и второй проходы выполнены до первой публикации документов; они сохранены одним законченным коммитом. Исправления относятся к исследовательским выводам, не к исходникам. Confidence не повышался из-за будущих продуктовых решений.

## Открытые discovery/runtime gaps

| Gap | Статус | Что требуется далее |
|---|---|---|
| G01 raw/mode write success, OEM scale/physical screen, external observers | требует дальнейшей проверки | Изолированные реальные устройства; отдельно readback ОС и физический эффект; characterization формул |
| G02 Overlay params.alpha×Paint alpha, touch31+, system bars, rotation/multiwindow | требует дальнейшей проверки | Реальные окна/касания API26/31/37, OEM; не screenshot вместо luminance |
| G03 Background/FGS/boot/force-stop/alarm/permission UI target37 | требует дальнейшей проверки | Оценка законного FGS type/Play constraints и platform tests; без обещания always-on |
| G04 UsageStats latest package vs visible; locked user/excluded restore | требует дальнейшей проверки | Испытания сценариев смены приложений; нельзя утверждать отсутствие leakage по polling |
| G05 Widgets pending intent identity/config cancel/delete/launcher hosts | требует дальнейшей проверки | Два instances/разные шаги; разные launcher, API37 memory limits |
| G06 Billing entitlement/signature/legacy migration/ads/RemoteConfig | требует дальнейшей проверки | Продуктовые решения, sandbox store и актуальная compatibility; внешние конфигурации недоступны из исходников |
| G07 Recovery gesture/first run/pause/Auto stored lifecycle | требует дальнейшей проверки | Событийные characterization и real Android lifecycle; версия тестов может не собираться |
| G08 Local binary AAR/внешние SDK/исторические APK | требует дальнейшей проверки | Только если будущая задача потребует дополнительных доказательств; не декомпилированы, не объявлены полностью исследованными |

Количество найденных LB не доказывает полноту. Неисследованные бинарные/внешние реализации и порядок реальных событий остаются явно ограниченной областью выводов.

## Дополнительная сверка защитного порога

После голосового уточнения пользователя2026-10-04 просмотрены `Const.java:54–60` и active `BrightnessState.fromPercentToSystemBrightness`/`MaxMinBrightness`: комментарий о полном потемнении устройств теперь явно связан с LB-002/LB-003, DEC-029 и TEST-048. Кодовый минимум и физический результат разведены; confidence не меняется. Современные устройства не проверены. Для будущего recovery-кандидата DEC-030 повторно просмотрены официальные ограничения alarms/background FGS; TEST-052 оставляет реализуемость открытой. Никакие новые области не объявлены runtime-валидированными.

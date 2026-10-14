Продолжи подготовку полного переписывания Brightness Control Dimmer по этой передаче. Отвечай по-русски. Начни с конкретного плана MVVM: сначала прочитай AGENTS.md материалов, актуальные решения, техническую оценку и оставшиеся этапы, затем подготовь план состояния/эффектов, миграции, макетов и небольших этапов с ранними проверками. Не открывай заново reboot, коммерческую политику и группы1–7; не повторяй завершённое исследование без новой причины. Не начинай реализацию, обновление зависимостей, архивирование, создание веток или работу агентами. Представь план на согласование; необходимые вопросы задай обычным текстом в чате и дождись ответа пользователя.

# Handoff summary: подготовка BCD — план MVVM, 2026-10-14

## 1. Текущая цель

Подготовить контролируемый эксперимент полного переписывания Legacy Brightness
Control & Dimmer в существующем Kotlin/Compose проекте с MVVM. Разрешены
исследование, согласование поведения, документация и отдельные проверенные
коммиты материалов. Код переписывания не реализуется.

**Точка продолжения — подготовить и согласовать конкретный план MVVM с макетами
и ранними проверками.** После плана нужны опорные версии и проверенный архив
всех трёх папок, затем отдельное поручение выполнять эксперимент. До этого
не создавать реализации или проверочные Android-прототипы.

## 2. Текущее состояние

- Q-001/reboot, Q-002/коммерческая политика и **все группы1–7 закрыты**.
- 30 DEC: **30 CONFIRMED_BY_USER / 0 ADOPTED_BY_AGENT / 0 PENDING_USER**,
  каждый в указанном объёме. DEC-030 подтверждает только идею исследования,
  не готовую калибровку и не разрешение опасных опытов.
- 48 RULE / 62 SCN / 71 запланированный TEST; стабильные ID сохранены.
- Группа7 принята2026-10-14: «Принимаем 1-13». Пользователь отдельно подтвердил
  прекращение поддержки старых Android и использование уже подготовленных зависимостей.
- Последнее рабочее поручение: «Переходи к следующему шагу» — выполнена
  оценка технической реализуемости по исходникам и первичным документам.
  **Это не Android/device/store верификация.** Публичные пути/кандидаты и ранние
  проверки сохранены; G01–G08 и BUG-001–004 не закрыты.
- Макеты, конкретный FGS manifest/lifetime, алгоритм clocks, storage schema,
  перенос противоречивых каналов/неоднозначного права ещё не выбраны.

Три папки — независимые Git-репозитории; vault не отдельный репозиторий.
Опорные версии ниже проверены перед этой передачей; коммит самой передачи
будет отдельным следующим коммитом материалов.

| Репозиторий | Абсолютный путь | Проверенная опорная версия и назначение |
|---|---|---|
| Материалы | D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials | 53254d5383dcd3076fd1fa3838ee878359d9a2e9, main: завершённая оценка по источникам и текущие этапы |
| Legacy | D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerLegacy | cd7696cd04705fa48a2c115addf98ae6191bfdd9, develop: версия исходников E/LB |
| Новый Android-проект | D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmer | 83fa6da3a61fdcb8301e97396f0034e7ee07f270, codex/project-modernization: подготовленный template и обновлённая диагностика device CI |

Не переносить старую точку продолжения группы7 из предыдущей передачи.
Перед правками проверить Git заново; ранее в Legacy замечены пользовательские
неотслеживаемые BrightnessControlDimmer/googleplay/ и Desktop.ini — не удалять/не включать.

## 3. Принятый контекст и ограничения

### Свет, открытие и восстановление

- Целая цель[-75,100], Auto отдельно. Default системной шкалы255; manual raw=
  floor(255*max(p,5)/100), минимум12. Не процент физической яркости.
  OEM совместимость обязательна; reflection Legacy имел историческое назначение,
  способ совместимости ещё не выбран. Floor5 не универсальная аппаратная гарантия.
- Единая opacity отрицательного значения: alpha=round(abs(p)*255/100)/255.
  Old negative presets переносить численно, без автоприменения, с однократным
  кратким сообщением об изменении силы; двойное Legacy alpha31+ не сохраняется.
- +/- из Auto использует актуальный raw, не старую numeric цель. Sync=true:
  внешнее изменение выигрывает, снимает overlay/таймер; sync=false не отыгрывает
  ОС обратно. Own-write echo отличать от внешнего изменения.
- Первое/повторное открытие и навигация не команды света. Допустимое recreation
  сохраняет актуальную сессию и исходный срок без дубликатов/оживления overdue.
  Force-stop не преодолевать; forced crash restart/alarm+kill удаляется.
- Boot policies: Auto default, Last, fixed5..100/initial25. Overlay в Last
  опционально/defaultoff, только после первого unlock. Исходный срок проходит
  через reboot без паузы/rearm; недостоверный срок не восстанавливает прежний dim.
  При доступной ранней обработке/WRITE достоверный manual raw<12 поднимается
  до12 в default255; другие raw/Auto guard не меняет. Первого кадра не гарантировать.
- Только при установленном отказе актуальной boot Auto цели и доступной manual
  записи — одна резервная попытка25/raw63 без overlay, без изменения policy Auto.
  Unknown не отказ, новая цель отменяет старый резерв; не retry loop и не
  универсальный fallback любой Auto команды. RULE-041–048.

### Таймер и аварийное снятие

- Defaultoff, duration3h;30min..24h шаг30min. Enabled настройка и активный срок различаются.
- Каждая новая принятая negative команда, включая то же число/slider/шаг,
  начинает полную duration заново. Повтордоставка одной операции — не новая команда.
- Save изменённой duration при active timer начинает срок от Save;
  unchanged Save/Cancel/Back/закрытие не rearm. Enable при negative начинает
  срок сейчас; disable отменяет срок, сохраняя dim/duration.
- Nonnegative/Auto/external sync отменяют срок, но сохраняют enabled.
  Исключение не пауза/rearm. При доступной обработке expiry снять overlay,
  запросить Auto; stale/cancelled/replaced event не меняет новую цель.
- Non-wakeup/inexact, без нового exact-alarm grant; задержка во сне допустима.
- Четыре полученных SCREEN_ON/OFF с соседними интервалами<=1250ms снимают
  только актуальную negative сессию и запрашивают Auto; gap>1250ms reset.
  Manual25/nonnegative/Auto сохраняются. Не любые4 физических нажатия за5s.
- Nullable риск старого timer dialog — статический LB-035/E23, crash не воспроизведён.
  Новые Save/Cancel/Back без движения slider/callback безопасны, duration/deadline сохраняются.

### Разрешения, быстрые поверхности, исключения и коммерческая политика

- Manual/Auto требуют WRITE_SETTINGS, negative дополнительно overlay.
  Main/settings/help доступны без grants; поздний grant не выполняет старую команду.
  Missing settings Activity — объяснение/доступный возврат без crash/ложного success.
  Фон сам не открывает permission UI. Legacy Android8 grant delay не обязательная UI норма.
- Быстрые notification controls defaultoff, отдельно от обязательного notice
  длительного service. Toggle не меняет свет/deadline. POST только33+ по intent
  включить controls; denial сам не запрещает допустимый свет. Stable channel,
  initial HIGH без sound/vibration, user settings сохраняются; перенос старых
  каналов ещё не выбран. Принудительное закрытие системного shade удаляется.
- Четыре home widgets: value открывает Main без света; controls использует
  общие с notification4 presets/шаг; horizontal/vertical +/- независимы по ID.
  Отдельный widget step1..50/default10, opacity оформления15..100/шаг5/default100,
  Auto defaultfalse. Save всех параметров вместе; Cancel/Back без записи;
  Delete убирает все настройки/действия ID, позднее старое действие не меняет свет.
  Auto migration: explicit per-ID >legacy global >false. Upgrade/SCREEN_ON не preset.
- Exclusions defaultoff, optional Usage access, только fixed5:
  com.android.vending, com.google.android.gm, com.android.packageinstaller,
  com.google.android.apps.walletnfcrel, com.google.android.gms.
  Без custom selector/Accessibility detector. Suspend только negative overlay,
  сохраняя цель/raw/deadline; unknown не exit и не повод снять visible overlay.
  Установленный revoke Usage отключает функцию без auto restore; поздний grant
  не enable. Explicitoff допускает актуальный overlay. Истёкшую сессию не оживлять.
- Первый выпуск Google Play/Play Billing/AdMob, бессрочный Premium, прежние paid
  права/restore/gates и game promo сохраняются. Denial/unknown не стирает paid право;
  promo не покупка. Подписка только будущий задел, Huawei/RuStore не обязательны.
  Новая аналитика/Crashlytics/interstitial/рекламные паузы не приняты.
- Help доступна/прерывается Back; форма первого предложения/макет не выбраны.
  Не обещать неубиваемость/исправление unknown багов; hidden Premium taps удаляются
  для всех, paid rights сохраняются. Share text/plain/Play package URL без ah,
  без prefs/света/файлов/автоотправки. Cancel не error; launch failure BCD отличается
  от ошибки receiver. RU/полный EN fallback, цифровая клавиатура, доступные labels/errors.

### Все13 случаев группы7 приняты

1. Clamp шага на[-75,100] без wrap. Повтор-75 новой командой rearm по принятому таймеру.
2. Main8 defaults[-75,-50,-25,0,25,50,75,100]/step5; shared4[-75,-25,25,75]/step5.
3. Save main25→75/shared25→35 меняет настройку/labels, не текущий свет50;
   применяется только дальнейшим tap. Legacy resume мог повторять прежний свет.
4. Независимые main/shared steps1..50: сохранить2/10, от25 plusmain/plusshared/minusmain→27/37/35.
5. Editor preset[-75,100], step[1,50]; invalid-76/101/0/51 без записи/скрытого clamp.
   ABC/дроби не обычные достижимые примеры Legacy numberSigned.
6. Cancel/Back/пустой Ok без записи. Editor15:59/expiry16:00/Cancel16:01 не оживляет dim.
7. Slider запрашивает значение при перемещении до release; программное отражение не команда.
8. Close on select defaultoff, приon после успешного preset/Auto; slider/+/− не закрывают Main.
9. При установленном отказе собственная панель остаётся открытой — отличие Legacy,
   поэтому DEC-007 теперь CHANGE. Partial не полный успех; форма сообщения не выбрана.
10. Visibility defaultsalltrue; row3 скрывает Auto/+/−; hidecheckbox не сбрасывает значения.
    Settings всегда доступны; hint при отсутствии основных controls и восстановление черезSettings.
11. Launcher/valuewidget/notification Main показывают одну панель; Back не выключает допустимую
    сессию/deadline, reopen не rearm. LaunchMode/внешний вход из незавершённого editor не выбраны.
12. Min26/compile-target37: прекращена поддержкаAPI21–25 новым выпуском;
    используются уже подготовленные зависимости, нового обновления нет.
13. Manual/negative/Auto не ждут сети/Billing/Ads; offline не отсутствие сети во всём приложении.

## 4. Артефакты и порядок чтения

Пути ниже относительны абсолютному корню материалов из таблицы, если не указано иначе.
Читать отдельно; не объединять канонические документы вместо оригиналов.

1. AGENTS.md — правила объяснения/истории/глоссария/коммитов и границы.
2. BCD-obsidian-vault/docs/specification/behavior-decisions.md — текущие30/0/0,
   оговорённый объём решений; ранние статусы ниже исторические.
3. BCD-obsidian-vault/docs/specification/technical-feasibility-assessment.md —
   главный новый отчёт: источники/кандидаты/ограничения, раздел9 ранних проверок,
   последний раздел требований к плану MVVM. Изменён в53254d5.
4. BCD-obsidian-vault/docs/workflows/full-rewrite-preparation.md — текущие оставшиеся
   этапы2026-10-14; далее пункт2, конкретный план. Изменён в53254d5.
5. BCD-obsidian-vault/docs/specification/product-specification.md — продуктовый контракт;
   отдельно glossary.md, test-plan.md, traceability.md, discovery-coverage.md в той же папке.
6. BCD-obsidian-vault/docs/specification/source-evidence.md — E/P, комментарии/история
   обходов; последняя оценка2026-10-14 не меняет runtime confidence Legacy.
   Отдельно legacy-behavior-inventory.md — AS-IS, не утверждённая новая архитектура.
7. BCD-obsidian-vault/docs/specification/features/brightness-and-dimming.md,
   controls-and-widgets.md, state-and-recovery.md, permissions-and-exclusions.md,
   monetization.md, help-and-constraints.md — читать как6 отдельных нормативных текстов.
8. BCD-obsidian-vault/features/brightness-and-dimming.feature,
   controls-and-widgets.feature, state-and-recovery.feature, permissions-and-exclusions.feature,
   monetization.feature, help-and-constraints.feature — декларативные SCN, не executed acceptance.
9. BCD-obsidian-vault/docs/workflows/group7-controls-and-platform-review.md —
   все13 принятых случаев, six-part формат и связи; group6-help-sharing-and-accessibility-review.md,
   group5-widgets-and-exclusions-review.md, group4-notifications-and-permissions-review.md рядом;
   timer-and-safety-cases.md в specification —18 принятых случаев группы3.
10. BCD-obsidian-vault/docs/bugs/bug-register.md —4 открытых сообщения;
    specification/widget-device-evidence.md и notification-device-evidence.md —
    реальные справочные screenshots Legacy, не выбранные новые макеты.
11. BCD-obsidian-vault/docs/workflows/monetization-provider-research.md — прежняя
    политика/провайдеры; новая техническая оценка уточняет текущие SDK API, не интегрирует их.
12. В новом Android-проекте: AGENTS.md, MODERNIZATION.md, TESTING.md, QUALITY.md,
    app/build.gradle.kts, gradle/libs.versions.toml, app/src/main/AndroidManifest.xml,
    app/src/main/res/xml/backup_rules.xml и app/src/main/res/xml/data_extraction_rules.xml — подготовленный стек/placeholder scope.

Legacy точки для плана: J/service/DimmerService.java, BrightnessState.java,
ForegroundAppChecker.java; J/screen/overlay/OverlayDrawer.java;
J/screen/brightness/BrightnessUtils.java/MaxMinBrightness.java; J/utils/Const.java/Utils.java;
J/broadcasts/StartOnBootServiceReceiver.java/ScreenOnOffBroadCastReceiver.java;
J/app/App.java/InAppPurchaseManager.java/persistence/SharedPreferencesSaver.java;
J/billing/PurchaseChecker.java/PurchaseHandler.java/obsolete/InAppConfig.java;
widget providers/configure, Manifest и preferences.xml.
Проверять имена методов/callers, не считать старую строку вечным адресом.

## 5. Выполненная работа

- [x] Исследована группа7: clamp/editor/defaults/slider/close/visibility/navigation,
  причины отменённых оптимизаций/записи приpause и старого Android9 delayed launch;
  13 случаев сохранены вf3a82ec06c1a4c5696c16532705ea208cfbb2bc7.
- [x] Все13 приняты пользователем;17 файлов DEC/RULE/SCN/TEST/глоссария/этапов
  синхронизированы в7bfd05607f558627bd0ec63e486f83b7eae3da43;30/0/0.
- [x] Проверки принятия:17 UTF-8/LF текстов,304 local links/55 anchors,
  20 наборов параметров/таблиц Gherkin, уникальность/сохранность30 DEC/48 RULE/62 SCN/71 TEST.
  Это не Gherkin parser execution и не Android тесты.
- [x] По поручению перейти дальше исследованы актуальные первичные Android/Play/
  Billing/AdMob документы и связанные Legacy paths. 399-строчный технический
  отчёт и7 связанных документов сохранены в53254d5383dcd3076fd1fa3838ee878359d9a2e9.
- [x] Проверки оценки:8 UTF-8/LF текстов,231 local links/49 anchors, таблицы/TEST references;
  canonical DEC/RULE/Gherkin не изменены,71 TEST ID сохранены. Расчёт opacity — арифметика,
  не подтверждение физического света/доставки касаний.
- [x] Legacy/новый Android код/зависимости/ветки/архив не менялись. Agent work,
  сборки, device/TalkBack/brightness/store испытания в этой подготовке не выполнялись.

## 6. Оставшаяся работа

- [ ] **Начать здесь: конкретный план MVVM.** Первое действие — прочитать
  AGENTS материалов → behavior-decisions → technical-feasibility-assessment →
  текущий раздел full-rewrite-preparation → связанные RULE/TEST и текущий Android стек.
- [ ] Определить границы состояния UI/requested/observed/runtime и владельца
  команд/окна; сериализацию эффектов, актуальность операции и ошибки/partial.
  Архивный UI/ViewModel на codex/archive-pre-rewrite — reference prototype, не архитектура.
- [ ] Конкретизировать FGS lifetime/manifest/entry paths, CE/DE startup,
  clock trust/Stop/late expiry/recreation; выбрать storage/schema/migration/fixtures.
- [ ] Подготовить макеты Main/settings/editor/help/notification/widgets,
  RU/EN/accessibility и пути восстановления. Не подменить «смысловую кнопку» выбранным UI.
- [ ] Организовать маленькие этапы с критериями завершения и ранними gates:
  FGS/notice и касания → boot/clock → signed upgrade/rights → real detector/widgets/store.
  Чистая логика не обязана ждать весь platform proof; fake не заменяет real evidence.
- [ ] Представить план и необходимые новые пользовательские решения обычным текстом;
  дождаться согласования. Закрытые продуктовые правила не согласовывать заново.
- [ ] После плана: независимые опорные версии/локальные файлы, общий checkpoint
  трёх папок, архив вне копируемого дерева с проверкой целостности/восстановления;
  затем экспериментальные ветки по согласованному порядку. Сейчас архив не нужен.
- [ ] Только после подтверждения проверенного архива и отдельного поручения —
  реализация/прототипы/meaningful tests и реальные проверки отдельными коммитами.
  Файловый откат не откатывает телефон/магазин.

## 7. Технические кандидаты, открытые вопросы и риски

- **FGS specialUse — кандидат**, не выбранный manifest/Play approval. Нужны
  FOREGROUND_SERVICE/SPECIAL_USE/type/subtype и обоснование. На target35+ SAW
  background exemption требует уже видимого окна; widget/notification/boot имеют
  отдельные основания. USER_UNLOCKED сам не гарантия FGS start. Inexact alarm
  не универсальное основание нового FGS. Срок жизни приAuto/manual/controls/suspend определить.
- **Одно overlay окно:** кандидат opaque black content +LayoutParams.alpha;
  Paint-only приwindowalpha1 не доказывает touch pass-through. При-75 alpha191/255≈0.749;
  два таких окна одногоUID дают≈0.937, выше стандартного0.8. Порог читать на устройстве;
  реальное safe touch/OEM/protected windows проверить, не уменьшать alpha молча.
- **Boot/clock:** минимальный DE snapshot доunlock, CE послеunlock. Legacy App
  запускает Billing при создании процесса, receiver не directBootAware — literal перенос непригоден.
  elapsedRealtime годится внутри загрузки, не черезreboot. UTC+mono anchors/BOOT_COUNT —
  кандидат, не доказательство trusted UTC; AUTO_TIME=true недостаточно. Algorithm reliability
  и invalid snapshot/часы вне жизни процесса — gate плана, без обязательной сети для света.
- **Stop vs force-stop:** Android13 Task Manager Stop может оставить alarms/jobs;
  callbacks cleanup не гарантированы. Проверять stop/актуальность до эффекта,
  не восстанавливать dim по persisted active=true; точные expiry переходы определить.
- **Detector:** UsageEvents кандидат вместо DAILY latest-stat/первого running process.
  isUserUnlocked=false означает до первогоunlock загрузки, не обычныйscreenlock посленего.
  На26–28 old event types,29+ resume/pause; multiwindow не доказанный единственный top.
  Реальное fixed5 распознавание ещё неизвестно.
- **Upgrade:** applicationId совпадает, но новыйversionCode1 противLegacy49.
  Нужен номер выше фактически опубликованного maximum и совместимая app-signing identity/lineage;
  upload certificate Play не равен installed APK certificate. Подходящий fixture/сертификаты
  не проверены; не просить приватные ключи/пароли в документы. Uninstall не upgrade test.
- **Данные:** default PreferenceManager store и named net.humblegames.brightnesscontroldimmer.Widget;
  Auto per-ID вdefault, step/opacity вnamed. Duration — не исходный deadline;
  конфликт enabled checkbox/hiddenkey проверитьfixtures. Migration повторяема без света/
  очистки original; backup/runtime/grants/widgets device-specific отделить.
- **Каналы:** timestamp IDs Legacy не имеют надёжно сохранённого preferred ID;
  при нескольких противоречивых settings выбор/cleanup/merge не приняты.
  НовыйHIGH поверх заблокированного старого не безопасная миграция.
- **Premium:** old IS_PREMIUM писали и покупки, и hidden taps; paid provenance
  изboolean неизвестен. Paid права не стирать приunknown/ошибке; представление
  неоднозначного legacy flag до проверки требует схемы/fixtures/возможного отдельного случая.
  Billing8 удаляет history API старой цепочки; current purchases/PURCHASED/ack — кандидат.
- **SDK/account:** AdMob quickstart на дату оценки показывал min24/compile35/
  play-services-ads25.5.0 и переход кNext-Gen; family/version/integration ещё не выбраны.
  Core min26/compile37 не требует нового обновления. Свет не ждёт SDK/сети;
  consent/права учитывать доads init. Личные account/sandbox/подпись не проверены,
  но для составления плана credentials/страна/статус кабинета сейчас не требуются.
- **UI неизвестность:** форма первогоhelp, макеты/ошибки/Snackbar, TalkBack phrases/focus,
  внешнее открытиеMain изdraft editor ещё не выбраны; не принимать молча.
- **Баги:** BUG-001 письмо оwidget послеscreen-on наAndroid16, модель/launcher/точные действия
  неизвестны; не доказаны потеряprefs/reboot/force-stop/причинаAndroid16. BUG-002 накопление
  channels связано сtimestamp кодом, runtime reproduction нет; BUG-003/004 читаемость Honor.
  Все4 открыты, ни один не исправлен. Снимки владельца не устройство автора письма.

## 8. Правила работы для следующего чата

- Русский язык, короткие содержательные updates во время работы; вопросы обычным
  текстом в чате, без popup. Не создавать новый чат автоматически: пользователь делает это сам.
- Не запускать субагентов; не менять Legacy/Android код/dependencies/branches/tags/archive/push/history
  на стадии плана. Не писать авторам багов/другим людям без отдельного поручения.
- Для нового пользовательского решения — six-part: предмет/статус; Legacy и основание;
  предложение/почему; реальный экран/минимум условий; действия с исполнителями по порядку;
  видимый результат/сохранённые значения. Принятый контекст не повторное согласование.
- Не добавлять таймер/overlay/Premium/исключения без влияния на конкретный результат.
  Отдельные взаимодействия обосновывать; не полная матрица каждой функции.
  Не приписывать motives Legacy безcomment/history; сохранять uncertainty и причины обходов.
- Внутренние BUG ID/технические fault injections не пользовательский текст.
  Scope и состояние проверки различать: статический вывод/fake/API/runtime/store/физический свет.
- Сохранять ID/глоссарий/связи одновременно. Документы материалов можно сохранять
  отдельными проверенными коммитами; active hooks проверить, не обходить.
  English Conventional Commits, robot сразу после ': ', завершающий trailer
  Committed-by: Codex после пустой строки, настроенные Author/Committer сохранять.

## 9. Инструменты, команды и проверки

Windows/PowerShell; cwd обычно нового проекта. Для материалов задавать workdir
явно. rg/rg --files первым поиском, Get-Content -Encoding UTF8 для текста;
независимые чтения batch, изменения/approvals/commit sequential. Apply_patch удобен
для длинных текстов; Python stdout прикириллице sys.stdout.reconfigure(encoding='utf-8').

Полезные команды в корне материалов:

```powershell
git -c core.fsmonitor=false status --short
git -c core.fsmonitor=false diff --check
git -c core.fsmonitor=false diff --cached --check
git config --get core.hooksPath
rg -n 'DEC-004 |DEC-006 |DEC-007 |DEC-028 ' BCD-obsidian-vault/docs/specification/behavior-decisions.md
```

В этой среде sandbox иногда даёт ложное «must be run in a work tree» дляdiff/add/commit;
точные команды только для авторизованных документов сrequire_escalated работали
послеauto-review. Не отключать hooks или расширять изменение из-за этой ошибки.
Перед каждым коммитом заново проверитьhooks; ранее были только.samples.

Для документов: UTF-8 безBOM/LF, diff/staged whitespace, local links/anchors,
сохранность/уникальность30 DEC/48 RULE/62 SCN/71 TEST и статусы30/0/0;
Examples/параметры вручную не называть Gherkin parser execution.
Проверки этой новой передачи пересчитать отдельно; прежние числа относятся к своим коммитам.

Текущий Android стек: Gradle9.8.0/AGP9.4.1 built-in Kotlin/Compose plugin2.4.20,
Compose BOM2026.09.00, Detekt2.0.0-alpha.6/Compose Rules0.6.7;
min26/compile-target37, Java/Kotlin bytecode17/JDK21. JVM Jupiter6.1.3/
CoroutinesTest1.11.0, AndroidJUnit4/Compose/UIAutomator2.4.0; accessibility checks34+.
Quality commands/strict checksum metadata — вновых TESTING/QUALITY/MODERNIZATION;
для Markdown не запускать Android builds, не одновременные Gradle против одного output.
Release template unsigned/versionCode1 — не готовый совместимый published upgrade.

Актуальные web facts проверять по первичным Android/Google sources; ссылки
уже сохранены в technical-feasibility-assessment.md. Java API URL иногда internal
error; Kotlin API reference или актуальный официальный redirect помогали.
Никаких полезных временных helper scripts/прототипов от оценки не осталось.

Для этой передачи применён навык
C:/Users/mike/.codex/skills/chat-handoff-summary/SKILL.md и его checklist.
Следующий handoff уместен после согласования крупного плана; новый чат открывает пользователь.

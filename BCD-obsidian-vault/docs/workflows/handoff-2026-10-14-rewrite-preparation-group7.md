Продолжи подготовку полного переписывания Brightness Control Dimmer по этой передаче. Отвечай по-русски. Начни с группы 7 — DEC-004/DEC-006/DEC-007/DEC-028: сначала прочитай AGENTS.md материалов, актуальные решения, обзор, реестр багов и связанные источники Legacy, затем исследуй код, комментарии, историю и причины обходов. Не открывай заново reboot, коммерческую политику и группы 1–6. Не начинай реализацию, обновление зависимостей, архивирование, создание веток или работу агентами. Предложи конкретные случаи группы 7 по закреплённому шестичастному формату с минимальным необходимым контекстом, задай вопросы обычным текстом в чате и дождись ответа пользователя.

# Handoff summary: подготовка переписывания BCD — группа 7, 2026-10-14

## 1. Текущая цель

Подготовить контролируемый эксперимент: полностью переписать Legacy Brightness
Control & Dimmer в существующем Kotlin/Compose проекте с MVVM. Разрешены
исследование, согласование поведения, документация и отдельные проверенные
коммиты материалов. Код переписывания ещё не реализуется.

До реализации нужны оставшийся review группы7, оценка технической реализуемости,
конкретный согласованный план MVVM с макетами и проверками, затем проверенные
точки отката и архив всех трёх папок. Реализацию не начинать до подтверждения
проверенного архива и отдельного поручения выполнять план.

## 2. Текущее состояние и опорные версии

- **Группы1–6 закрыты; точка продолжения — группа7.**
- Q-001 (reboot) и Q-002 (коммерческая политика) закрыты в указанном объёме.
- 30 DEC: **26 CONFIRMED_BY_USER / 4 ADOPTED_BY_AGENT / 0 PENDING_USER**.
  Остались DEC-004/006/007/028. ADOPTED_BY_AGENT не принятие пользователем;
  старое «вопрос не нужен» в строке DEC не заменяет review.
- 48 RULE / 62 SCN / 71 запланированный TEST; ID сохранены.
- Последний ответ пользователя2026-10-14: **«Принимаем все предложения 1-12.
  Какие будут следующие шаги?»** Он подтверждает переработанные случаи группы6
  и DEC-024/025/026/027, а не реализацию или ещё не выбранные UI-решения.
- BUG-001–BUG-004 открыты; исправленных багов нет. Nullable риск таймера уже
  отмечен отдельно в LB-035/E23 и принятом no-crash требовании.
- В этой подготовке не выполнялись Android-сборки, запуск Legacy/нового поведения,
  device/TalkBack/brightness/store испытания или Gherkin parser execution.
  Проверки шаблона/CI из соседних задач не доказательства поведения BCD.

Три папки — независимые Git-репозитории; vault не отдельный репозиторий.

| Репозиторий | Абсолютный путь | Проверенная опорная версия и назначение |
|---|---|---|
| Материалы | D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials | 56b56e05c8ff6935506132031f9c123679ef0d43, main: принятие группы6, связи и оставшиеся шаги; эта передача сохраняется следующим отдельным коммитом |
| Legacy | D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerLegacy | cd7696cd04705fa48a2c115addf98ae6191bfdd9, develop: версия исходников для E/LB |
| Новый Android-проект | D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmer | 83fa6da3a61fdcb8301e97396f0034e7ee07f270, codex/project-modernization: текущий HEAD с изменениями CI/диагностики устройства из соседней работы |

Прежняя опора нового проекта87ef042e62c7a671fa4babfc932d27b55086efb1 сохраняет
модернизированный шаблон. На2026-10-14 текущий HEAD уже83fa6da; diff от87ef042
затрагивает device-tests workflow, MODERNIZATION.md, TESTING.md и device scripts.
Новый чат должен перечитать актуальные инструкции проверок. Эта подготовка
не меняла соседние репозитории и не проверяла результаты их CI.

Проверять Git заново перед правками. В Legacy ранее отмечены пользовательские
неотслеживаемые BrightnessControlDimmer/googleplay/ и Desktop.ini: не включать,
не удалять. Обычный status не долговечная опорная версия.

## 3. Принятый контекст и ограничения

### Группы1–2 и reboot: не согласовывать заново

- Документированная шкала255 по умолчанию плюс требование OEM совместимости
  с нестандартными шкалами. Reflection Legacy имел историческое назначение;
  способ выбрать после проверки актуальности, не переносить/отбрасывать механически.
  Floor5 BCD при255 — raw12, не физическая гарантия для всех устройств.
- Единая opacity. На Legacy Android12+ дополнительная window alpha меняет
  видимую силу. Negative presets при миграции сохраняются численно без
  автопересчёта/автоприменения, с однократным кратким сообщением об изменении силы.
- Шаг из Auto берёт актуальный системный raw, не старую numeric цель.
  Sync=true: внешнее изменение ОС снимает overlay/таймер; sync=false не
  отыгрывает изменение самовольно. Отличать собственное уведомление записи.
- Обычное первое/повторное открытие не меняет свет и не повторяет команду.
  Допустимое восстановление актуальной сессии при recreation сохраняет исходный
  deadline, не умножает окно и не оживляет истёкшую сессию. Force-stop не
  преодолевать; forced crash restart/alarm+kill удаляется.
- Boot policy: Auto default, Last, fixed5..100 initial25. Overlay в Last
  опционально/defaultoff и только после первого unlock. Исходный deadline
  проходит через reboot без паузы/rearm; недостоверный срок не восстанавливает
  старое затемнение. При доступной ранней обработке/WRITE достоверный manual
  raw<12 поднимается до12; остальные raw/Auto не меняются. Нет гарантии первого кадра.
- Только при установленном отказе актуальной boot Auto цели и доступной manual
  записи — одна резервная попытка25/raw63 без overlay, без изменения policy Auto.
  Неизвестность не отказ, новая цель отменяет старый резерв, без retry loop.
  Это не универсальный fallback для любой Auto команды. RULE-041–RULE-048.
- Валидные настройки сохраняются при совместимом обновлении; fixtures/подпись
  ещё нужны. DEC-029/030 приняты узко: защита совместимости и идея будущего
  исследования, не разрешение опасного опыта с яркостью/работающая калибровка.

### Группа3: таймер и аварийное снятие

- Таймер defaultoff, сохранённая длительность3h, выбор30min..24h шаг30min.
  Настройка enabled и активный отсчёт различаются.
- Каждая новая принятая negative команда, включая то же число/slider/+/-,
  начинает полный срок заново. Повторная доставка одной операции не новая команда.
- Save изменённой длительности при active timer начинает срок от Save;
  unchanged Save/Cancel/Back/закрытие не rearm. Cancel не сохраняет выбор.
  Enable при negative начинает срок сейчас; без dim только сохраняет настройку.
  Disable отменяет срок, сохраняя dim и duration.
- Nonnegative/Auto/external sync отменяют срок, не выключая настройку enabled.
  Временное исключение не пауза/rearm; истёкшее затемнение не оживлять.
- Истечение при доступной обработке снимает overlay и запрашивает Auto.
  Non-wakeup/inexact, без нового exact-alarm grant; нет обещания точной секунды
  во сне или обработки до первого кадра. Stale/cancelled/replaced event не
  меняет новую цель/сессию.
- Четыре полученных SCREEN_ON/OFF с соседними интервалами<=1250ms снимают
  только актуальное negative затемнение, отменяют таймер, запрашивают Auto.
  Gap>1250ms начинает последовательность заново. Это не любые4 физических
  нажатия за5s и не доказательство кнопки/обязательного чередования.
  Manual25/nonnegative/Auto без актуальной negative сессии сохраняются.
- Уточнение null: Legacy nullable progress при закрытии без callback имеет
  статический риск unboxing; runtime crash здесь не воспроизводился.
  В новой версии Save/Cancel/Back/закрытие без движения slider безопасны,
  прежняя duration/deadline сохраняются. LB-035/E23/DEC-016/RULE-026/TEST-034–035;
  требование принято, код ещё не исправлялся.

### Группа4: разрешения и уведомления

- Manual/Auto требуют WRITE_SETTINGS, negative дополнительно overlay.
  Главный экран/настройки/help доступны без grants. Denial не закрывает всё BCD;
  поздний grant сам не выполняет старую команду.
- Missing settings Activity: доступное объяснение/альтернатива без crash,
  ложного success и deferred команды. Фон сам не открывает permission Activity.
- Legacy ожидал запаздывающий canDrawOverlays наAndroid8 до10s, с проверками
  каждую секунду/ранним true. Не делать10s обязательной UI нормой; актуальность на26 проверить.
- Быстрые notification controls defaultoff отдельно от обязательного notice
  длительного active service. Toggle не команда света, не меняет overlay/deadline.
  POST_NOTIFICATIONS только33+ по намерению включить controls. Denial сам не
  блокирует допустимое управление светом; фактическую видимость notice определяет ОС.
- Стабильный канал: initial HIGH без sound/vibration; пользовательские settings
  сохраняются при toggle/reopen/recreation. Приоритет BCD ведёт в настройки ОС.
  Не новый timestamp ID на каждом запуске и не обход user importance.
  FGS type/технический путь ещё не выбран.
- Убрать отдельный запрос принудительного закрытия системной панели и его
  опцию на всех поддерживаемых API. Это не закрытие собственной панели BCD
  из ещё не принятого DEC-007.
- Читаемый текст текущего значения/Auto отдельно от малой иконки, цельные
  подписи с минусом/%, различимые удобные кнопки. Макет/цвета/размеры не выбраны.

### Группа5: виджеты и исключения — все16 случаев приняты

- Четыре home widget типа: value открывает Main без команды света; shared
  controls используют4 общих с notification presets/Auto/+/-; horizontal и
  vertical +/- имеют optionalAuto. Снимок Legacy — справка, не выбранный новый макет.
- Разные instances независимы: step1..50 default10, opacity оформления15..100
  шаг5 default100, Auto defaultfalse. Оформление не экранная яркость/overlay.
- Save всех per-ID settings вместе; Cancel/Back без записи. Delete убирает все
  settings/actions ID; запоздалое действие удалённого ID не меняет свет/другие instances.
- Перенос Auto: explicit per-ID > legacy global > false. Это принятая
  нормализация TO-BE, не точное повторение Legacy. Upgrade не применяет свет.
  Специальная ветвьAPI17..20 не переносится; современный lockscreen host не обещан.
- Настройки переживают обычный сон. SCREEN_ON не повторяет preset; явное
  нажатие после unlock выполняет обычный контракт либо честно показывает отказ.
  BUG-001 остаётся неизвестным, не доказанная причина/исправление.
- Exclusions defaultoff, optional Usage access, только fixed5 E27:
  com.android.vending, com.google.android.gm, com.android.packageinstaller,
  com.google.android.apps.walletnfcrel, com.google.android.gms.
  Custom selector не переносить, отключённый Accessibility detector не восстанавливать.
- Suspend только актуальный negative overlay; цель/mode/raw/deadline сохраняются.
  Новая negative команда остаётся suspended до распознанного выхода.
  Restore только актуальной допустимой сессии. Unknown/error/empty не exit и
  не повод автоматически снимать видимый overlay.
- Установленный revoke Usage отключает функцию без автоматического возврата
  снятого окна; поздний grant не enable. Explicitoff допускает актуальный
  negative overlay даже в excluded app. Timer идёт без паузы/rearm.
  Auto/positive/expiry/external sync/revoke overlay не оживляют старую сессию.
  Нет обещания мгновенного/no-leak распознавания; real detector ещё проверяется.

### Группа6: все12 переработанных предложений приняты2026-10-14

1. Однократный первый вход в help можно прервать Back, help открыть повторно.
   Автоматический показ или отдельное предложение — форма ещё не выбрана.
2. Help/Back при действующей сессии не повторяют команду/не сдвигают deadline.
3. Help15:59, конец таймера16:00: при доступной обработке снять overlay,
   запросить Auto; помощь сама не закрывается, позже пользователь закрывает Back.
4. Help точно описывает принятые функции/ограничения без неубиваемого сервиса,
   физических4press5s и неподтверждённых promises исправления. BUG ID не в UI.
   Число страниц/новые screenshots ещё не выбраны.
5. Длинная help читаема/прокручивается при крупном тексте/узком экране;
   возврат Back доступен, поворот рассматривается отдельно.
6. Убрать7/10 скрытые Premium taps для всех пользователей: taps не выдают и не
   отзывают право. Paid rights/restore/gamepromo сохраняются. Исторический
   комментарий устанавливает мотив «тесты и друзья»; provenance одного flag неоднозначен.
7. Share: системный выбор, text/plain, прежний package PlayURL без ah,
   optional локальная тема, без prefs/света/файлов/автоотправки/claims доставки.
   Назначение ah в истории неизвестно, не доказанный трекер/бесполезный обход.
8. Отмена Share→main без error; фактический launch failure BCD→доступный main
   и сообщение о невозможности открыть выбор приложения, форма не выбрана.
   Ошибка отправки внутри выбранного приложения отдельна от launch failure BCD.
   Timer во время Share идёт; при обработке окончания BCD не закрывает Sharesheet.
9. Русский и полный English fallback, устранить hardcoded/непереведённые labels;
   numeric prefs не меняются. Новый language selector/новые языки не добавлены.
10. Смена языка ОС/recreation не повторяет команду и сохраняет актуальную сессию;
    фактическую остановку ОС отражать честно.
11. Экран изменения числового значения обычной кнопки: цифровая клавиатура,
    читаемая ошибка/достижимые Ok/Cancel; invalid не меняет saved кнопку,
    Cancel возвращает main с прежним значением. Legacy101 при upper100 —
    достижимый пример Legacy, не принятие нового диапазона редактора группы7.
12. Доступные names/state/errors и TalkBack: help/возврат, Auto/число/минус/%,
    ошибка редактора/Cancel. Точные фразы и порядок фокуса ещё не выбраны.

Числовая клавиатура — прямое требование пользователя. Legacy XML numberSigned;
по наблюдению пользователя буквы/вставка Abc не принимаются, точка/запятая
ничего не вводят. Integer/range validator существует, но abc не обычный
достижимый UI-сценарий. Диапазон новой версии редактора/clamp остаётся в группе7.
Общая шкала/защита из группы1 при этом не открывается заново.

### Коммерческая политика

Google Play/Play Billing/AdMob первого выпуска, бессрочный Premium, прежние
оплаченные права/restore/gates, game promotion и баннеры сохраняются.
Billing denial/unknown не стирает подтверждённое право; promo не paid purchase.
Подписка только будущий задел, не продажа в первом выпуске; Huawei/RuStore не
обязательны. Новая аналитика/Crashlytics/interstitial и рекламные паузы
управления не приняты. RULE-036–RULE-040 — точный контракт.

## 4. Артефакты и порядок чтения

Все пути ниже относительны корню материалов из таблицы, кроме явно указанных
Legacy/нового проекта. Читать отдельно; передача не заменяет канонические документы.

1. AGENTS.md — обязательный формат случаев, minimal context, причины Legacy,
   глоссарий/ID, проверки и коммиты; изменён в06af50f.
2. BCD-obsidian-vault/docs/workflows/legacy-differences-review.md — обзор групп;
   актуален заголовок/последнее принятие, старые даты исторические.
3. BCD-obsidian-vault/docs/specification/behavior-decisions.md — канонические
   статусы26/4 и точные границы принятия; читать DEC-004/006/007/028 и закрытые связи.
4. BCD-obsidian-vault/docs/bugs/bug-register.md —4 открытых сообщения; условия/unknown.
5. BCD-obsidian-vault/docs/specification/source-evidence.md — E/P, комментарии,
   история и причины обходов. Для группы7 начать E01/E02/E08–E13/E38,
   проверить production call sites, manifest/resources/tests/историю.
6. BCD-obsidian-vault/docs/specification/legacy-behavior-inventory.md и отдельно
   discovery-coverage.md в той же папке — AS-IS/confidence/gaps, не утверждённый TO-BE.
7. BCD-obsidian-vault/docs/specification/features/controls-and-widgets.md —
   RULE-008–RULE-013 группы7 рядом с принятыми controls/widgets;
   brightness-and-dimming.md рядом — RULE-006 и принятые связанные правила.
8. BCD-obsidian-vault/docs/specification/features/help-and-constraints.md —
   RULE-035/DEC-028 ещё группа7, RULE-032–034 уже приняты.
9. BCD-obsidian-vault/features/controls-and-widgets.feature,
   brightness-and-dimming.feature, help-and-constraints.feature — читать отдельно.
   SCN-009/012–019/043 — предложения группы7, SCN-042 будущий числовой
   пример зависит от согласования нового диапазона; Gherkin декларативный.
10. BCD-obsidian-vault/docs/specification/test-plan.md, отдельно traceability.md,
    glossary.md — будущие TEST/связи/термины, ID сохранять.
11. BCD-obsidian-vault/docs/workflows/group6-help-sharing-and-accessibility-review.md —
   12 принятых случаев, six-part формат/оценка необходимости условий;
    group5-widgets-and-exclusions-review.md и group4-notifications-and-permissions-review.md
    рядом —16 и8 принятых случаев.
12. BCD-obsidian-vault/docs/specification/timer-and-safety-cases.md —
   18 принятых случаев группы3, уточнение nullable риска.
13. BCD-obsidian-vault/docs/specification/widget-device-evidence.md и отдельно
    notification-device-evidence.md — реальные screenshots/границы выводов.
    Оригиналы: evidence/legacy-widgets-2026-10-12/legacy-widgets.png и
    evidence/honor-magic7-pro-2026-10-12/legacy-notification-channels.png,
    legacy-notification-layout.png относительно specification. Temp не нужны.
14. BCD-obsidian-vault/docs/specification/product-specification.md и отдельно
    workflow-progress.md — текущие обзор/прогресс, последний статус2026-10-14.
15. BCD-obsidian-vault/docs/workflows/full-rewrite-preparation.md —
    текущие оставшиеся шаги2026-10-14, план/архив; monetization-provider-research.md
    рядом сохраняет store исследования.
16. В новом проекте: AGENTS.md, MODERNIZATION.md, TESTING.md, QUALITY.md,
    gradle/libs.versions.toml, app/build.gradle.kts — заданный стек и актуальные
    проверки. Перечитать после изменений83fa6da; не запускать builds для документации.

Сокращения каталога Legacy: J/ =
BrightnessControlDimmer/src/main/java/net/humblegames/brightnesscontroldimmer/;
R/ = BrightnessControlDimmer/src/main/res/. Всё относительно Legacy root.
Точки группы7: J/utils/Const.java, J/utils/Utils.java, J/service/DimmerService.java,
J/ui/MainActivity.java, J/ui/SetButtonValueActivity.java,
J/ui/settings/FragmentSettings.java, R/xml/preferences.xml,
R/values/preference_keys.xml, editor layouts/manifest. Сверять актуальные строки
по каталогу, не считать номер строки вечным.

Архивный UI/ViewModel нового проекта на codex/archive-pre-rewrite — прототип,
не выбранная архитектура. Старые передачи2026-10-09/12 сохраняются как история;
их точки продолжения группы3/5 устарели.

## 5. Завершённая работа

- [x] Закрыты reboot/Q-002/группы1–4, исследованы причины timer non-wakeup,
 1250ms, foregroundAndroid8, overlay grant delay, timestamp channels/shade;
  источники/неизвестность сохранены.
- [x] Исследованы widgets/exclusions по call sites, comments/history/original
  sources;16 случаев приняты. Снимок всех4 типов Legacy сохранён без изменения.
- [x] Nullable риск таймера был отмечен ранее; после прямого уточнения пользователя
  no-crash/unchanged-duration/deadline без движения slider/callback уточнены
  в LB-035/E23/DEC/RULE/SCN/TEST. Это не исправление Legacy.
- [x] Исследована группа6: help/ScrollView исторический мотив, hidden taps,
  Share ah/receiver outcomes, RU/EN/labels/editor. P10–P15 — первичные Android
  источники; static/UI-unknown отделены от runtime.
- [x] По поручению пользователя исправлен способ формулирования:
  AGENTS.md,12 случаев и необходимые связи/глоссарий/числовой пример.
 06af50f не принимал группу6.
- [x] Отдельным ответом2026-10-14 приняты все12 предложений;
 56b56e0 обновил11 документов,26/4, оставшиеся шаги.
- [x] Проверены11 текстов UTF-8 без BOM/LF,166 local links/22 anchors,
  стабильность/уникальность30 DEC/48 RULE/62 SCN/71 TEST, статусы26/4,
 3 таблицы/набора параметров изменённого Gherkin, diff/staged whitespace.
  Это не parser execution/Android/device/TalkBack испытания.

Значимые коммиты материалов: 0c6892a/118458e (группа3),
e7bfa36/3c49338 (группа4/снимки),181a2e4 (реестр багов),
5882fe3/162bd06 (исследование/уточнение группы5),d315bfd (принятие группы5),
d1e6de6 (null риск),d6f9ae8 (исследование группы6),
06af50f (формат/minimal context),56b56e0 (принятие группы6).
Не переписывать их. Проверки передачи пересчитать отдельно; эти числа относятся
к коммиту принятия, не к будущим изменениям.

## 6. Оставшаяся работа и точка продолжения

- [ ] **Начать здесь: группа7, DEC-004/006/007/028.**
  Сначала AGENTS/актуальные документы, затем E01/E02/E08–E13/E38 и исходники,
  production callers/resources/manifest/tests/comments/Git/original links.
  Сохранить причины обходов/неизвестность до предложения изменений.
- [ ] Проверить clamp против wrap и разные шаги surfaces; после bounds negative
  повтор может быть новой командой/rearm по уже принятому таймеру.
  Отдельно исследовать editor и defaults main8/notification/shared4, empty
  Done/Cancel/Save без применения света, доступ через реальные gates.
  Диапазон редактора/шагов ещё не принят всей группой7.
- [ ] Исследовать continuous slider, отражение состояния против user action,
  close on select собственной панели, denied command/Back/reopen/singleTask,
  visibility groups и восстановление Settings при скрытых controls.
  Не смешивать собственную панель с уже удалённым закрытием системной панели.
- [ ] Проверить заданный стек/min26/target37/Java17/JDK21 и Legacy min21/target33,
  loss поддержки21–25 отметить явно. Offline-команды отличать от сети Billing/Ads.
  Стек не обновлять; архивный prototype не принимать как архитектуру.
- [ ] Представить случаи группы7 с минимальным контекстом, объяснёнными отличиями/
  основаниями. Спросить обычным текстом и дождаться прямого ответа.
  После принятия синхронно обновить DEC/RULE/SCN/TEST/статусы отдельным коммитом.
- [ ] Оценить technical feasibility: FGS type/background starts, early recovery/
  clock/OEM/overlay, real foreground detection, migration/prefs/старые каналы,
  widgets host/signed upgrade/старые права/магазин. Определить ранние проверки.
- [ ] Подготовить и согласовать MVVM план: макеты, состояние/эффекты, storage/
  миграция, этапы, проверки по риску, критерии завершения.
- [ ] Перед реализацией: независимые опорные версии/local files, общий checkpoint
  трёх папок, проверенный архив вне копируемого дерева, порядок восстановления;
  затем экспериментальные ветки по согласованному порядку. Сейчас архив не нужен.
- [ ] Только после подтверждения архива и поручения выполнять план — реализация,
  meaningful tests/реальные Android/device/upgrade/store проверки отдельными
  коммитами. Откат файлов не откатывает телефон/магазин.

## 7. Открытые вопросы и границы выводов

- Группа7 не принята;4 DEC агента — предложения. Числа в их RULE/SCN не принятие.
- Форма первого help, макеты/число страниц, форма error Share (Snackbar лишь
  предложен), точные TalkBack фразы/порядок фокуса ещё не выбраны.
- FGS type/manifest/target37 фоновые запуски не выбраны; specialUse только кандидат.
  OEM reflection/Android8 overlay workaround требуют будущей проверки.
- Real Usage detector не подтверждён fake тестом; unknown не доказательство выхода.
- Миграция накопленных channels без потери user settings не выбрана;
  очистка данных приложения не принятый способ миграции.
- Legacy один IS_PREMIUM не устанавливает происхождение права; сохранение
  прежних paid rights/restore обязательно, provenance/fixtures ещё исследовать.
- BUG-001: письмо Oct11,2026,7:23PM (timezone unknown), тема by widget,
  «the custom brightness values by widget after turning the screen on doesn't work»,
  «andr16». Модель/launcher/версия/тип widget/значения/точные действия неизвестны.
  Не доказаны loss prefs/reboot/force-stop/Android16 причина. Сравнение явного
  нажатия до сна/после unlock и сохранности settings запланировано TEST-026/028.
  Справочный снимок владельца не окружение автора письма. В help BUG не помещать.
- BUG-002: timestamp ID создаётся с новым service; recreate удаляет только свой
  текущий ID, старые остаются. Код объясняет возможность накопления; Honor screenshot
  не dump/полная история/устройство воспроизведения. BUG-003/004 — читаемость.
  Android/MagicOS/масштаб Honor неизвестны. Ни один BUG не закрыт.
- Nullable риск LB-035 статический, причина отсутствующего callback как возможный
  путь известна; конкретный crash на устройстве не установлен.
- Опыт с яркостью0..4 ниже защиты не разрешён; DEC-030 лишь идея исследования.

## 8. Правила работы и формат согласования

Русский язык; содержательные короткие обновления во время работы. Вопросы —
обычным текстом, без popup. Не запускать субагентов, не создавать новый чат,
не писать авторам багов/другим людям без отдельного поручения. Не менять Legacy,
не обновлять зависимости/branches/tags/archive/push/history в текущем исследовании.

Каждый пользовательский случай содержит шесть частей:

1. **Предмет и статус:** одна конкретная функция/решение; сохранение Legacy,
   изменение Legacy, уточнение уже принятого контекста или невыбранное решение.
2. **Как в Legacy:** относящееся поведение и основание — код, comment/history,
   observation пользователя или unknown. Static не device test.
3. **Предложение и почему:** явно сохраняем/меняем/удаляем, установленная причина;
   неизвестный мотив назвать неизвестным. Принятый контекст не согласовывать заново.
4. **Экран/исходное состояние:** реальный способ открытия, объект настройки,
   только необходимые условия. Edited кнопка, active dim, OS mode, duration и
   end time — разные величины.
5. **Действия/события по порядку:** у каждого исполнитель пользователь/BCD/ОС,
   конкретная кнопка/поле/event. Реальная Legacy достижимость либо честно
   невыбранная новая форма. Не «передать редактору/затем закрыть» без действия.
6. **Видимый результат/состояние:** сообщение/его форма или её unknown,
   экран после, сохранённые/изменённые значения; timer expiry отдельно.

Независимые ситуации — варианты внутри прежнего номера, не смешивать.
BUG ID/fake/injected faults/test setup вынести в техническую заметку после
пользовательского случая, не внутренние ID/термины в предлагаемом UI-тексте.

Сначала определить одно основное проверяемое поведение. Различать отдельную
функцию, взаимодействие и техническое предусловие теста. Overlay/timer/
Premium/grants/exclusions включать лишь когда условие влияет на результат,
необходимо событию, проверяет конкретный side effect или объясняет известный риск.
Если условие можно удалить без потери смысла/проверяемости, удалить.
Необычное взаимодействие кратко обосновать. Не объявлять независимость функций
по названиям; связи исследовать, unknown обозначить.

Общую навигацию без команды света/rearm сформулировать один раз и проверить
несколькими обоснованными взаимодействиями. Не полная матрица настроек для каждого
текста/перевода/прокрутки. Случаи согласования не автоматически исчерпывающий
набор тестов. TEST по значимым классам/границам/переходам/риску; комбинации лишь
относящихся факторов/допустимых сочетаний, pairwise не универсально достаточно.

До представления проверить экран/объект, исполнителя каждого шага, событие
результата, видимое состояние, отличие от Legacy/причину, предмет принятия.
Не добавлять switches/UI/features ради пояснений и не изобретать неизвестность.

Сохранять DEC/RULE/SCN/TEST ID/глоссарий/связи вместе. Проверять status перед
правками и hooks перед commit, не включать пользовательские/Obsidian/локальные файлы.
English Conventional Commits: robot сразу после ': ', последняя строка
'Committed-by: Codex' после пустой строки; Author/Committer сохранять.
UTF-8 без BOM, LF. Три Git histories независимы.

## 9. Инструменты и проверки

Windows/PowerShell; cwd нового проекта, для материалов явно задавать их root.
Первым поиском rg/rg --files; чтение Get-Content -Encoding UTF8, независимые
чтения batch, edits/approvals/commit sequential. Не параллельные Gradle builds.

Полезные команды в materials root:

```powershell
git -c core.fsmonitor=false status --short
git -c core.fsmonitor=false diff --check
git -c core.fsmonitor=false diff --cached --check
rg -n 'DEC-004 |DEC-006 |DEC-007 |DEC-028 ' BCD-obsidian-vault/docs/specification/behavior-decisions.md
rg -n 'E01|E02|E08|E09|E10|E11|E12|E13|E38' BCD-obsidian-vault/docs/specification/source-evidence.md
git config --get core.hooksPath
```

Перечитать активные hooks; прошлый каталог .git/hooks только.samples не обещание.
В этом чате sandbox иногда давал ложное «must be run in a work tree» для Git
diff/add/commit; точные авторизованные команды с require_escalated выполнялись
после auto-review. Не обходить hooks/проверки; новый отказ сначала разобрать.

Для документов проверить diff/staged whitespace, UTF-8/LF, local links/anchors,
сохранность/уникальность ID и текущие статусы, отдельно Gherkin tables/parameters.
При смене даты заголовка обновить anchor ссылки: найденный после принятия broken
workflow-progress→full-rewrite-preparation anchor исправлен на2026-10-14.
Изменившийся набор ссылок на существующие DEC не означает смену определений ID:
сравнивать канонические определения с предыдущим Git commit.

Gherkin декларативный, parser execution/executable acceptance не заявлять по
сверке таблиц. New editor out-of-range пример выбирать после группы7,101 толькоLegacy.
Для images использовать сохранённые PNG/view_image, не Temp. Веб — актуальные
первичные источники новых platform claims; SO/history не современные device proofs.
Длинные тексты/patch лучше apply_patch: Windows длинный командный аргумент может
дать error206. Python Russian stdout при необходимости UTF-8 reconfigure.

Навык chat-handoff-summary применён для этой передачи:
C:/Users/mike/.codex/skills/chat-handoff-summary/SKILL.md.
Следующий handoff уместен на границе крупного этапа; пользователь сам открывает чат.


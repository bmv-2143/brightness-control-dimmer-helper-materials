Продолжи подготовку полного переписывания Brightness Control Dimmer по этой передаче. Отвечай по-русски. Начни с группы3 — таймер и аварийное снятие (DEC-016/DEC-017): сначала прочитай AGENTS.md материалов, текущий обзор и связанные источники Legacy, затем объясни пользователю существующее поведение, его мотивы и предлагаемые отличия. Не повторяй закрытое согласование восстановления после reboot и групп1–2; не начинай реализацию, обновление зависимостей, архивирование или работу агентами. Вопросы задавай обычным текстом в чате, без всплывающих форм.

# Handoff summary: подготовка переписывания BCD —2026-10-09

## 1. Текущая цель

Подготовить контролируемый эксперимент: полностью переписать Legacy Brightness
Control Dimmer в существующем новом Kotlin/Compose проекте с MVVM. Сейчас
разрешены исследование, согласование поведения, документация и отдельные
проверенные коммиты материалов. До реализации нужны оставшийся review,
конкретный MVVM план и подготовленные проверенные точки отката всех трёх папок.
Код переписывания ещё не реализуется. Зависимости недавно модернизированы;
массовое обновление до «самого последнего» не нужно.

## 2. Текущее состояние

- Этап1: параметры восстановления после перезагрузки согласованы, Q-001 закрыт.
- Коммерческая политика Q-002 согласована в указанном ниже объёме.
- Этап2: группы1–2 обзора отличий полностью закрыты2026-10-09.
- **Точка продолжения: группа3, DEC-016/DEC-017 — таймер и защитное снятие.**
- После неё группы4–7, затем конкретный MVVM план; архив/точки отката перед реализацией.
- Спецификация содержит48 RULE/62 SCN/71 запланированный TEST/30 DEC.
  Из DEC:13 CONFIRMED_BY_USER в указанном объёме,17 ADOPTED_BY_AGENT.
  ADOPTED_BY_AGENT не означает согласие пользователя; молчание тоже не согласие.
- Подтверждены DEC-001/002/003/005/012/013/014/015/021/022/023/029/030.
  DEC-030 подтверждён только как идея будущего исследования, не функция/эксперимент.
- Настоящие Android/device/store испытания не запускались. Gherkin проверен
  вручную; это текстовая спецификация, не исполняемые доказательства.

## 3. Важный контекст и ограничения

Три независимых Git репозитория в одной родительской папке:

| Папка | Назначение и проверенная опорная версия |
|---|---|
| D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmer | Новый проект; ветка codex/project-modernization; опорный HEAD 87ef042e62c7a671fa4babfc932d27b55086efb1. Главный экран шаблонный, реального управления яркостью/overlay/persistence нет |
| D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerLegacy | Reference; ветка develop; анализ привязан к cd7696cd04705fa48a2c115addf98ae6191bfdd9. Не изменять без отдельного запроса |
| D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials | Документация; ветка main; BCD-obsidian-vault вложенная папка, не отдельный репозиторий |

Архивный Compose ViewModel — прототип на codex/archive-pre-rewrite, а не
устаревшая технология ViewModel и не утверждённая архитектура. Прежняя структура
прототипа не определяет MVVM. Подготовленный стек описан в AGENTS/MODERNIZATION
нового проекта: Compose/Material3, min26/target37, JDK21, Gradle9.8/AGP9.4.1,
Kotlin/Compose compiler2.4.20. Не обновлять версии в этой задаче.

Не выполнять push, rewrite history, создание branches/tags/worktrees, архив,
запуск переписывания или опасные эксперименты с яркостью. Не создавать новый чат
самостоятельно: пользователь сам переносит передачу. Не использовать субагентов
без прямого разрешения; сейчас ни один не запускался.

В Legacy были местные неотслеживаемые googleplay/ и Desktop.ini: это не
авторизованные исходные изменения. Не включать их в коммиты и не удалять.
Текущее состояние Git всегда проверять заново, не полагаться на эту передачу.

## 4. Артефакты и порядок чтения

Все перечисленные файлы сохранены; это разные источники, не объединять их в один.

1. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/AGENTS.md — правила материалов, включая новое требование исследовать причины Legacy обходов.
2. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/workflows/legacy-differences-review.md — текущий обзор, группы3–7 и точка продолжения. Исторические статусы ниже не отменяют последний ответ.
3. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/specification/behavior-decisions.md — канонические DEC и актуальные статусы. При конфликте читать последнее явное согласование, а не старую запись.
4. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/specification/source-evidence.md — точные E/P источники, Git история и реестр OEM шкал/обходов.
5. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/specification/features/state-and-recovery.md — RULE-023–029/041–048, recovery и следующий timer review.
6. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/specification/features/brightness-and-dimming.md — шкала, floor, alpha, Auto и sync.
7. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/specification/product-specification.md — общий контракт; glossary.md, traceability.md, test-plan.md и workflow-progress.md в той же папке — термины/связи/проверки/история этапов.
8. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/workflows/full-rewrite-preparation.md — история всех уточнений и порядок плана/отката; не перечитывать полностью без необходимости.
9. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/docs/workflows/monetization-provider-research.md — исследования будущих магазинов/провайдеров, с датированными ограничениями; не считать выбором всех будущих SDK.
10. D:/data_mike/develop/android/BrightnessControlAndDimmerRewrite/BrightnessControlDimmerHelperMaterials/BCD-obsidian-vault/features/ —6 Gherkin файлов. Изменения поведения согласовывать с RULE/DEC/SCN/TEST/глоссарием.

Новый проект: прочитать его AGENTS.md перед действиями там; MODERNIZATION.md,
TESTING.md и QUALITY.md нужны для будущего плана/проверок, не для новой модернизации.

## 5. Завершённые шаги и принятые решения

- [x] Статическая инвентаризация Legacy и повторный проход. Не повторять целиком;
  проверять конкретные места и мотивы следующих предложений.
- [x] Перезагрузка: Auto default; «Последний режим BCD»; «Заданная яркость».
  Fixed — целое5..100/шаг1, первоначальная настройка25; сама настройка/первое
  открытие не меняет свет. Изменённое пользователем значение сохраняется.
- [x] В Last восстановление overlay опционально, default OFF. При ON — только
  после первой разблокировки, без обязательного открытия приложения, если ОС,
  grants, актуальная цель, exclusions и timer это допускают. Новый default
  позднее не должен переписывать сохранённый пользовательский выбор.
- [x] Минимум именно5 процентов условной шкалы BCD, не raw5. При default255
  активное целочисленное преобразование floor даёт raw12, не13. Отдельный10%
  отвергнут. Last-45 с restore OFF → raw12/no overlay; ON → тот же floor и
  overlay после unlock при допустимом восстановлении.
- [x] Ранняя защита до unlock при доступном callback/WRITE_SETTINGS: поднять
  только достоверный manual raw ниже floor; raw>=floor сохранить точно, Auto
  не менять. Это не гарантия первого кадра boot; затем выбранная boot policy.
- [x] Таймер сохраняет исходный конец через reboot:13:00+3h→16:00, учитываются
  выключение/загрузка/ожидание unlock. Просроченный overlay не показывать.
  Повреждённый/надёжно недостоверный срок не восстанавливает старый overlay и
  не начинает новый срок. Смена timezone сама не отменяет таймер. Внутри boot
  монотонный отсчёт; не обещать обнаружить все изменения часов при выключении.
- [x] Отказ/partial boot записи: фактический доступный mode/raw, no new overlay,
  no false success, no retry loop; короткая ошибка при доступном UI. Не семь
  отдельных подсистем и не обещание атомарности/rollback.
- [x] При установленном отказе актуальной Auto boot цели и доступной manual
  записи — одна резервная попытка25 без overlay. Сохранённая policy остаётся
  Auto. Нет доступа/unknown/отказ reserve → отказ без цикла. Новая цель
  отменяет старую попытку. Не расширять этот резерв на весь runtime Auto.
- [x] Обычное первое/reopen не навязывает Auto/старую команду и не rearm;
  действующий overlay не снимать, прекратившийся не показывать как работающий.
- [x] Recreation актуальной сессии допускается по ОС/grants/sync/exclusions/
  deadline, без нового срока. Пересоздание UI не новая команда. Force-stop не
  обходить; обычное открытие после остановки не оживляет прежний preset.
- [x] Повтордоставка одной операции не создаёт второй эффект/окно и не
  продлевает таймер. Новое намеренное действие пользователя — другая операция.
- [x] Убрать собственный crash handler alarm+kill, пытающийся открыть Activity
  через100ms. Сохранение настроек/диагностика остаются; допустимое восстановление
  ОС отдельно. При crash нельзя гарантировать выполнение cleanup/повышения raw.
- [x] При sync=true external mode/raw выигрывает, overlay/таймер снимаются;
  own-write echo не external. sync=false сохраняет requested state, наблюдает
  ОС отдельно, не отыгрывает старую яркость обратно самопроизвольно.
- [x] +/- в Auto от прочитанного системного raw, не прежней числовой цели BCD:
  default raw128→50; шаг+5→manual55. Ошибка чтения не записывает старый preset.
  raw — настройка, не измеренная физическая яркость, плавность OEM не доказана.
- [x] Единая effective black opacity negative p на поддерживаемых API, без
  второго искусственного множителя. Для-50≈50%; Legacy API31+ при window0.8
  имел≈40%. На12+ новая шкала может затемнять сильнее. Touch safety/protected
  окна соблюдать. Это расчёт композиции, не процент физического света.
- [x] Миграция: валидные presets/steps/visibility/options/timer сохранять;
  invalid → default соответствующего поля, ambiguous данные не включают
  overlay. Negative presets сохраняются численно (-50 остаётся-50), upgrade
  не применяет старое затемнение сам. Один раз кратко сообщить изменение силы.
- [x] DEC-001: по умолчанию документированная системная шкала до255, плюс
  требование совместимости нестандартных шкал. Конкретный способ после проверки
  актуальности обхода на релевантных прошивках, нестандартный обход согласовать.
  Принятие не означает автоматическое копирование reflection или ввод detector.
- [x] Сохранить прежний бессрочный Premium и все оплаченные возможности;
  автоматический/ручной restore, первый выпуск Google Play/AdMob, game promotion
  unlock. Подписка — задел для будущих новых функций, без продаж/цен сейчас.
  Будущие Huawei/RuStore/другие ad providers — расширение, архитектура ещё не
  утверждена. Store/billing и ads независимо конфигурируемые оси будущего плана.
  Cached bool не доказательство покупки, временная ошибка query не лишает прав.
- [x] DEC-029 — историческое назначение защиты FlyIQ441/Archos. DEC-030 — лишь
  идея будущего исследования; bypass floor/калибровка/опасные опыты не разрешены.
- [x] Проверены текстовые ID, связи, локальные ссылки, UTF-8/LF и diff; коммиты
  раздельны по смыслу. Примеры прошлых коммитов: c9d08b6 (crash/recovery/migration),
  f28cdb0 (исследование reflection). Последующее принятие DEC-001 — в текущих
  документах вместе с этой передачей, не в этих двух исторических коммитах.

## 6. Оставшаяся работа

- [ ] **Возобновить здесь:** группа3, DEC-016/DEC-017. Прочитать E05/E23/E24,
  исходные DimmerService.java, DimmerOffTimeoutSelectorDialog.java,
  Utils.java и broadcasts/ScreenOnOffBroadCastReceiver.java под Legacy
  BrightnessControlDimmer/src/main/java/net/humblegames/brightnesscontroldimmer/.
  Проверить комментарии/историю/почему. Затем представить обычным текстом
  понятные случаи: повторный выбор negative preset, duration change, отмена/
  сон/доставка timer; четыре screen события против четырёх физических нажатий.
- [ ] Группа4: DEC-008/009/010 — уведомления, стабильный канал, grants по функции,
  предложение убрать принудительное закрытие shade (это выбор, не утверждение
  невозможности на всех API26–30). FGS target37 ещё требует технической проверки.
- [ ] Группа5: DEC-011/018/019/020 —4 виджета, per-ID настройки/исправление
  PendingIntent, временные исключения, fixed list, не переносить unfinished
  custom selector/отключённый Accessibility путь без отдельного решения.
- [ ] Группа6: DEC-024/025/026/027 — помощь/share/en/ru/accessibility, корректные
  обещания, отсутствие secret Premium taps. Restore уже принят, не пересматривать.
- [ ] Группа7: DEC-004/006/007/028 — ranges/steps/presets/editor/visibility/close
  defaults и подготовленный стек. Legacy min21, новый min26: явно обсудить
  выпуск для пользователей API21–25, не менять конфигурацию автоматически.
- [ ] Конкретный MVVM план после согласования. Небольшие проверяемые этапы;
  ранние G01–G08/platform/store/signed migration проверки. Никакой обязательной
  многомодульности/Strategy/Hilt/Room только из желания «современности».
- [ ] До реализации: привести репозитории в согласованное состояние, сохранить
  независимые SHA/ветки/refs и manifest; проверенный полный архив вне копируемых
  папок с .git и нужными ignored/untracked/local settings, учесть секреты локально.
  Проверить возможность восстановления. Git alone не сохраняет все локальные
  файлы. Точные имена tags/branches/путь архива ещё не выбраны.
- [ ] После готового reviewable плана/отката — отдельное разрешение пользователя
  на реализацию. Только затем эксперимент/агенты, проверки и итоговое решение.

## 7. Открытые вопросы и технические решения

Продуктовые вопросы reboot и групп1–2 больше не открыты. Способ OEM совместимости
отложен технически, а само требование принято. Реестр в source-evidence.md
содержит Mi8/POCO F2 Pro/Redmi Note7 и менее определённые сообщения, reflection,
непроверенный hidden method, sysfs и window-only альтернативу. Не пересказывать
его как наши тесты или утверждённые новые API. Legacy вводит метод a4349678 от
2022-02-01 со ссылкой на исходный ответ; точная жалоба BCD не установлена.

Не подтверждены17 DEC:004/006/007/008/009/010/011/016/017/018/019/020/024/025/026/027/028.
В группе3 пока лишь предложения: timer off/initial3h/range30min..24h step30min;
новая negative command (включая повторный выбор того же preset)/duration change
rearm; positive/Auto/off/external sync cancel; expiry→Auto при доступной обработке,
без новой exact-alarm permission/обещания секунды. Защитный gesture — четыре
SCREEN_ON/OFF события, соседние интервалы<=1250ms, не гарантия четырёх нажатий
за суммарные5 секунд. Проверить Legacy и причины перед вопросом пользователю.

G01 raw/OEM/floor/readback, G02 opacity/touch, G03 FGS/Direct Boot/deadline,
G04 exclusions recognition, G05 widgets, G06 store/billing/promotions,
G07 gesture/first run/Auto lifecycle, G08 local AAR/внешние SDK/исторические APK — сверять точные определения
в документах. Ни G, ни наличие fake/UI snapshot не доказывают физический эффект.
Доступность Google аккаунтов/выплат — выпуск/интеграция, не условие MVVM.

## 8. Рабочие правила для следующего чата

- Общение по-русски, спокойно и конкретно. Отмечать закрытый шаг и следующий.
  Пояснять случаи примерами, обращать внимание на реальную сложность/риски.
- Вопросы только текстом в чате, без быстро исчезающих popup форм. Не принимать
  вопрос/молчание за согласие; не переспрашивать уже утверждённое.
- Перед ВСЕМИ подобными предложениями исследовать и что, и почему в Legacy:
  комментарии, вызывающий код, Git, первоисточники. Найденные обходы/устройства/
  неопределённость сохранять всегда. Не копировать нестандартный путь без согласия.
- Не плодить подсистемы ради редких случаев. Технические часы/OEM подробности
  хранить в docs/comments/tests, не перегружать простой интерфейс BCD.
- Latest user decisions важнее старых инструкций/архивных статусов. По каждому
  изменению согласованно обновлять DEC/RULE/SCN/TEST/термины; ID сохранять.
- Перед редактированием проверять Git и AGENTS. Только файлы по задаче; сохранять
  user notes/Obsidian plugins/untracked. Obsidian auto commit/push/pull выключены.
- Коммиты Conventional Commits на английском: сразу после colon+space 🤖;
  в конце отдельным абзацем Committed-by: Codex. Идентичности не менять,
  историю не переписывать, не push. Hooks проверить, не обходить молча.
- Пользователь просит сказать, когда нужен архив. Сейчас не нужен; сообщить
  перед реализацией после согласованного плана/готовности репозиториев.

## 9. Инструменты, команды и проверки

Рабочая среда Windows/PowerShell. Для поиска rg/rg --files. Python доступен;
для кириллицы python -X utf8 -, документы писать UTF-8 без BOM и LF.
functions.exec позволяет независимые read-only проверки объединять; не запускать
параллельные Gradle сборки в одном checkout. AGENTS материалов не требует Android
сборки для docs: проверить diff, локальные ссылки/ID/термины, UTF-8/LF и
staged diff --check. Изменённые JSON парсить, если они есть.

Git чтение status/log работало; diff/staging/commit иногда в sandbox выдавали
«must be run in a work tree». Повтор с require_escalated для конкретного
авторизованного Git действия работал. Это особенность среды, не подтверждение
повреждения репозитория; не переносить её как вечный blocker. Использовали
`git -c core.fsmonitor=false ...`. Временные файлы commit message в TEMP удалены.

Последний навык: C:/Users/mike/.codex/skills/chat-handoff-summary/SKILL.md,
прочитан с checklist. Эта передача соответствует ему. Новый чат/агенты не созданы.
Сайт Stack Overflow /a short permalink иногда не открывался; search/полный URL
давали содержимое. Цитировать исторический original report с оговоркой, для
платформенных утверждений использовать Android Developers/AOSP.

Следующий чат начинает с группы3 и проверки её мотива в Legacy, а не с кодинга,
модернизации, повторного исследования всего приложения или создания архива.

# Инвентаризация поведения Legacy BCD

AS-IS — существующее поведение, TO-BE — желаемое поведение будущей версии. Этот документ содержит только AS-IS. Версия и локальные файлы: [исходное состояние](workflow-progress.md). Проверяемые пути, строки, символы и цепочки: [source-evidence](source-evidence.md). Ниже E-ссылки относятся к этому каталогу.

BCD запрашивает системную ручную/автоматическую яркость, а для отрицательных логических значений добавляет чёрный overlay — окно поверх других приложений. Управление доступно из небольшой панели, notification — уведомления — и четырёх видов widget — виджетов launcher. Есть настройки presets — сохранённых кнопочных значений, таймер, защитное переключение Auto по screen-событиям, исключения overlay, Premium, реклама, справка и share. Статическое исследование подтверждает код запросов и отображения, не физическую яркость и не надёжность фонового выполнения.

## CAP → FEAT → LB

| Capability | Feature и краткое описание | Legacy Behavior |
|---|---|---|
| CAP-001 Управление светом экрана | FEAT-001 ручная шкала и системный запрос (E01–E04) | LB-001–LB-002 |
| CAP-001 | FEAT-002 дополнительное затемнение overlay (E05–E06) | LB-003 |
| CAP-001 | FEAT-003 системный Auto и выход из него (E05,E08) | LB-004, LB-006 |
| CAP-001 | FEAT-004 пошаговое изменение (E02,E08) | LB-005 |
| CAP-001 | FEAT-005 согласование с внешними изменениями ОС (E07) | LB-007 |
| CAP-002 Настраиваемая панель | FEAT-006 presets и редактор (E09–E11) | LB-008–LB-010 |
| CAP-002 | FEAT-007 slider, закрытие, видимость и вход панели (E09,E12,E13) | LB-011–LB-014 |
| CAP-003 Быстрый доступ | FEAT-008 постоянные notification controls (E14–E16) | LB-015–LB-019 |
| CAP-003 | FEAT-009 домашние widgets и конфигурация (E17–E20) | LB-020–LB-026 |
| CAP-004 Состояние и восстановление | FEAT-010 сохранение и первый запуск (E12,E02) | LB-027–LB-028 |
| CAP-004 | FEAT-011 boot, restart и фон (E14,E21,E22) | LB-029–LB-031 |
| CAP-004 | FEAT-012 автоматическое завершение затемнения (E05,E23) | LB-032–LB-035 |
| CAP-004 | FEAT-013 защитное переключение (E24) | LB-036 |
| CAP-005 Доступы и исключения | FEAT-014 получение обязательных разрешений (E25) | LB-037–LB-039 |
| CAP-005 | FEAT-015 временное исключение overlay; две кандидатные ветви (E26–E29) | LB-040–LB-044 |
| CAP-006 Коммерческая доступность | FEAT-016 Premium покупка/restore и доступ (E30–E32) | LB-045–LB-046 |
| CAP-006 | FEAT-017 бесплатное получение через игру (E32,E33) | LB-047 |
| CAP-006 | FEAT-018 banner-реклама (E34) | LB-048 |
| CAP-007 Информация и распространение | FEAT-019 справка, включая скрытый переключатель (E35,E37) | LB-049–LB-050 |
| CAP-007 | FEAT-020 share ссылки приложения (E36) | LB-051 |
| CAP-008 Понятный интерфейс | FEAT-021 локализация и сообщения (E10,E25,E37) | LB-052 |

Все FEAT имеют свидетельства и конкретные LB. LB-043/LB-044 — кандидатные/частичные ветви, не подтверждённый пользовательский выбор списка приложений или активный AccessibilityService. Технические детали без самостоятельной пользовательской ценности вынесены ниже.

## Карточки поведения

В таблицах каждая строка задаёт предусловие/триггер, результат приложения или запрос ОС, хранение/defaults, доказательства и независимую оценку. Общие условия: API23+ код требует WRITE_SETTINGS и SYSTEM_ALERT_WINDOW для всех команд (LB-037); успешность OS/window API не установлена. Если не сказано иначе, настроек разрешений это не отменяет. «Нет отдельного хранения» означает отсутствие отдельного preference у действия, а не отсутствие общего State.

Основание: OBSERVED_IN_CODE — непосредственно в коде; INFERRED — вывод из цепочки; UNCERTAIN — не установлено. Уверенность относится к утверждению строки: HIGH — прямой код и связанный вход, MEDIUM — вывод/конфликт между путями, LOW — недостаточно оснований. Признаки независимы: RUNTIME_VALIDATION_REQUIRED далее сокращено RV; POSSIBLE_BUG — PB; PARTIAL_IMPLEMENTATION — PI; DEAD_OR_UNREACHABLE_CANDIDATE — DC; OBSOLETE_PLATFORM_BEHAVIOR_CANDIDATE — OC. Это кандидаты, а не диагноз выполненной программы.

| LB / FEAT | Предусловие, триггер → результат | Состояние/defaults; Android | Доказательства, основание, признаки, confidence и неопределённость |
|---|---|---|---|
| LB-001 / FEAT-001 | Пользователь выбирает числовой p; UI ограничивает -75..100, Auto отдельный sentinel | Main slider progress=p+75; saved KEY_PREVIOUS_BRIGHTNESS_VAL | E01,E02,E09; OBSERVED_IN_CODE; PB; HIGH: UI и clamp явны, validator с OR принимает произвольные int из других входов |
| LB-002 / FEAT-001 | p>=0 → manual и raw=floor(M*max(p,5)/100) | M reflection/fallback255; p=0 и5 дают raw12 при M255 | E02–E05; OBSERVED_IN_CODE; RV; HIGH для запроса, не luminance; helper round не активная формула |
| LB-003 / FEAT-002 | p<0 → manual floor5%, add чёрное окно, alpha=round(abs(p)*255/100) | max191; TYPE_APPLICATION_OVERLAY26+, params.alpha дополнительно на31+ | E03,E05,E06; OBSERVED_IN_CODE; RV; HIGH для операций; совокупный visual alpha на31+ только INFERRED, физическое затемнение неизвестно |
| LB-004 / FEAT-003 | Auto на панели/notification/widget → OS Auto, remove overlay, cancel timer | Numeric State p остаётся прежним; widget получает sentinel перед запросом | E05,E08; OBSERVED_IN_CODE; PB,RV; HIGH: отдельная ветка; принятие ОС неизвестно |
| LB-005 / FEAT-004 | +/- с signed step → p'=clamp(p+step,-75,100), manual/dim по знаку | Main/notification default5, widget10; saves numeric | E01,E02,E08; OBSERVED_IN_CODE; HIGH для арифметики; malformed вход не гарантирован |
| LB-006 / FEAT-003 | +/- после Auto использует оставшееся numeric p State, не sentinel | Может быть предыдущий manual либо обновлённый observer p; методы не равны display | E02,E05,E07,E08; OBSERVED_IN_CODE; PB,RV; HIGH для базы метода, её актуальность зависит от callback порядка |
| LB-007 / FEAT-005 | Внешний mode/raw change при sync=true → State/controls update, remove overlay, при raw cancel timer/save | pref_key_sync_with_system_brightness=true; собственный один callback подавляется marker | E07,E08,E12; OBSERVED_IN_CODE; PB,RV; HIGH для ветвей; Auto-mode branch не делает все raw-branch операции |
| LB-008 / FEAT-006 | Tap 8 main presets → их значение, long tap → редактор | KEY_BTN_0_VALUE..7; defaults -75,-50,-25,0,25,50,75,100; KEY_BTN_8_PLUS_MINUS_VALUE=5 | E01,E09,E10; OBSERVED_IN_CODE; HIGH; gate описан LB-046 |
| LB-009 / FEAT-006 | Editor: Done integer в диапазоне → save; empty Done/Cancel → unchanged; invalid → ошибка, остаётся editor | presets -75..100 (min preference читатель, writer не найден), steps1..50; applies later | E10; OBSERVED_IN_CODE; HIGH; min customization не доказана |
| LB-010 / FEAT-006 | Notification editor меняет 4 shared значения для notification widget/notification | KEYS_NOTIFICATION_OR_LOCK_SCREEN_BTNS_VALUES; defaults -75,-25,25,75; step5 | E01,E08,E11,E17; OBSERVED_IN_CODE; HIGH; XML summary другой, runtime labels задаются кодом |
| LB-011 / FEAT-007 | User drag slider → немедленные команды каждого changed progress | -75..100; не требует отпускания, Auto slider иногда beforeAuto | E09,E12; OBSERVED_IN_CODE; RV; HIGH для callback, animation/device не проверены |
| LB-012 / FEAT-007 | close_on_select=true +fixed/Auto → finish; slider/+/- не закрывают | pref_close_on_select=false; не выключает service | E09,E12; OBSERVED_IN_CODE; HIGH, также часть старых тестов E39 |
| LB-013 / FEAT-007 | Visibility prefs скрывают slider/rows/checkbox row; всё основное скрыто → hint | pref_show_* true; +/- зависит от row3; некоторые premium-gated | E11,E12; OBSERVED_IN_CODE; HIGH; это настраиваемая доступность, не требование точной сетки |
| LB-014 / FEAT-007 | Launcher/widget/content intent → singleTask Main, компактная translucent панель; Back finish | Manifest launchMode, lifecycle, ограничение ширины600dp | E12,E13; OBSERVED_IN_CODE; RV; HIGH для declaration, не фактическое поведение task ОС |
| LB-015 / FEAT-008 | show icon on → startForeground/ongoing; off → stopForeground(true) | pref_show_icon=false; early foreground на26+ до gate; долговечность не доказана | E14,E15; OBSERVED_IN_CODE; OC,RV; HIGH; background restrictions P06 |
| LB-016 / FEAT-008 | Notification controls: четыре presets, Auto, +/-; текст/маленький numeric icon; tap body→Main | Shared prefs; icon p/Auto map fallback launcher | E01,E08,E14,E17; OBSERVED_IN_CODE; PB,RV; HIGH; numeric p может противоречить Auto mode |
| LB-017 / FEAT-008 | icon enable форсирует HIGH; preference HIGH/LOW/MIN; channel пересоздаётся timestamp | pref_notification_importance HIGH; silent/public/ongoing | E14,E15; OBSERVED_IN_CODE; PB,RV; HIGH; не доказан итог после user channel override P05 |
| LB-018 / FEAT-008 | non-step notification click +shade option → CLOSE_SYSTEM_DIALOGS только<31 | pref_show_close_notification_shade_on_click=false; option скрыта31+ | E16; OBSERVED_IN_CODE; OC,RV; HIGH; не обещание закрытия системного UI P03 |
| LB-019 / FEAT-008 | Enable icon, а также permission wizard после WRITE grant → request POST_NOTIFICATIONS с guard>=31; icon denial toast, bool всё равно true | Permission реально с33; preference и grant различаются; wizard запрашивает один раз на instance | E13,E16,E25; OBSERVED_IN_CODE; PB,RV; HIGH; flow31/32 некорректен по P04 |
| LB-020 / FEAT-009 | Value widget update→Auto из ОС либо saved numeric; tap→Main | fallback OS при saved missing(-100), updatePeriod0 | E17,E18; OBSERVED_IN_CODE; RV; HIGH; stale saved vs ОС возможно |
| LB-021 / FEAT-009 | Notification widget 4presets/Auto/+/- и text, запускает service intents | Values общие; saved default0; update intent static101 fallback | E17,E18; OBSERVED_IN_CODE; PB,RV; HIGH; разные fallback и mode presentation |
| LB-022 / FEAT-009 | Horizontal/vertical +/- widgets, optionally Auto, resize/update через provider | Per-instance step; home/keyguard categories; daily update | E18–E20; OBSERVED_IN_CODE; RV; HIGH; launcher support не проверен |
| LB-023 / FEAT-009 | Configure: step1..50/default10, opacity15..100 через5/default100, Auto defaultfalse | step/opacity named WIDGET_PREFS; Auto separate prefs per-ID пишется сразу | E01,E19,E20; OBSERVED_IN_CODE; PB; HIGH; cancel не атомарен |
| LB-024 / FEAT-009 | Два widgets с разными step могут выполнять step последнего update | requestCode/action совпадают, extras не identity | E19,E20; INFERRED; PB,RV; MEDIUM: требуется воспроизведение PendingIntent collision |
| LB-025 / FEAT-009 | Delete +/- widget удаляет только step preference | opacity/Auto остатки остаются | E18,E19; OBSERVED_IN_CODE; PB; HIGH: callback прямой, переиспользованиеID не проверено |
| LB-026 / FEAT-009 | Legacy global Auto preference fallback; keyguard layout branch API17..20 | Новый per-ID bool; legacy min21 делает особую keyguard ветвь недостижимой | E20,E38; OBSERVED_IN_CODE; DC,OC; HIGH для predicate; category сама не доказательство lockscreen поддержки |
| LB-027 / FEAT-010 | pause/destroy/action сохраняют разные numeric/sentinel; reopen manual повтор saved, OS Auto запускает Auto | KEY_PREVIOUS_BRIGHTNESS_VAL; KEY_BRIGHTNESS_VAL_BEFORE_AUTO; Saved State и Activity конкурируют | E02,E05,E12,E14; INFERRED; PB,RV; MEDIUM: итог зависит от порядка lifecycle; нет единого достоверного режима в prefs |
| LB-028 / FEAT-010 | First start после permission → Auto и help, flag false | KEY_IS_FIRST_START defaulttrue; последующие открывают restore | E12,E35; OBSERVED_IN_CODE; RV; HIGH для кодовой последовательности |
| LB-029 / FEAT-011 | BOOT_COMPLETED → service command→Auto независимо saved | Manifest boot; startForegroundService26+, no opt-in | E14,E21; OBSERVED_IN_CODE; OC,RV; HIGH для request, доставку/разрешённость не доказывает |
| LB-030 / FEAT-011 | Возвращает START_REDELIVER_INTENT; возможная повторная доставка команды после kill | Процесс/ОС решают; reapply negative может сбросить timeout | E05,E14; INFERRED; RV; MEDIUM: return code прямой, реальный restart не установлен; force-stop не равен kill |
| LB-031 / FEAT-011 | Uncaught exception→попытка restart через alarm +100ms и kill | No opt-out, RTC non-wakeup; PendingIntent flags потенциально проблемны31+ | E22; OBSERVED_IN_CODE; PB,OC,RV; HIGH для вызовов, не успешного восстановления |
| LB-032 / FEAT-012 | Enable timeout checkbox пишет enabled; selector index→duration | defaultoff, index5=3h, release30..1440min через30; selector gated | E01,E05,E11,E15,E23; OBSERVED_IN_CODE; HIGH; checkbox и hidden enabled отдельные ключи |
| LB-033 / FEAT-012 | Каждый set negative переустанавливает timer; positive/Auto cancel | Preference change повторяет saved p; повторкоманда сдвигает deadline | E05,E15; OBSERVED_IN_CODE; PB; HIGH: rearm explicit, сохранение deadline не найдено |
| LB-034 / FEAT-012 | Inexact timer delivery→Auto; sleep may delay; debug существенно ускорен | Release index+1 получасы, debug index+1 секунды; non-wakeup | E08,E23,P07; OBSERVED_IN_CODE; RV; HIGH для request; точное время ОС неизвестно |
| LB-035 / FEAT-012 | Dismiss selector без progress callback может передать null и вызвать unboxing failure | Integer progress не инициализирован явно, prefs прежние либо crash | E23; OBSERVED_IN_CODE; PB,RV; HIGH для nullable цепочки; конкретный onProgressChanged порядок надо воспроизвести |
| LB-036 / FEAT-013 | 4 screen ON/OFF events с интервалом соседних<=1250ms → Auto | count reset; нет проверки alternating/кнопки, total5s не используется | E24,E37; OBSERVED_IN_CODE; PB,RV; HIGH для event predicate; help описывает аппаратную кнопку шире |
| LB-037 / FEAT-014 | Любая команда/Main требует одновременно WRITE_SETTINGS и overlay special access | API23+, manifest; без них открывается permission UI/finish | E13,E14,E25; OBSERVED_IN_CODE; RV; HIGH для gate; реальные restrictions background Activity P06/P09 |
| LB-038 / FEAT-014 | Write access request→system settings; missing Activity→общие настройки; отказ→выход | Grants проверяются повторно, не по resultCode | E25; OBSERVED_IN_CODE; RV; HIGH; успешная выдача не наблюдалась |
| LB-039 / FEAT-014 | Return overlay screen without grant→до10s wait; granted cancel wait; then дальнейший flow | WAIT_OVERLAY_PERMISSION_MILLIS=10000; no persisted permission assumed | E25; OBSERVED_IN_CODE; RV; HIGH для timer; OEM задержка не доказана |
| LB-040 / FEAT-015 | Enable exclusions без Usage access→объяснение/system page; denied unchecked | Defaultfalse; AppOps PACKAGE_USAGE_STATS, broadcast start/stop | E11,E26; OBSERVED_IN_CODE; RV; HIGH для handler, enable on resume нужно проверять |
| LB-041 / FEAT-015 | Poll каждые1500ms: last-used package из daily stats сопоставляется fixed5 | Errors→empty; нет persisted customlist; видимое foreground не гарантировано | E26,E27,P08; INFERRED; RV; MEDIUM для определения foreground; код выбора непосредственно просмотрен |
| LB-042 / FEAT-015 | Excluded open→remove overlay; closed→add, даже после positive/Auto | mode/p predicate отсутствует; LocalBroadcast state dedup | E05,E27; OBSERVED_IN_CODE; PB,RV; HIGH для callback, реальный экран зависит от alpha/window |
| LB-043 / FEAT-015 | Debug TestTools opens installed-app list; визуальные checked rows не сохраняют выбор | Declared Activity, нет click/save/связи watcher | E28; OBSERVED_IN_CODE; PI; HIGH для отсутствующей цепочки; это не законченная custom исключения feature |
| LB-044 / FEAT-015 | Accessibility альтернативное исключение Google Play в классе, Android binding не объявлен | Manifest/service/settings commented; TestTools startService не заменяет binding | E13,E28,E29; OBSERVED_IN_CODE; DC,PI; HIGH для конфигурации этой версии, не для всех исторических версий |
| LB-045 / FEAT-016 | Startup/query/restore сверяет покупки; successful purchase grants/ack; pending не grants | SKU premium_upgrade, IS_PREMIUM cache; query acknowledgedSKU, failure cache не меняет | E30,E31; OBSERVED_IN_CODE; PB,RV; HIGH для flow; внешняя billing correctness и старые лицензии неизвестны |
| LB-046 / FEAT-016 | Без premium некоторые изменения disabled; premium включает editor/timeout/main visibility/notification editing | Cache OR game installed; часть settings free; main no active banner construction | E10,E11,E32; OBSERVED_IN_CODE; HIGH для отдельных gates; не все настройки платные |
| LB-047 / FEAT-017 | Установленная промо-игра даёт UI premium; store/install/open действия, remote flag скрывает рекламу возможности | Default remote false, grant OR не зависит от flag | E32,E33; OBSERVED_IN_CODE; PB,RV; HIGH; package visibility/серверный config не наблюдались |
| LB-048 / FEAT-018 | Editor/settings создают banner loader; load error hide; premium hide container | Debug/production ad unit; скрытие не гарантирует no network; Main construction commented | E34,E32; OBSERVED_IN_CODE; RV; HIGH для lifecycle, ads выдача не установлена |
| LB-049 / FEAT-019 | Help first/manual, 6 active pages, next/done/link text | Первый флаг общий; inactive layouts0/7 отдельно | E12,E35,E37; OBSERVED_IN_CODE; HIGH; текст не доказательство поведения ОС |
| LB-050 / FEAT-019 | Secret taps на help: count7 premium true,10 false | IS_PREMIUM persists; fragment creation resetcounter | E35,E30; OBSERVED_IN_CODE; PB; HIGH: XML callback подтверждает достижимость, не deadcode |
| LB-051 / FEAT-020 | Share→ACTION_SEND text/plain store link+subject chooser | BuildSpecificConst debug/googleplay Google Play, Amazon source другойURL | E36,E38; OBSERVED_IN_CODE; RV; HIGH для Intent, Amazon variant не настроен, share test placeholder |
| LB-052 / FEAT-021 | Default English/Russian strings, localized input/permissions/help/error messages | Locale ОС/resource selection; integer/range errors | E10,E25,E37; OBSERVED_IN_CODE; HIGH для ресурсов; корректность всех переводов и accessibility runtime не проверены |

## Противоречия и кандидаты ошибок

- Active raw floor и helper Math.round различаются; отрицательное p запрашивает floor5%, старые тесты raw0 (E02–E04,E39). Нельзя выбрать тест как спецификацию.
- Auto хранится и показывается неодинаково в Activity/Service/widgets (LB-004,006,007,016,027). Own-write boolean не обеспечивает согласованность нескольких callbacks.
- Main/notification presets различаются; XML summaries не текущие defaults (LB-010). Неподтверждённый writer минимального уровня не делает min preference пользовательской настройкой.
- Timeout debug и release имеют разные единицы; no-change dialog null; re-delivery может продлить dimming (LB-030,033–035).
- Exclusion restore add без mode guard; collision нескольких widgets; ранняя запись Auto в configuration и неполный delete (LB-023–025,042).
- Help обещает неубиваемый service и аппаратные press/5s; код этого не доказывает. Notifications не обеспечивают иммунитет от kill (P06).

## Частичные, недостижимые и устаревшие кандидаты

Custom app selection — PI, а не доказанная работающая возможность; debug вход найден. AccessibilityService — DC по manifest этой версии. Keyguard branch17..20 — DC при min21, но это не вывод о всех современных lockscreen hosts. Amazon source set не выбран настроенными build variants. Deprecated shade broadcast, pre26 window type и crash restart flags требуют платформенной оценки; исчезновение workaround не равно отказу от управления/восстановления.

## Технические наблюдения

E31: нет законченной signature validation покупки; неиспользуемый старый handler не описывает active handler. E40: Timer/LocalBroadcast cleanup, возможные malformed/null Intent failures, dormant workaround threads, square dimensions; service может setup window до проверки grants. E41: telemetry/Crashlytics/logger и UUID не самостоятельные Features. Auxiliary icon generator создаёт numeric assets; HumbleLogger — библиотека логирования. Нет production provider, shortcut или самостоятельной scheduler-системы, найденной в manifest/вызовах; единственный пользовательский alarm — timer, дополнительно технический crash restart.

## Неопределённости

48 LB имеют HIGH, 4 MEDIUM (LB-024,027,030,041), 0 LOW. Это уверенность в перечисленных статических утверждениях, не в исправности приложения. Runtime и discovery gaps: [discovery-coverage](discovery-coverage.md). На этапе инвентаризации решения для новой версии не принимались и Gherkin не создавался.

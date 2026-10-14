# Техническая реализуемость переписывания BCD

Дата сверки:2026-10-14. **Завершена оценка по исходникам и первичным документам;
работоспособность будущей реализации на Android и принятие магазином не проверены.**
Это результат следующего шага после принятия группы7, основание будущего плана
MVVM и ранних проверок. Не утверждённый manifest/код и не изменение поведения.
Все30 DEC подтверждены в оговорённом объёме; Q-001/Q-002/группы1–7 не открываются
заново. Опасные опыты ниже защитного порога DEC-030 не разрешены.

[Глоссарий](glossary.md), [решения](behavior-decisions.md),
[правила](product-specification.md), [источники Legacy](source-evidence.md),
[пробелы проверки](discovery-coverage.md), [план TEST](test-plan.md),
[этапы подготовки](../workflows/full-rewrite-preparation.md).

## Опора и границы

- Материалы до оценки:7bfd05607f558627bd0ec63e486f83b7eae3da43, main.
- Legacy:cd7696cd04705fa48a2c115addf98ae6191bfdd9, develop.
- Новый проект:83fa6da3a61fdcb8301e97396f0034e7ee07f270, codex/project-modernization.

`J/` ниже — Legacy `BrightnessControlDimmer/src/main/java/net/humblegames/brightnesscontroldimmer/`;
`R/` — его `src/main/res/`. Пути нового проекта названы отдельно.
Точные методы важнее исторических номеров строк.
SDK/Gradle/зависимости, приложение и Legacy не менялись; ветки, архивы и
новые агенты не создавались. Ничего не устанавливалось на устройства;
Play Console/AdMob accounts, покупки, сертификаты выпуска и внешние конфигурации
не проверялись. Существующие template/CI тесты не доказательство функций BCD.

**Общий вывод:** публичные пути для основной модели управления найдены.
Подготовленный min26/target37/Compose стек не требует нового обновления для
перехода к планированию. Автоматическое восстановление, OEM совместимость,
распознавание исключений и совместимый upgrade остаются обязательными
проверками первой экспериментальной стадии. Универсальная реализация не доказана.

| Область | Результат оценки | Что остаётся непроверенным |
|---|---|---|
| Ручная яркость/Auto | Публичные Settings.System, доступ WRITE_SETTINGS; запись не требует сети | Реальный mode/raw, частичный отказ, OEM шкала и readback |
| Длительное затемнение | TYPE_APPLICATION_OVERLAY и FGS specialUse — обоснованный кандидат | Параметры окна/касания, разрешённые запуски, Play review |
| Boot/unlock | Direct Boot + минимальные доступные до unlock данные + отдельное восстановление после unlock | Доступ к Settings до unlock, OEM события/ограничения, clock trust |
| Таймер/защита | Non-wakeup inexact alarm, проверка актуальности операции; screen receiver действующей сессии | Доставка после сна, stop/kill, потеря событий, отсутствие stale effects |
| Исключения | UsageEvents — кандидат вместо DAILY latest-stat эвристики | Достоверность распознавания в реальных fixed5/многооконности |
| Данные/upgrade | Два Legacy хранилища и ключи доступны для контролируемого импорта | Совместимая подпись, versionCode, идемпотентность/fixtures |
| Виджеты | RemoteViews, отдельные identity действий, сохранение provider identities | Launcher upgrade/restore IDs, старые действия, памятьAPI37 |
| Каналы | Переиспользование канала сохраняет настройки; можно перечислить старые | Выбор при нескольких противоречащих каналах, правила переноса |
| Premium/Ads | Старый product ID сохранён; современный Billing restore документирован | Происхождение old flag, store environment, SDK integration/account |

## 1. Сервис и законные входы

Legacy `J/service/DimmerService.java` начинает foreground на26+ без FGS type;
в новом `app/src/main/AndroidManifest.xml` пока только шаблонная Activity.
`J/broadcasts/StartOnBootServiceReceiver.java` хранит мотив перехода на
startForegroundService после Android8 background-start crash. Его комментарий
о JobIntentService не доказывает пригодность этого механизма для длительного окна.

Официальный тип **specialUse** предназначен для обоснованных FGS случаев вне
прочих типов; manifest требует FOREGROUND_SERVICE и FOREGROUND_SERVICE_SPECIAL_USE,
тип и PROPERTY_SPECIAL_USE_FGS_SUBTYPE. Нужны описание случая и review Play.
Это кандидат для продолжающегося по выбору пользователя dim, а не готовое
разрешение магазина. shortService с примерно3min не соответствует длительному
затемнению; mediaProjection требует иного пользовательского действия и назначения.
Нет оснований объявлять BCD systemExempted или подменять задачу dataSync.
[Типы FGS](https://developer.android.com/develop/background-work/services/fgs/service-types).

| Событие | Предлагаемый технический путь, ещё не испытанный |
|---|---|
| Main: явное действие | Проверить grants; короткая запись manual/Auto отдельно от запуска длительной negative сессии |
| Нажатие notification/widget | Документированное исключение фонового старта FGS; явный адресат и актуальная операция |
| LOCKED_BOOT_COMPLETED | Короткая ранняя обработка только доступных данных/guard; не создавать overlay |
| BOOT_COMPLETED после первого unlock | Проверить policy/deadline/grants и разрешённый boot-start для выбранного типа |
| USER_UNLOCKED | Событие проверки состояния; само не считать отдельной гарантией права startForegroundService |
| Timer | Завершение актуальной операции; не создавать новый FGS из inexact alarm без законного основания |
| Пересоздание/повтордоставка | Продолжение только актуальной допустимой сессии, без новой команды/rearm |
| Force-stop/системная остановка | Не организовывать циклический restart; поздний вход отражает фактическое состояние |

На target35+ один SAW grant не даёт фонового исключения: нужен уже видимый
overlay. Boot и действия пользователя имеют отдельные основания. Поэтому
нельзя восстановить отсутствующее окно, обосновав старт лишь разрешением на
него, или искусственно создавать пустое окно ради обхода ограничений.
[Фоновые старты](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start),
[изменения FGS](https://developer.android.com/develop/background-work/services/fgs/changes).

Будущий план должен определить срок жизни сервиса также при Auto/manual,
включённых быстрых controls и suspended overlay: требование обновления surfaces
не доказывает право держать произвольный постоянный FGS. WorkManager не является
автоматической заменой владельца непрерывного окна. Начальная рекомендация —
обосновать минимальную фактическую работу и ранний stop после её завершения,
отделив наблюдение/refresh от новых light commands. Подробности ещё не выбраны.

Для Play нужны описание основной функции/последствий задержки, доказательство
пользовательского управления и демонстрация; approval не получается из одного
manifest. [Play FGS requirements](https://support.google.com/googleplay/android-developer/answer/13392821),
[FGS policy](https://support.google.com/googleplay/android-developer/answer/18258653).
Эти операционные проверки не мешают составить архитектурный план.

## 2. Единая opacity, касания и OEM яркость

Legacy `J/screen/overlay/OverlayDrawer.java` задаёт Paint alpha и на31+ дополнительно
window alpha=maximum obscuring opacity; исключения добавления/снятия только
логирует. Это не основание объявлять effect успешным в новом состоянии.
Исторические мотивы и согласованное изменение силы сохранены E03/E06/DEC-002.

Кандидат: одно non-focusable/non-touchable TYPE_APPLICATION_OVERLAY окно,
полностью чёрное непрозрачное содержимое, требуемый alpha в **LayoutParams.alpha**.
Тогда визуальная шкала и учитываемая Android оконная opacity согласованы.
Оставить window alpha=1 и менять только Paint нельзя считать достаточным
для передачи касаний на31+. Для p=-75 alpha=191/255≈0.749; публичный стандартный
порог0.8 выше этого, но читать фактический порог устройства. Два таких окна
одного UID дают combined opacity≈0.937 — повторное окно способно нарушить касания.
Это арифметическое основание одного владельца/дедупликации, не испытание экрана.
[LayoutParams/FLAG_NOT_TOUCHABLE](https://developer.android.com/reference/kotlin/android/view/WindowManager.LayoutParams).

ОС/другое приложение могут скрывать overlay; требование не включает обход
protected окон. [Window.setHideOverlayWindows](https://developer.android.com/reference/android/view/Window#setHideOverlayWindows(boolean)).
Проверить rotation, IME/system области, multiwindow, скрытие/revoke и фактическое
достижение касаний; не добавлять Accessibility способ обхода. Установленный отказ
окна/unsafe opacity даёт принятый отказ/partial, без молчаливого уменьшения alpha.

Для manual/Auto публичны canWrite/getInt/putInt Settings.System. Mode и raw —
разные записи, не одна атомарная транзакция; проверять результат и readback,
не показывать успех только после вызова. [Settings.System](https://developer.android.com/reference/kotlin/android/provider/Settings.System).
ContentObserver не возвращает полный результат операции; собственные callbacks
нужно согласовать с ожидаемой записью и прочитанным состоянием, а не подавить
следующее событие булевым флагом независимо от источника.
[ContentObserver](https://developer.android.com/reference/android/database/ContentObserver).

Legacy `MaxMinBrightness.java` отражает BRIGHTNESS_ON; мотив нестандартных
Xiaomi шкал уже установлен, актуальность для новых прошивок неизвестна.
Публичный default255 сохраняется, способ OEM совместимости не выбран.
Non-SDK ограничения не позволяют объявить reflection универсальным решением.
[Non-SDK](https://developer.android.com/guide/app-compatibility/restrictions-non-sdk-interfaces).
Без проверки шкалы нельзя назвать raw12 универсальным5%; G01/G02 и TEST-048
остаются открытыми. Ниже принятого floor испытания не выполняются.

## 3. Boot, хранилища и достоверность срока

Legacy использует обычные SharedPreferences, BOOT_COMPLETED receiver не
directBootAware. `J/app/App.java:onCreate` начинает Billing/query при любом
создании процесса. Эти пути нельзя просто объявить доступными до unlock.

Direct Boot предоставляет DE (device encrypted) хранилище до первого unlock;
обычное CE (credential encrypted) становится доступным после него.
Кандидат — encryption-aware receiver и небольшой отдельный DE snapshot
только необходимого boot состояния: policy, цель/restore flag, сведения о сроке
и актуальности. Billing/Ads/обычное CE storage не инициализировать в раннем пути.
Не переносить туда целиком preferences/покупки; startup Application тоже должен
уважать границу. Boot после unlock/проверка isUserUnlocked — отдельный этап.
[Direct Boot](https://developer.android.com/privacy-and-security/direct-boot).

Сам directBootAware не доказывает доступ к Settings provider/AppOps конкретной
прошивки до unlock. Ранний guard проверяется отдельно от restore policy;
Auto/raw>=12 не меняются самим guard, raw<12 поднимается лишь при доступной
достоверной manual записи, как принято. Отсутствие события/доступа не разрешает
придумать гарантию первого кадра или loop.

В одной загрузке elapsedRealtime монотонен и включает сон; currentTimeMillis
может измениться, elapsedRealtime начинается заново после reboot.
Кандидат для плана: хранить deadline в UTC плюс монотонный deadline/контрольные
сведения той загрузки; в той же загрузке использовать монотонную базу,
после reboot оценивать пригодность сохранённого срока, никогда не прибавлять
полную duration заново. [SystemClock](https://developer.android.com/reference/android/os/SystemClock).
BOOT_COUNT доступен с24 как возможный маркер загрузки, не доказательство
достоверного UTC. [Settings.Global](https://developer.android.com/reference/android/provider/Settings.Global).

**Остаётся алгоритмический gate:** определить, какие данные подтверждают/опровергают
пригодность межзагрузочного срока. AUTO_TIME=true само не доказывает точное время;
нет универсального доказанного offline способа обнаружить все коррекции часов
пока процесс/телефон не работал. При установленной недостоверности следовать
RULE-046 без восстановления прежнего dim, а не считать срок достоверным по
одному сравнению. Принятые часы/boot политики не пересогласовываются;
порог clock проверки, целостность записи и последовательности отказов надо
определить в плане до кода. Обязательная сеть для manual/Auto/dim не вводится.

Совместимый upgrade Legacy не содержит сведений нового надёжного deadline:
старый duration не время окончания. Не выводить новую active сессию из прежнего
числа/включённого checkbox. DE runtime snapshot не должен оживать после переноса
данных на другой телефон или восстановления старого backup.

## 4. Таймер, остановка процесса и screen-события

Legacy `Utils.setDimmerDeactivationAlarm` использует non-wakeup ELAPSED_REALTIME
с service PendingIntent. Публичный set остаётся inexact; alarm не будит экран
и очищается после reboot. Кандидат — явный broadcast PendingIntent для
короткой обработки expiry и сверки ID актуальной операции; ближайший alarm
переназначать на оставшийся срок, а не новую duration. Foreground service/overlay
могут завершаться через уже живого владельца; отсутствие его не даёт права
запускать новый FGS из любого inexact alarm.
[AlarmManager](https://developer.android.com/reference/android/app/AlarmManager).

Нужен один последовательный обработчик команд и метка актуальности (generation):
new user negative, Cancel/Auto, external sync, expiry и новый boot не конкурируют
за старый эффект. Перед записью/restore/expiry сверять актуальность; durable
состояние должно различать accepted request, active observed окно и факт остановки.
Это техническая рекомендация исполнения RULE-025/027/028, не выбранные классы MVVM.

Android13 Task Manager Stop удаляет процесс без обычного callback, но scheduled
jobs/alarms могут сохраниться. Это отличается от force-stop. При новом входе
надо проверять факт пользовательской остановки (доступный ApplicationExitInfo),
а не восстанавливать runtime по persisted active=true. Поздний alarm тоже
должен пройти проверку актуальности/stop, а не превратиться в restart dim.
[User stopping](https://developer.android.com/develop/background-work/services/fgs/handle-user-stopping).
Если безопасно определить прежнюю сессию нельзя, не объявлять её работающей.
Конкретная обработка оставшегося expiry после Stop требует переходов в плане.

Screen ON/OFF receiver Legacy зарегистрирован динамически в service. Новая
защита остаётся зависимой от получения событий живым runtime; использовать
монотонные timestamps и guard актуальной negative сессии. После stop доставки
нельзя обещать, а физические4press/5s уже исключены. Рекомендация не требует
нового Accessibility listener или постоянного wake lock.

## 5. Исключения: проверяется распознавание, а не только reducer

Legacy `ForegroundAppChecker` выбирает greatest lastTimeUsed из DAILY stats;
при null может брать первый running process. Ни один путь не доказывает
видимость нужного пакета. Watcher1500ms также имеет неизбежное окно задержки.
Это историческая реализация, не причина отменить принятую optional функцию.

Кандидат — UsageStatsManager.queryEvents(begin,end) с сохранённой границей
чтения/перекрытием для дедупликации; доступ PACKAGE_USAGE_STATS и AppOps проверить.
С30 при isUserUnlocked=false (ещё не было первого unlock после загрузки)
может вернуться null; это unknown, не exit. Обычная блокировка экрана после
первого unlock не равна этому состоянию пользователя.
[UsageStatsManager](https://developer.android.com/reference/kotlin/android/app/usage/UsageStatsManager).
На29+ есть ACTIVITY_RESUMED/PAUSED/STOPPED; на26–28 нужны соответствующие
старые события. Resume не равно единственному top window в multiwindow;
нельзя возвращать overlay по произвольному последнему событию.
[UsageEvents.Event](https://developer.android.com/reference/android/app/usage/UsageEvents.Event).

Правила unknown/revoke/suspended/deadline уже приняты. Не включать Accessibility
или custom selector; fixed5 остаётся прежним, без подстановки OEM package names.
Нужен реальный набор приложений/прошивок; отсутствие конкретного fixed package
на тестовом устройстве отмечать как непроверенную ветвь. Ошибка detector не
должна считаться выходом. Вначале измерить полезность при обычном переходе,
затем быстрые переходы/lock/многооконность/expiry/revoke. Если это не работает,
G04 не закрывать fake тестом; отдельный пересмотр после результатов, не сейчас.

## 6. Миграция: две группы данных и совместимый APK

В новом проекте applicationId совпадает с Legacy, но **versionCode1 против
Legacy49** (`app/build.gradle.kts:48` и Legacy `BrightnessControlDimmer/build.gradle:37`).
Обычный install upgrade с меньшим номером не подходит; будущий номер должен
быть выше реально опубликованного maximum, который здесь не установлен.
Ни50, ни любой другой номер пока не выбран. [Versioning](https://developer.android.com/studio/publish/versioning).

Нужна совместимая app-signing identity/допустимая lineage. Upload certificate
Play не равен app-signing certificate установленного APK; debug-подпись не
доказательство update с Play. [App signing](https://developer.android.com/studio/publish/app-signing).
Получение подходящего артефакта/публичных certificate fingerprints — gate
настоящего TEST-046/053, а не запрос приватного ключа или пароля в документацию.
Переустановка с удалением данных/обход downgrade не проверяет принятый upgrade.

| Источник Legacy | Содержимое для будущего импорта | Ограничение |
|---|---|---|
| PreferenceManager.getDefaultSharedPreferences | Main KEYS_BTNS_VALUES:8 presets +step | Не смешать с общими4; сохранить числовые negative |
| То же хранилище | KEYS_NOTIFICATION_OR_LOCK_SCREEN_BTNS_VALUES:4 +step | Общие notification/controls widget, не отдельные widget steps |
| То же | pref_show_seekbar/rows/+/−/checkbox, close/icon/sync/exclusions | Сохранить валидные опции, не выполнять команду света |
| То же | KEY_DIMMER_DEACTIVATION_TIMEOUT, checkbox и hidden enabled key | Release index0..47 означает30min..24h; конфликт двух enabled ключей проверить fixtures |
| То же | KEY_PREVIOUS_BRIGHTNESS_VAL / BEFORE_AUTO, sentinel | Число не доказательство текущего режима/active сессии |
| То же | global/per-ID KEY_WIDGET_PLUS_MINUS_SHOW_AUTO | Принятый порядок explicit per-ID >global >false |
| Named prefs net.humblegames.brightnesscontroldimmer.Widget | appwidget_<id>, appwidget_transparency_<id> | Шаг/оформление; Auto находится в другом хранилище |
| Default prefs IS_PREMIUM | Legacy boolean права | Происхождение по одному bool неизвестно, не стирать оплату при unknown |

Default store создан AndroidX PreferenceManager, named store указан Const;
не искать только named widgets файл. [PreferenceManager](https://developer.android.com/reference/androidx/preference/PreferenceManager).
Проверить точные filename/типы на fixtures выбранного Legacy артефакта.
Рекомендация: читать исходное без очистки, валидировать по полям, durable запись
нового состояния и контрольную метку импорта завершать согласованно. Повторное
открытие/краш посреди импорта не должны повторить свет или потерять исходные значения.
Новый storage engine/схема ещё выбираются в MVVM плане, DataStore не установлен.

`allowBackup=true` стоит в обеих конфигурациях; новый проект содержит только
шаблонные backup_rules/data_extraction_rules. Не полагаться на эти placeholders:
пользовательские настройки отделить от runtime deadline/operation markers,
grant snapshots, привязанных widget IDs и подтверждений покупки. Backup/restore
на новом устройстве не то же, что update на прежнем.
[Auto Backup](https://developer.android.com/identity/data/autobackup).
Политику переносимых данных согласовать в плане, не отключать backup молча.

## 7. Виджеты и уведомления при обновлении

Manifest Legacy содержит четыре provider component identities под `.widget`.
Новое Compose UI само их не заменяет. Кандидат — сохранить эти identities
совместимыми entry points либо доказать поддерживаемый переход; RemoteViews
допустим с Compose Activity. Glance не требуется автоматически и не установлен.
Для restore с изменением ID есть AppWidgetProvider.onRestored(oldIds,newIds);
это отдельный путь от upgrade, требующий переноса per-ID параметров.
[AppWidgetProvider](https://developer.android.com/reference/android/appwidget/AppWidgetProvider).

Extras не различают PendingIntent identity. Кандидат — явный адресат и отдельная
identity по widget ID/действию (data URI/requestCode); IMMUTABLE не устраняет
collision. Delete отменяет/делает недействительными старые действия; service
проверяет живой instance/актуальный settings snapshot.
[PendingIntent](https://developer.android.com/reference/android/app/PendingIntent).
Два instances/порядок обновлений/старые PendingIntent/удаление/restore проверять
на launcher, не только comparator unit test. BUG-001 остаётся неизвестным.

Target37 ограничивает суммарную память Bitmaps/Icons в RemoteViews:
1.5×screenWidth×screenHeight×4. Размер measured пикселей влияет сильнее размера
файла PNG; не рисовать весь widget в большой bitmap ради Compose сходства.
[Android17](https://developer.android.com/about/versions/17/behavior-changes-17),
[AppWidgetManager](https://developer.android.com/reference/android/appwidget/AppWidgetManager).
Проверять resize/несколько instances/плотности и фактическую ошибку host update.

Legacy channel ID:NOTIFICATION_CHANNEL_ID_BRIGHTNESS_CONTROLS_ +timestamp,
не сохраняется единый предпочтительный ID. Публично можно перечислять каналы
и читать их параметры; настройки уже созданного канала контролирует пользователь.
Повторное использование подходящего старого ID — кандидат для сохранения settings;
создание нового HIGH при blocked старом нельзя выдавать за миграцию.
[Channels](https://developer.android.com/develop/ui/compose/notifications/channels).
Если каналов несколько с разными настройками, однозначный пользовательский выбор
из исходников не восстановить. Правило выбора/неразрушающей миграции надо
определить по fixtures и согласовать в плане; пока ни merge, ни cleanup не выбраны.

POST denial на33+ не отменяет допустимый FGS start, но не отменяет обязательный
notice; его видимость в shade/Task Manager различается.
[Notification permission](https://developer.android.com/develop/ui/compose/notifications/notification-permission).
Main открывать прямым Activity PendingIntent, не notification service trampoline;
target37 BAL opt-in проверить для реальных sender/creator путей, не глобально
разрешать фоновое открытие permission экранов.
[Activity security](https://developer.android.com/guide/components/activities/secure-bal).

## 8. Права, Billing и AdMob

Legacy product ID:premium_upgrade, non-consumable. PurchaseChecker хранит
комментарий о history→queryPurchases для восстановления; active code принимает
matching SKU +acknowledged. Современная Billing8 удаляет queryPurchaseHistoryAsync,
поэтому literal перенос этой цепочки не подходит.
[Billing migration](https://developer.android.com/google/play/billing/migrate-gpblv8).
Кандидат: current purchases через queryPurchasesAsync, проверка PURCHASED,
не выдавать право на PENDING, acknowledge только нужные PURCHASED и
идемпотентная обработка результата. Restore остаётся ручным и автоматическим
в согласованном объёме; бессрочный товар не consume.
[Billing integration](https://developer.android.com/google/play/billing/integrate).

`InAppPurchaseManager.onCheckPurchasedSuccess` и hidden help taps писали один
IS_PREMIUM; из флага нельзя восстановить purchase token/происхождение права.
Миграция должна сохранить прежние paid rights и обрабатывать unknown/ошибки
без их стирания. Как представлять неоднозначный legacy flag до проверки —
вопрос схемы/fixtures будущего плана, не принятое новое paid право или отзыв.
Ключи/покупки других account/отмены/ack recovery нужны в настоящем Play environment.
Backend не вводится автоматически; граница проверки подлинности должна быть
обоснована в плане, не переносить TODO validator=true как готовую верификацию.

Game promo:net.humblegames.ballspuzzle3d, отдельный <queries><package> уже в Legacy.
Кандидат — сохранить точечную видимость/проверку package, без QUERY_ALL_PACKAGES
и без объявления promo покупкой. [Package visibility](https://developer.android.com/training/package-visibility/declaring).

На дату сверки AdMob quick-start показывает min24/compile35 и play-services-ads
25.5.0, но страница обозначена Legacy и ссылается на Next-Gen семейство.
Min26/compile37 удовлетворяют этим minima; выбор семейства/версии и фактическая
совместимость с Kotlin/Compose/R8 требуют отдельной проверки до интеграции.
Это не команда обновить нынешний catalog.
[AdMob setup](https://developers.google.com/admob/android/quick-start).
Init может предварительно загружать ads, поэтому скрытый banner не доказательство
отсутствия запросов. Plan должен учитывать право/consent до init и отсутствие
блокировки света при offline/ошибке SDK. Новые форматы/телеметрия не добавляются.
Личные account/выплаты/реальные покупки не доступны из репозитория и не проверены;
это release/integration gates, не остановка подготовки плана.

## 9. Ранние проверки и критерии продолжения

Проверки ниже **запланированы**, не выполнены. Не новые TEST ID;
это организация существующих TEST по риску. Реальные прототипы/устройства —
после согласованного плана, проверенного архива и отдельного разрешения реализации.
До этого допустимы уточнения документов и необходимых исходных сведений.

| Порядок/связи | Минимальная проверка после разрешения | Критерий результата |
|---|---|---|
| Первый:TEST-047/020/021/022–025 | API26/31/33/34/35/37:foreground/widget/notification/boot start; notice denial/channel state, Stop/force-stop | Каждая успешная сессия имеет законный путь/notice; отказ честен, нет restart loop |
| Первый:TEST-003–005/011/048 | Без обхода floor:mode/raw/own echoes; одно окно и касания на31+/37, реальный OEM дисплей | Нет touch-blocking/дубликата, partial честен; не имитировать physical результат screenshot |
| Первый:TEST-060–071/035/036/047 | Lock credential boot; awake/sleep/unlock, два reboot, wall-clock changes, corrupted snapshot и stale delivery | Нет прежнего overlay до unlock/при overdue/недостоверности, исходный срок без rearm |
| Первый:TEST-046/053 | Подписанный совместимый upgrade существующего артефакта; defaults/presets/widgets/rights, повтор импорта/прерывание | Настройки/старые paid права сохранены, upgrade не выполняет свет; version/signing пригодны |
| Затем:TEST-049/038/039 | Настоящие fixed5/UsageEvents на доступных устройствах, unknown/revoke/multiwindow/expiry | Доказано пригодное распознавание; invalid выводы не restore, fake не закрывает G04 |
| Затем:TEST-026–030/021/043 | Два widget instances/host restore/каналы/resize/memory37/offline | Независимость ID/настроек, старые действия не меняют новую цель, нет скрытого reset каналов |
| Затем:TEST-053–059/050 | Play restore/new purchase/pending/refund, AdMob test units и RU/EN/TalkBack/large font | Права и отображение соответствуют контракту; store success подтверждён настоящей средой |

Первые четыре группы должны быть ранними небольшими этапами, до полной сборки
всего UI и монетизации; их неудача требует исправления технического пути или
отдельного пересмотра затронутого требования по результату. Чистая логика
актуальности/clock/миграции может проверяться параллельно по времени работ,
но не подменяет реальный Android путь. Работа субагентами этим не поручается.

Артефакт будущей проверки: версия app/SDK/API, модель/OEM/launcher, подписанный
fixture provenance, grants/начальное состояние, точное событие, observed mode/raw/
факт окна/результат/логи. Test-only fault отдельно от реального отказа.

## Что передать в следующий план MVVM

Определить одного владельца команд/окна и сериализацию эффектов; состояние UI
отделить от observed OS/сервисного runtime. Конкретизировать FGS lifetime/manifest,
CE/DE bootstrap, clock trust и late-stop/expiry переходы. Выбрать storage engine,
схему импорта с fixtures, provider compatibility и перенос каналов/прав.
Составить макеты ключевых поверхностей и этапы с gate-проверками выше.

Не требуется новое согласование диапазонов/defaults/reboot/коммерческой политики.
Если plan предлагает новое пользовательское решение для неоднозначного канала
или legacy права, представить конкретный случай по шестичастному формату до
его принятия; не выбирать его скрыто в техническом адаптере.
После плана — checkpoint/проверенный архив трёх папок, затем отдельное поручение
на эксперимент. Открытые G01–G08/BUG-001–004 не закрыты этой оценкой.

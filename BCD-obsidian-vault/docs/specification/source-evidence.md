# Проверяемые доказательства Legacy

[Глоссарий: термины и обозначения](glossary.md). Местные пояснения сохраняют тот же смысл.

Версия: `cd7696cd04705fa48a2c115addf98ae6191bfdd9`, ветка `develop`. Все пути ниже относительны к корню Legacy. Диапазоны строк относятся к этой версии, а не к будущему переписанному коду. Вызов Android API означает запрос, а не успешное физическое изменение экрана.

Для компактности `J/` означает `BrightnessControlDimmer/src/main/java/net/humblegames/brightnesscontroldimmer/`, `R/` — `BrightnessControlDimmer/src/main/res/`, `T/` — `BrightnessControlDimmer/src/androidTest/java/net/humblegames/brightnesscontroldimmer/tests/`. Имя файла без каталога в одной строке таблицы относится к каталогу предыдущего полного пути этой строки. Скобки `{a,b}` обозначают оба пути, не буквальное имя. Эти сокращения однозначно раскрывают путь; E-номера — локальные ссылки на доказательства, не продуктовые ID.

| Код | Путь, строки, точный символ/item | Существенная связь |
|---|---|---|
| E01 | `J/utils/Const.java:48–90,101–148,170–216`, `DEFAULT_MIN_BRIGHTNESS`, `SAFETY_MIN_BRIGHTNESS`, `AUTO_BRIGHTNESS_MODE`, `DEFAULT_*`, `KEY_*` | Диапазон -75..100; Auto=`Integer.MIN_VALUE`; наборы main [-75,-50,-25,0,25,50,75,100,5], notification [-75,-25,25,75,5]; последние элементы — шаги |
| E02 | `J/service/BrightnessState.java:35–57,78–105,153–199,226–235`, `getUpdatedBrightnessPercentByStep`, `fromPercentToSystemBrightness`, `validateBrightnessPercent`, `loadInitialBrightness` | Шаг ограничен диапазоном; p<=5 → M*5/100, иначе p*M/100, целочисленное деление; проверка `p >= min \|\| p <= 100` ошибочна |
| E03 | `J/screen/brightness/BrightnessUtils.java:39–119,127–176`, `setManualBrightnessMode`, `convertToBrightnessPercent`, `setPositiveBrightness`, `negBrightnessToAlpha`, `loadSavedBrightness` | raw→проценты через Math.round; отдельный helper проценты→raw округляет, активный State делит; putInt не проверяет boolean результата |
| E04 | `J/screen/brightness/MaxMinBrightness.java:13–80`, `initDeviceMaxBrightness`, `getMaxDeviceBrightness`, `getMinimumDevicesSafeBrightness`, `getMaxSystemBrightness` | M отражением из `PowerManager.BRIGHTNESS_ON`, fallback 255, минимум M*5/100; источник/история OEM workaround уточнены ниже, это не калибровка физической яркости |
| E05 | `J/service/DimmerService.java:677–746,793–845`, `setBrightness`, `setNegativeBrightnessPercent`, `setDimmerDeactivationAlarm`, `cancelDimmerDeactivationAlarm` | Auto→remove overlay/OS Auto/cancel; positive→manual/raw/remove/cancel; negative→manual floor/alpha/add/rearm |
| E06 | `J/screen/overlay/OverlayDrawer.java:38–83,94–169,185–225`, `addOverlay`, `removeOverlay`, `setupWindowsAndViews`, `updateBackgroundAlpha` | Чёрный non-touchable overlay; TYPE_APPLICATION_OVERLAY на 26+; Paint alpha<=191; на 31+ отдельно params.alpha=maximum obscuring opacity; ошибки только логируются |
| E07 | `J/service/DimmerService.java:380–428`, `handleCommandSystemBrightnessModeChanged`, `handleCommandSystemBrightnessChanged`, `shouldSyncWithSystemBrightness`; `J/screen/brightness/SystemBrightnessObserver.java`, `SystemBrightnessModeObserver.java`, `onChange` | ContentObserver→ServiceHandler→service; default sync=true; изменение ОС снимает overlay; один callback подавляется boolean-флагом |
| E08 | `J/service/DimmerService.java:442–568,987–990`, handlers widget/main/notification step; `J/utils/Utils.java:506–550,559–664`, PendingIntent helpers | Разные командные входы приходят в общий State; Auto не обновляет его numeric p; widget step не ставит тот же own-write marker |
| E09 | `J/ui/MainActivity.java:286–326,370–425,803–901,948–954`, `onProgressChanged`, `setupBrightnessButtons`, `enableAutoBrightness`, `startDimmerService` | Slider max175, progress=p+75; 8 presets; long click editor; fixed/Auto закрывают по checkbox, slider/+/- нет |
| E10 | `J/ui/SetButtonValueActivity.java:81–159,259–365,485–518`, `onOptionsItemSelected`, `saveNewBtnValue`, `isInAllowedRange` | Intent выбирает main/notification/index; пустой Done и Cancel без записи; integer, preset min..100, step1..50; изменения не применяют яркость |
| E11 | `R/xml/preferences.xml:1–156`, `R/values/preference_keys.xml`, preference defaults; `J/ui/settings/FragmentSettings.java:188–230,286–301,349–398`, `onResume`, `checkPremiumStateAndUpdateUi` | Defaults show groups=true, icon/timer/exclusions/close/shade=false, sync=true, importance HIGH; notification labels из кода заменяют XML summary |
| E12 | `J/ui/MainActivity.java:165–258,427–550,580–679,739–801,1033–1097`, `onPause`, `loadPrefs`, `loadBrightnessFromPrefs`, `BrightnessUpdateMessengerHandler` | Первый запуск Auto+help; pause сохраняет локальный numeric/sentinel; resume OS Auto либо повтор saved; Activity finish не останавливает service; все основные группы скрыты→hint |
| E13 | `BrightnessControlDimmer/src/main/AndroidManifest.xml:13–38,75–115,124–164,235–264` | Permissions, application `.app.App`, MAIN/LAUNCHER singleTask; internal activities, service; AccessibilityService целиком закомментирован |
| E14 | `J/service/DimmerService.java:152–334,594–617,847–990`, `onCreate`, `onStartCommand`, `onDestroy`, `handleCommandBootComplete`, foreground notification | START_REDELIVER_INTENT; gate после overlay setup; boot Auto; icon=false→stopForeground(true); silent ongoing notification; channel ID с timestamp |
| E15 | `J/ui/NotificationControls.java:22–115`, `updateNotificationImportanceBasedOnIconCheckbox`; `J/ui/SharedPreferencesChangeListener.java:33–82`, preference listener | icon on форсирует HIGH; importance prefs HIGH/LOW/MIN; смена channel через service; checkbox таймера пишет отдельный hidden enabled key |
| E16 | `J/service/DimmerService.java:485–514`, notification actions; `J/ui/settings/FragmentSettings.java:219–230`, `J/ui/MainActivity.java:220–258`; `J/ui/permissions/NotificationPermissionRequester.kt` | Shade close только non-step и <31; POST_NOTIFICATIONS request ошибочно guard >=31, а permission существует с33 |
| E17 | `J/widget/WidgetBrightnessVal.java:25–74`, `onUpdate`, `updateAppWidget`; `WidgetBrightnessValConfigureActivity.java:39–77`; `J/utils/Utils.java:88–149` | Текст Auto из режима ОС, иначе saved (fallback OS); tap открывает Main; notification widget общий control набор |
| E18 | `J/widget/WidgetNotification.java:28–99`, `onReceive`, `updateAppWidget`; `J/widget/WidgetPlusMinusHorizontal.java:20–55`, `WidgetPlusMinusVertical.java:21–55`; `R/xml/widget_*_info.xml` | Value, notification, horizontal, vertical providers; update intents, resize, home/keyguard categories, настройка двух +/- видов |
| E19 | `J/widget/WidgetPlusMinusConfigureActivity.java:63–230,259–316`, configure listeners, `save*`, `delete*`; `WidgetPlusMinusHorizConfigureActivity.java:19–43`, `WidgetPlusMinusVertConfigureActivity.java:19–43` | Named prefs `net.humblegames.brightnesscontroldimmer.Widget`; appwidget_<id> step default10 (1..50), appwidget_transparency_<id> default100 (15..100/5); Auto bool пишется до подтверждения; delete только step |
| E20 | `J/utils/Utils.java:217–286,316–465,693–714,805–812`, `updatePlusMinusWidget`, `KEY_WIDGET_PLUS_MINUS_SHOW_AUTO`, `KEY_WIDGET_PLUS_MINUS_SHOW_AUTO_PREFIX`, `isKeyguardMode`, `getPendingIntentService` | PendingIntent requestCode0+одинаковый action +/- с UPDATE_CURRENT, widget ID не в identity; extras step могут заменяться даже при IMMUTABLE; global Auto key для старого view ID отдельно от per-ID/defaultfalse для новых IDs; keyguard branch только API17..20 |
| E21 | `J/broadcasts/StartOnBootServiceReceiver.java:20–47`, `onReceive`; manifest:165–171 | BOOT_COMPLETED→startForegroundService на26+→TYPE_START_ON_BOOT→Auto; нет пользовательского boot-флага |
| E22 | `J/exceptions/CrashHandler.java:23–26`, `uncaughtException`; `AppRestarter.java:41–63`, restart; `J/app/App.java:34–49`, `onCreate` | CrashHandler→RTC alarm +100ms→kill/exit; flags PendingIntent без IMMUTABLE, debug BuildConfig из androidx.multidex |
| E23 | `J/ui/DimmerOffTimeoutSelectorDialog.java:25–91`, dialog `progress`, dismiss; `J/ui/settings/FragmentSettings.java:263–276`; `J/utils/Utils.java:716–762,815–829`; E05 | index0..47→30..1440min release; index5=3h; debug index+1 секунд; ELAPSED_REALTIME/set non-wakeup; dismiss progress nullable |
| E24 | `J/broadcasts/ScreenOnOffBroadCastReceiver.java:20–22,69–103`, `onReceive`; `J/utils/Utils.java:860–870` | 4 SCREEN_ON/OFF, соседний интервал<=1250ms, counter reset→Auto через timer-command; не проверка физической кнопки и не общий предел5s |
| E25 | `J/utils/Utils.java:162–215`, `areRequiredPermissionsGranted`, `checkAndRequestIfNotGrantedRequiredPermissions`; `J/ui/permissions/PermissionConfigurationActivity.java:49–50,81–153,196–215,239–382`, permission handlers; `J/ui/permissions/WaitForDrawOverlayPermissionTimer.java:26–38`, `onTick`, `onFinish` | Оба special access обязательны; WRITE_SETTINGS fallback при отсутствии Activity; возврат overlay может ждать10s; denied закрывает UI/не обеспечивает запрос |
| E26 | `J/ui/settings/PermissionBasedCheckboxPreferenceHandler.java:48–79`; `J/service/ForegroundAppChecker.java:30–99`, `isUsageStatsPermissionGranted`, `getTopPackageName`; `J/screen/overlay/OverlayExcludedAppWatcher.java:15–114`, `isExcludedAppInForeground` | PACKAGE_USAGE_STATS AppOps/settings, fixed-period1500ms; DAILY UsageStats lastTimeUsed→кандидат foreground, ошибки→пустая строка |
| E27 | `J/utils/SpecialAppsPackages.java:5–9`; `J/service/DimmerService.java:249–260`; `J/app/appstatewatcher/AppStateWatcherBroadcastReceiver.java`; E26 | fixed packages: com.android.vending, com.google.android.gm, com.android.packageinstaller, com.google.android.apps.walletnfcrel, com.google.android.gms; broadcasts→remove/add overlay независимо от текущего p |
| E28 | `J/ui/OverlayExcludedAppSelectionActivity.kt:17–93`; `J/billing/TestToolsActivity.java:318–347`; `J/ui/billing/PremiumUpgrade.java:65–66`; manifest:39–42,150–154 | Debug UI может открыть declared activity со списком; нет save/onClick/связи с watcher; отдельный accessibility startService не создаёт Android binding |
| E29 | `J/app/appstatewatcher/AppStateWatcherAccessibilityService.java:23–176`; `J/ui/settings/FragmentSettings.java:149–165`; manifest:248–264 | Альтернативное наблюдение Accessibility отключено в manifest/настройках, событие Google Play; внешнее включение Android недоступно в данной manifest |
| E30 | `J/app/InAppPurchaseManager.java:27–101`, `queryInAppPurchaseStatus`, `purchasePremiumUpgrade`; `J/billing/GooglePlayBilling.java:37–54,98–135`; `J/billing/PurchaseChecker.java:34–60`; `J/billing/PurchaseHandler.java:40–87`; `J/billing/PurchaseAcknowledger.java:30–39` | SKU premium_upgrade; query→acknowledged matching product, history→current; active pending purchase не выдаёт entitlement (право Premium); purchased→save/ack; failure оставляет cache |
| E31 | `J/app/persistence/SharedPreferencesSaver.java:20–30`; `J/billing/PurchaseValidator.java:24–28`; `GooglePlayConnection.java:44–64`; `GooglePlayPurchaseHandler.java:25–68`; `GooglePlayPurchaseListener.java:103–105` | Технические кандидаты: signature TODO=true, setupfail log без callback; singleton inverted; неиспользуемый handler всегда granted; не смешивать с активным flow |
| E32 | `J/ui/MainActivity.java:1107–1198`; `J/ui/SetButtonValueActivity.java:208–227,485–492`; E11; `J/ui/settings/ActivitySettings.java`; `J/ui/billing/PremiumUpgrade.java:95–157` | Premium cache OR installed game снимает ограничения; editor OK, timeout selector, основные visibility, notification edits gated; main ads construction закомментирован |
| E33 | `J/remoteconfig/RemoteConfigHelper.java:55,95–106`; `J/utils/Utils.java:873–951` | RemoteConfig default false/fetch6h release, debug0; управляет promotion UI, не OR-entitlement; package check/market→http fallback |
| E34 | `J/ads/AdsLoader.java:30–41,79–134`; `J/ads/AdViewController.java`; E10, E32 | Editor/settings создают loader; premium hides container, не гарантирует отсутствие запроса; load failure hide |
| E35 | `J/ui/help/ActivityHelp.java:31–74`, pager/`increasePremiumSwitchCounter`; `ScreenSlidePagerAdapter.java`; `FragmentScreenSlidePage.java:17–64`; `R/layout/fragment_quick_start_1.xml`, `android:onClick` | 6 страниц, next/done; 7 taps grant premium/10 revoke, counter reset при создании fragment; 0/7 layouts не в adapter |
| E36 | `J/ui/MainActivity.java:929–946`, `share`; `BrightnessControlDimmer/src/{debug,googleplay,amazon}/java/net/humblegames/brightnesscontroldimmer/utils/BuildSpecificConst.java`, `SHARE_APPSTORE_LINK` | ACTION_SEND text/plain + EXTRA_TEXT/SUBJECT, chooser; Google Play vs Amazon variants; Legacy Google Play URL дополнительно содержит параметр ah |
| E37 | `R/values/strings.xml:1–198`, `R/values-ru/strings.xml`, `R/values/preference_keys.xml`, error/help strings; `R/layout/*.xml`, `R/menu/*.xml` | en default/Russian resources; утверждения «не убьёт» и «4 кнопки за5s» — намерение UI, не доказательство ОС |
| E38 | `BrightnessControlDimmer/build.gradle:28–94,121–180`, root `settings.gradle`, `build.gradle`, `gradle/wrapper/gradle-wrapper.properties` | min21/target33/compile33/v49=1.7.6/Java17; release/googleplay/debug; Amazon source directory без configured build variant; auxiliary modules |
| E39 | `T/ClearPrefsTest.java:338–340`, `T/DimmerServiceTest.java:923–941`, `T/MainActivityTest.java:293–332`, `T/UtilsTest.java:26–27`, `T/StartOnBootServiceReceiverTest.java:32–65` | Старые assertions raw0 для negative против active floor; share/Utils fail placeholders; boot mock только startService. Тесты не запускались |
| E40 | `J/service/DimmerService.java:152–164,280–301,623–674,750–759`; `J/service/ServiceHandler.java:26–61`; `J/service/NonStopIntentService.java`; `J/utils/ScreenUtils.java:20–60` | Timer cleanup/LocalBroadcast unregister кандидаты ошибок; dormant thread/overlay raw config; dimension square; технические наблюдения, не отдельные продуктовые Features |
| E41 | `J/crashlytics/CrashlyticsWrapper.java:29–34,76–87`; `J/ui/MainActivity.java:421–425`; `J/app/App.java:34–49`; `HumbleLogger/src/main/java/net/humblegames/humblelogger/{L,ICrashLogger}.java` | Firebase Analytics/Crashlytics, UUID/premium metadata, logger; telemetry не объявляется новой пользовательской возможностью |

## Платформа: проверено по официальным источникам

Сверка 2026-10-04. P-обозначения — ссылки для последующих документов; это ограничения платформы, не confidence Legacy.

| Код | Вывод и API | Источник |
|---|---|---|
| P01 | SCREEN_BRIGHTNESS имеет документированную шкалу1..255; WRITE_SETTINGS special access с23; режим Auto отдельный. Физическая luminance не задаётся процентом BCD | [Settings.System](https://developer.android.com/reference/kotlin/android/provider/Settings.System) |
| P02 | TYPE_APPLICATION_OVERLAY с26, ниже критических системных окон; ОС может менять видимость. На31+ non-touchable окна подчинены maximum obscuring opacity и совокупной прозрачности | [WindowManager.LayoutParams](https://developer.android.com/reference/android/view/WindowManager.LayoutParams) |
| P03 | ACTION_CLOSE_SYSTEM_DIALOGS deprecated на31; для target31+ вызов ограничен, включая SecurityException | [Android 12, все приложения](https://developer.android.com/about/versions/12/behavior-changes-all) |
| P04 | POST_NOTIFICATIONS runtime с33. Отказ не запрещает старт FGS, но его notification всё равно обязателен; отображение отличается в shade/Task Manager | [Notification permission](https://developer.android.com/develop/ui/compose/notifications/notification-permission) |
| P05 | С26 channel importance контролируется пользователем, после создания нельзя произвольно изменить channel behavior приложением | [Notification channels](https://developer.android.com/develop/ui/compose/notifications/channels) |
| P06 | Background FGS ограничен с31; widget interaction — отдельный разрешённый случай; для SAW-exemption на target35+ нужен visible overlay; с target34 нужен FGS type | [Background starts](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start), [FGS changes](https://developer.android.com/develop/background-work/services/fgs/changes), [Service types](https://developer.android.com/develop/background-work/services/fgs/service-types) |
| P07 | set — inexact с19; ELAPSED_REALTIME не будит устройство. Доставка может задержаться; это не обещание точного выключения во сне | [AlarmManager](https://developer.android.com/reference/android/app/AlarmManager) |
| P08 | UsageStats требует special access; с30 locked user может дать null. lastTimeUsed — статистика, не гарантия текущего видимого приложения | [UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager) |
| P09 | Target37: RemoteViews имеет ограничение суммарной памяти Bitmaps/Icons; изменены ограничения background Activity launch. Эти изменения требуют отдельной будущей проверки widgets/permission flows | [Android 17, target37](https://developer.android.com/about/versions/17/behavior-changes-17) |

Выбор конкретного FGS type/manifest/политики магазина здесь не выполнен; `specialUse` — возможный предмет будущей оценки, не утверждённая архитектура или разрешение Google Play.

## Историческое основание защитного минимума

На том же Legacy HEAD `cd7696cd04705fa48a2c115addf98ae6191bfdd9`: `J/utils/Const.java:54–60`, комментарий перед `SAFETY_MIN_BRIGHTNESS`. Он называет `Fly IQ441` и `Archos 80 g9 turbo`, описывает полное потемнение экрана при очень малом значении и непригодность устройства для управления; отдельное предупреждение сообщает о проблеме при пороге4 на Fly IQ441. Более ранние строки о2/3 процентах отражают историю комментария, действующий constant равен5. Активная цепочка E02/E04 использует `MaxMinBrightness.MIN_SAFE_BRIGHTNESS_PERCENT = 5`, а не старую фразу о3.

2026-10-04 пользователь дополнительно сообщил, что на Fly IQ441 значения ниже5 приводили к полному отключению экрана, и объяснил введение порога этой проблемой совместимости. Основание присутствия предупреждения — OBSERVED_IN_CODE; объяснение автора — свидетельство пользователя. В этом исследовании устройство не запускалось; комментарий о полном потемнении и пользовательское описание физического отключения не являются измерением питания дисплея. Оценка пользователя о расхождении с документацией Google не объявляется отдельно проверенным платформенным фактом.

Процент здесь относится к условной шкале BCD. При принятой шкале ОС255 minimum request равен floor(255*5/100)=12; это не пять raw units и не измеренные5% luminance. Сведения об этих моделях не доказывают распространённость дефекта или достаточность того же порога на современных устройствах.

Для будущей идеи проверки с откатом существенны [ограничения доставки alarms](https://developer.android.com/develop/background-work/services/alarms) и [фонового запуска FGS](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start). Inexact alarm может задержаться; возможность восстановить настройки после прекращения процесса требует отдельной проверки. Эти источники не подтверждают готовый гарантированный механизм отката.


## Повторная проверка единиц minimum —2026-10-07

Legacy HEAD cd7696cd04705fa48a2c115addf98ae6191bfdd9, без изменения исходников.
`BrightnessControlDimmer/src/main/java/net/humblegames/brightnesscontroldimmer/screen/brightness/MaxMinBrightness.java:15,23–24`:
MIN_SAFE_BRIGHTNESS_PERCENT=5; getMinimumDevicesSafeBrightness вычисляет M*5/100
с integer division. При стандартном M255 результат raw12, не raw5.
`service/BrightnessState.java:164–169` в том же package prefix применяет этот
minimum к p<=5, иначе p*M/100. Это активная цепочка установки.
`screen/overlay/OverlayDrawer.java:219–223` использует SAFETY_MIN_BRIGHTNESS/100.0f,
то есть0.05; `utils/Const.java:54–60` прямо обозначает проценты и активное5.
Старые комментарии о3 не меняют константу5.
`screen/brightness/BrightnessUtils.java:89–92` — отдельный helper с Math.round,
который дал бы13 при5%/M255; он не подменяет integer formula активной цепочки.
Подтверждены единицы и округление исходного кода, не физическая яркость устройства.

## Причина reflection в E04 —2026-10-09

Проверены рабочий Legacy HEAD cd7696cd04705fa48a2c115addf98ae6191bfdd9 и
история Git. MaxMinBrightness.java:40 содержит ссылку на исходный
[ответ63673416](https://stackoverflow.com/questions/56203720/how-do-i-detect-the-screen-brightness-range-on-android/63673416#63673416).
Это первичное историческое сообщение автора метода, не гарантия современных OEM:
вопрос сообщает о Xiaomi Mi8 с максимумом примерно1024 вместо255;
автор ответа сообщает тесты reflection на Android9/10, включая Xiaomi.
Использование BRIGHTNESS_ON в Legacy почти дословно совпадает с этим методом.

Первое найденное добавление — a43496787cf5dac5ceed8ae4f000652ee4ef18f5 от
2022-02-01, refactor: add BrightnessUtils.getMaxBrightness(), со ссылкой source
уже в исходном diff. 9ace4b2e подключает определение максимума при старте сервиса;
682aa780 выделяет класс, последующие rename сохраняют происхождение. Коммит
не содержит номера конкретной жалобы BCD. BCD-60/Xiaomi от2022-03-04 меняет
callback Auto, а BCD-76/Galaxy M51 от2022-03-14 включает переименование класса:
они не доказывают исходную причину reflection. Это вывод по статической истории,
а не утверждение о проверенной работе на этих устройствах.

В AOSP Android10 поле BRIGHTNESS_ON=255 помечено @hide/UnsupportedAppUsage:
[исходник](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/android10-release/core/java/android/os/PowerManager.java).
[Публичная настройка](https://developer.android.com/reference/android/provider/Settings.System#SCREEN_BRIGHTNESS)
документирует максимум255, но ссылка Legacy описывает историческое отклонение OEM.
[Ограничения non-SDK](https://developer.android.com/guide/app-compatibility/restrictions-non-sdk-interfaces)
не позволяют считать reflection надёжным универсальным API.

E02/E03 показывают назначение M: p*M/100 для записи, raw*100/M для чтения,
M*5/100 для защиты. При условном M1024 фиксированная запись255 соответствует
примерно четверти числовой шкалы; raw12 — примерно1.17%, вместо legacy minimum51.
Это арифметика условной шкалы, не процент физического света и не измерение BCD.
Комментарии BrightnessUtils.java о [0,255] сами по себе не доказывают диапазон OEM;
там же109–113 описан иной OEM отказ записи255 (Eweat/Android6.0.1), не причина M.

Вывод: reflection был способом получить изменённую OEM-константу из установленной
прошивки, а не измерить дисплей. Связь с мотивом совместимости хорошо поддержана
ссылкой/кодом; конкретная жалоба BCD и актуальность workaround пока неизвестны.
DEC-001 остаётся открытым. Нельзя объявлять255/ raw12 совместимыми с любым OEM
или менять принятый5% floor по этому статическому анализу. До удаления workaround
нужно проверить границу Settings/System на релевантных прошивках. Анализ не
разрешает опыты ниже защиты или ввод универсальной калибровки.

## Реестр нестандартных шкал и обходов —2026-10-09

| Историческое устройство/сообщение | Сообщённый диапазон/максимум | Что известно о решении |
|---|---|---|
| Xiaomi Mi8, исходный вопрос2019 | Примерно1024 | Описана проблема255; связанный ответ предлагает reflection BRIGHTNESS_ON, но тест именно этой модели не подтверждён Legacy |
| POCO F2 Pro, комментарий к ответу63673416 | 2047 | Автор комментария сообщает, что предложенный reflection работает; прошивка/версия не установлены |
| Xiaomi Redmi Note7, ответ56281205 | 0..4000 | Автор указывает нестандартную шкалу; подтверждённого модельного fix в Legacy нет |
| OnePlus, комментарии без точной модели | Не установлен | Сообщение о похожем случае, без пригодной матрицы версии/прошивки |
| Huawei/Xiaomi, комментарий об Android10 без модели | Не установлен | Сообщение о некорректной работе, не подтверждение конкретного диапазона |

Источник этих исторических сведений: [исходное обсуждение](https://stackoverflow.com/questions/56203720/how-do-i-detect-the-screen-brightness-range-on-android/63673416#63673416),
[ответ о Redmi Note7/системном файле](https://stackoverflow.com/questions/56203720/how-do-i-detect-the-screen-brightness-range-on-android/56281205#56281205).
Это сообщения авторов, не наши испытания/поддерживаемая современная матрица.

Варианты в источнике: reflection BRIGHTNESS_ON использован Legacy;
reflection getMaximumScreenBrightnessSetting предложен, автором не проверен;
/sys/class/leds/lcd-backlight/max_brightness упомянут как существующий на части
устройств недокументированный файл, доступность/соответствие шкале Settings
не гарантированы. WindowManager.LayoutParams.screenBrightness=1F предложен для
своего окна; это не готовая замена глобальному управлению BCD, комментарии
содержат сообщения о несовместимости. Ни один вариант не утверждён для rewrite.

DEC-001 теперь CONFIRMED_BY_USER: по умолчанию255, требование совместимости
с нестандартными шкалами сохранено; конкретный способ после проверки актуальности
обхода и согласования. Старое заключение «открыт» выше описывает прежний статус.
Численные примеры/floor255 не являются доказательством физической безопасности
или универсальности; аппаратную шкалу backlight нельзя автоматически считать
шкалой Settings. User workflow: изучать не только что, но почему в Legacy;
обходы/источники/устройства фиксировать всегда, не копировать без согласования.

## Причины и нюансы таймера/защитного снятия —2026-10-09

Повторно проверены E05/E23/E24 на указанном Legacy HEAD. Ниже статические
наблюдения и история, не результаты device tests и не принятие DEC-016/DEC-017.

**Таймер.** `J/utils/Const.java:90` задаёт initial index5, то есть3h;
`J/ui/DimmerOffTimeoutSelectorDialog.java:31–38,79–86` задаёт30min..24h
с шагом30min. Enable default false проверяется в
`J/service/DimmerService.java:811–838`. Каждое применение negative, даже того
же числа, вызывает cancel/set нового alarm; Auto и неотрицательная команда
отменяют alarm (`:696–702,733–746,793–807`). Это отсчёт от последнего применения
negative, а не только первого включения overlay. Авторский отдельный мотив
каждого reset в истории не установлен; комментарий прямо называет действие reset.
Назначение функции в `R/values-ru/strings.xml:121–123` — убрать дополнительное
затемнение по окончании ожидания; полученная команда фактически запрашивает Auto
(`J/utils/Utils.java:716–748`, `J/service/DimmerService.java:453–461`).

Коммит `c6147632cfbb9e617a723cf02df25f81fa0e559a` от2015-03-29 намеренно заменил
ELAPSED_REALTIME_WAKEUP на ELAPSED_REALTIME; сообщение и комментарии говорят
не будить устройство. Более конкретная причина выбора (например, жалоба или
измерение батареи) не найдена. Текущий код использует `AlarmManager.set`,
`SystemClock.elapsedRealtime()` и non-wakeup alarm. По [AlarmManager](https://developer.android.com/reference/android/app/AlarmManager)
set неточен сAPI19, не доставляется раньше срока и может задерживаться;
ELAPSED_REALTIME учитывает сон, но не будит устройство. Это сохранение назначения
обхода, не гарантия запуска текущего service PendingIntent на target37.
Debug путь index+1 секунд (`DimmerService.java:826–832`, `Utils.java:815–829`)
служит ускорению: `T/SettingsActivityTest.java:825–893` отдельно использует эти
секунды и затем новую negative команду. Старые тесты в этой работе не запускались.

Сохранение нового index в `J/ui/settings/FragmentSettings.java:263–276` меняет
preference/summary; `J/ui/SharedPreferencesChangeListener.java:33–82` не имеет
ветки duration key. Поэтому само редактирование длительности не пересчитывает
уже назначенный alarm; следующее применение negative читает новое значение.
Enable/disable checkbox, напротив, отменяет при disable и повторно отправляет
сохранённую яркость через service. Предлагаемый немедленный rearm при сохранении
изменённой active duration — отдельное изменение, а не доказанное Legacy поведение.

`DimmerOffTimeoutSelectorDialog.java:25,58–63,79–96` хранит nullable progress,
назначает listener после initial setProgress и вызывает один callback на любой
dismiss. Сдвиг slider с последующим Back тоже сохраняет значение; отдельной
семантики Cancel нет. Без сдвига callback может получить null, который caller
распаковывает в int: кандидат NPE, не воспроизведённый сбой. Коммит
`fe9f6f8b92ee28357fca7ad705dac1b2a9ecc309` от2021-11-30 добавил явный dismiss
в onPause для другого NPE при быстром двойном Back и завершении Activity.
Этот исторический lifecycle обход не исправляет nullable progress автоматически.

**Защитное снятие.** Мотив прямо указан в `R/values-ru/strings.xml`,
`help_page6_content1`: выйти из темноты на яркий свет и снять плохо видимый
overlay без поиска экранной кнопки. Коммит
`ce80fa4b3be947d05ab487526ce32eead5b87e13` от2019-02-07 связывает gesture
с Auto при включённом overlay; коммит
`789808a4cbf90fb23df6ee6ebca7630718cb2010` от2021-11-17 меняет соседний порог
1000→1250ms и текст справки4→5s. Четыре события дают три проверяемых промежутка:
максимум3750ms между первым и четвёртым при неизменных часах и этом алгоритме.
Например0,1500,3000,4500ms укладываются в общие5s, но не проходят соседний порог.

Текущий receiver (`J/broadcasts/ScreenOnOffBroadCastReceiver.java:38–103`)
не проверяет hardware источник, обязательное чередование или наличие negative
overlay. Service регистрирует его в onCreate и без проверки negative отправляет
Auto (`J/service/DimmerService.java:243–274`, `J/utils/Utils.java:860–870`).
Следовательно, четыре подходящих события могут перевести в Auto и положительную
ручную яркость, пока receiver активен. Это расхождение с заявленным назначением,
которое нельзя молча исправить или представить как negative-only контракт.
По [Intent](https://developer.android.com/reference/android/content/Intent#ACTION_SCREEN_ON)
SCREEN_ON/OFF отражают общее состояние взаимодействия с устройством, не прямое
нажатие кнопки и не обязательно физическое включение/выключение дисплея.
Они принимаются динамически зарегистрированным receiver.

Legacy сравнивает `System.currentTimeMillis()`, чувствительный к переводу часов.
Для измерения коротких интервалов [SystemClock](https://developer.android.com/reference/android/os/SystemClock)
рекомендует монотонный elapsedRealtime, учитывающий сон. Выбор часов — будущая
техническая задача; эта запись не меняет согласованный reboot-контракт.
Устройств/OEM обходов специально для этих функций в просмотренных источниках
не выявлено; точность gesture, задержки доставки и выполнение Auto требуют
проверки на устройстве. DEC-016/DEC-017 остаются ADOPTED_BY_AGENT, ждут review.

## Статус после подробного согласования —2026-10-12

Историческое исследование2026-10-09 выше сохранено. DEC-016 подтверждён;
DEC-017 подтверждён для отрицательных сессий случаев16–17. Применимость при
positive manual яркости всё ещё открыта. [Принятые17 случаев](timer-and-safety-cases.md)
не меняют фактов Legacy и не являются выполненными испытаниями.

## Последний выбор группы3 —2026-10-12

Пользователь принял variant2: новая защита ограничена актуальной отрицательной
сессией; positive manual не переключается в Auto от screen gesture. DEC-017
CHANGE/CONFIRMED_BY_USER. Это продуктовый выбор, не исправление фактов E24:
Legacy guard не имеет. [Принятый случай18](timer-and-safety-cases.md#18-защитная-последовательность-при-положительной-яркости).

## Причины уведомлений и разрешений группы4 —2026-10-12

E13–E16/E25 повторно проверены на Legacy HEAD
`cd7696cd04705fa48a2c115addf98ae6191bfdd9`: код, call sites, Git, исходные ссылки.
Это исследование перед review DEC-008/DEC-009/DEC-010, не их принятие и не испытания.

**Foreground и controls.** Коммит `9127c6fa85d74bedb5aaf7c5a75558938e81b002`
от2019-01-24 прямо сообщает о частых остановках сервиса Android O и исчезновении
overlay; foreground использован против background execution limits.
Комментарий `J/ui/MainActivity.java:204–213` ссылается на
[исходный ответ](https://stackoverflow.com/a/50639788) и
[Android8 background limits](https://developer.android.com/about/versions/oreo/background).
Короткий SO permalink не получил читаемого содержимого, связанная поисковая
выдача не устанавливает весь исходный ответ. История самого BCD и официальная
документация доступны. Текущий `DimmerService.onCreate` начинает foreground на26+,
но `updateForegroundService` при showIcon=false вызывает stopForeground(true)
и очищает builder (`:321–333`). Это просьба снять foreground/notification,
не доказательство гарантированного continued dimming или немедленной остановки.
Текст `pref_show_icon_summary`/`help_page4_content1` обещает отсутствие kill;
намерение повысить устойчивость доказано, такое абсолютное обещание нет.

Toggle controls также вызывает повторное применение current/saved p через
service (`MainActivity.java:220–258`, `SharedPreferencesChangeListener.java:33–46`).
Для negative это может переустановить timer через E05. В новой группе4 предлагается
менять только представление controls/required notice, без новой световой команды
и изменения уже принятого deadline. Это предложение, не новое подтверждение DEC-008.
Коммит `fe998f097a404cb0eb62519bc8f2e4cd651e86b0` от2023-10-22 исправляет
невидимые controls через DecoratedCustomViewStyle; новый макет этим не предписан.

**Channels.** Коммит `91e4fbf72f38b483ee5a1efc35458bbfb32426ef` от2019-02-02
вводит timestamp ID и delete/create для изменения importance из BCD settings.
Авторский мотив — настройка приоритета, не доказанное намерение обходить user choice.
`60d5d71b507a612d14112755363584e230128020` того же дня связывает ShowIcon с HIGH/MIN.
В текущем `NotificationControls.java:22–50` ветка on форсирует HIGH, off ветка
закомментирована; комментарий предупреждает о MIN для foreground со ссылкой на
NotificationManager. Не объявлять весь historical HIGH/MIN flow текущим.
Текущий builder.setSilent(true), lights/vibration false; sound канала отдельно
в makeAndSetupNotificationChannel не обнуляется. Новая silent initial конфигурация
и стабильный канал требуют проверки; user настройки не переписывать.
По [официальным channels](https://developer.android.com/develop/ui/compose/notifications/channels)
после создания importance/поведение контролирует пользователь; BCD может открывать
системные настройки канала. Это основание сохранять user выбор вместо новых ID.

**Раздельные grants.** `Utils.areRequiredPermissionsGranted` требует canWrite И
canDrawOverlays; MainActivity gate может закрыть текущую Activity, service gate
пытается открыть PermissionConfigurationActivity. Причина специальных доступов
соответствует system write/overlay, но отдельный мотив требовать оба для просмотра
help/manual в истории не установлен. Коммит `9c632d96cce434843b8a9dd910e9a2067120e63e`
от2019-01-26 добавляет NEW_TASK против crash Android6 при запросе из boot service;
это не современное разрешение произвольно открывать Activity из background.
`e3ce2e3eb270302d30a99c54af72c5405b063370` от2019-01-14 исправляет crash при отзыве
разрешений и возврате в приложение. Перепроверка grants сохраняет назначение.

`PermissionConfigurationActivity.openWriteSettingsScreen` ловит отсутствующий
handler и предлагает общие настройки. Комментарий сообщает crash на некоторых
устройствах, модели не указаны. [Settings API](https://developer.android.com/reference/android/provider/Settings#ACTION_MANAGE_WRITE_SETTINGS)
подтверждает возможность отсутствия matching Activity. Сохранять безопасный
доступный путь/объяснение, не обещать наличие всех системных экранов на всех OEM.

**Ожидание overlay grant.** `e2f7d5785b04623eb77d6ce0d8fa601fa931ef5e`
от2019-01-14 вводит workaround Android O: canDrawOverlays временно false после
выдачи разрешения. Текущий `PermissionConfigurationActivity.java:49–50,108–153`
использует CountDownTimer до10s с проверками раз в1s и завершением при true.
Комментарий автора спрашивает, не слишком ли велики10s. Это верхняя граница
ожидания по конкретному пути, не безусловная10s задержка каждого запроса.
[Исходное обсуждение/ответ48127195](https://stackoverflow.com/questions/46173460/why-does-settings-candrawoverlays-method-in-android-8-returns-false-when-use/48127195)
содержит report на эмуляторе API26 и решение наблюдать AppOps с cleanup listener;
оно также предупреждает, что фиксированная задержка зависит от устройства.
Другие ответы описывают пробное невидимое окно; такое решение не утверждено.
Исторический BCD diff содержит эти кандидаты, но в текущем классе остались поле
listener и stopWatchingMode без активного startWatchingMode вызова.
Исторический report не воспроизведён здесь и не доказывает актуальность на новых
прошивках. В proposal не фиксировать10s как продуктовую норму, но перед выбором
реализации проверить API26/современные grants, не терять мотив обхода и не считать
false/resultCode доказательством успешного доступа. Нестандартный путь не копировать
без согласования; поздний grant не применяет отклонённую light command сам.

**Shade.** `89c297a4e99264eae47e763d2a9c482787b21f02` от2023-11-04 отключает
принудительное закрытие на31+ и скрывает настройку. На26–30 current code по enabled
опции посылает ACTION_CLOSE_SYSTEM_DIALOGS после preset/Auto, но не +/-.
Назначение `pref_show_close_notification_shade_on_click_summary` — быстрее вернуться
к приложению после выбора яркости. [Android12](https://developer.android.com/about/versions/12/behavior-changes-all#close-system-dialogs)
ограничивает этот broadcast; это не доказательство невозможности на26–30.
Удаление опции на всех поддерживаемых API — отдельный продуктовый выбор DEC-009.

**Граница target37.** [POST_NOTIFICATIONS](https://developer.android.com/develop/ui/compose/notifications/notification-permission)
runtime с33; отказ сам не запрещает FGS, но notification обязателен и notice может
остаться в Task Manager без shade. Legacy guard >=31 ошибочен, а запрос есть
как в permission flow, так и при включении icon. Требование notification отделено
от возможности долгой работы: [FGS types](https://developer.android.com/develop/background-work/services/fgs/service-types)
и [background starts](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start)
требуют отдельной проверки типа/manifest/сценариев запуска/политики Google Play.
specialUse только кандидат оценки, не уже выбранная или одобренная архитектура.
До оценки не обещать вечную работу; proposal предполагает допуск ОС и grants.

## Снимки Honor Magic 7 Pro и накопление каналов —2026-10-12

После прямого принятия случаев1–8 пользователь предоставил снимки Legacy1.7.6:
одноимённые каналы управления яркостью, малоконтрастную иконку и перенос `%`.
[Неизменённые снимки, контекст и подробное сопоставление](notification-device-evidence.md).
На Legacy HEAD проверен дефект: ID с текущим временем инициализируется заново
при создании `DimmerService`, `onCreate` создаёт канал, удаление в recreate знает
только ID текущего экземпляра. Старые экземпляры не перечисляются/не очищаются.
Накопление возможно между запусками; снимок согласуется с этим механизмом,
но без dump/истории не доказывает происхождение каждой строки или OEM renderer.
Принятый RULE-015 закрепляет повторное использование стабильного канала;
RULE-014/TEST-020 уточнены по читаемости, точный макет не выбран. Android/MagicOS
и масштаб не сообщены; агентом device tests не выполнялись. Исходный мотив
смены importance и история2019/2023 сохранены; варианты миграции старых каналов
нуждаются в отдельной технической проверке без потери пользовательских настроек.

## Исследование группы5: виджеты и исключения —2026-10-12

[Случаи для согласования](../workflows/group5-widgets-and-exclusions-review.md).
Исходная запись сделана до принятия: DEC-011/018/019/020 тогда были
ADOPTED_BY_AGENT. Последующим прямым ответом пользователь подтвердил все16
связанных случаев; это не результаты испытаний.
Legacy HEAD cd7696cd04705fa48a2c115addf98ae6191bfdd9. Просмотрены production
providers/configure, Utils, service/state/overlay, watcher/settings, manifest,
XML/layouts/strings, соответствующие тестовые входы, Git diffs и исходные ссылки.
Приложения и Android-тесты не запускались. G04/G05 остаются открытыми.

### Виджеты: назначение, независимость и сохранение

E17–E20 подтверждают четыре типа. WidgetBrightnessVal показывает Auto из ОС
либо saved numeric/fallback OS и открывает MainActivity. Он не является кнопкой
с индивидуальным фиксированным preset. WidgetNotification имеет четыре общих
с уведомлением значения, Auto, +/- и открытие Main; индивидуальные presets
каждому экземпляру здесь не назначены. Horizontal/vertical имеют свой шаг,
оформление и видимость Auto, но не собственное текущее состояние яркости.
В layout двух +/- типов нет numeric label: общий смысл состояния не требует
изобретать такую подпись для каждого типа.

Комментарий WidgetBrightnessValConfigureActivity:32–77 ссылается на старое
Android appwidgets руководство: configuration должна сама обновить widget и
вернуть исходный ID. Он сообщает о crash launcher на HTC Desire S/Android2.3.3
и Fly IQ441/Android4.0 при отсутствии ID в result. Это исторический report автора,
не запуск этих устройств здесь. Современная официальная
[configuration documentation](https://developer.android.com/develop/ui/compose/glance/configuration)
также требует ID/result и initial update; её пример отменяет placement при Back.
Это обоснование lifecycle, не выбор Glance вместо RemoteViews. Текущая value
configuration не валидирует INVALID_APPWIDGET_ID так же, как +/- configuration.

Комментарий Utils:225–247 о разных actions защищает различие Plus и Minus.
Diff 47f9b9432bddc5dfaadacd8121350a8c7c1cf0b6 от2015-02-15 уже содержит
разные actions, requestCode0 и step extras. В текущем коде appWidgetId
используется при чтении настроек/обновлении views, но не при идентификации
PendingIntent кнопок разных экземпляров. По
[официальному PendingIntent API](https://developer.android.com/reference/android/app/PendingIntent)
extras не различают tokens; UPDATE_CURRENT заменяет extras, включая IMMUTABLE.
Следовательно, обновление B может подменить step у действия A того же знака.
Это статически установленный механизм возможной подмены, не воспроизведённый
результат конкретного launcher и не установленная причина BUG-001.
TODO WidgetPlusMinusConfigureActivity:33 о совпадении preference prefixes
не доказывает ту же причину: ключи дополнительно содержат appWidgetId.

История запуска: ac7a09b00a354bb0890e40e60b99d6ba8cb8342d от2019-01-23
ввёл getForegroundService наAndroid8; dbd2dde104ce35ddc0a7d7b6dc110158453b0469
от2019-02-05 вернул getService и явно запретил foreground в helper, но
не пояснил конкретный отказ/устройство. c6015a9f45f6922b25d6ec77b8f44ca1ad28561c
от2023-10-21 добавил IMMUTABLE против crash приSDK31+.
Текущий Utils:805–812 использует getService; foreground ветвь закомментирована.
Не объявлять старое решение бессмысленным или доказанно подходящим target37.
[FGS background restrictions](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start)
учитывают явное действие на widget как исключение, но это не гарантия любого
запуска/долгой работы и не выбранный FGS type.

Configure +/-:69–230 начинает RESULT_CANCELED и отвергает invalid ID.
Шаг начинается с10 (диапазон1..50), оформление со100 (15..100 через5).
При повторном открытии existing step/opacity не загружаются в sliders;
Auto читается per-ID и записывается listener сразу, до Add/Save.
Horiz/VertConfigure:27–43 подтверждают step/opacity отдельными commits и
возвращают ID; Delete удаляет лишь step (base:300–304), не opacity/Auto.
Это обоснования атомарного Save/Cancel и полного cleanup в предложении,
не новые требования уже принятых групп.

Utils:289–398 выбирает background/pressed-state resources по opacity.
Комментарий говорит, что прямое изменение background делало подсветку
нажатия невидимой. Коммиты983ad4ea/45773536 от2019-02-22/23 реализуют шаг5
и vertical оформление; eee33d96 задаёт default100. Preview меняет alpha
контейнера, runtime меняет ресурсы фона/кнопок; точное визуальное совпадение
не проверено. Это оформление widget, не сила затемнения экрана.

74e94a3842b9dcb6ebd33d3b3ace4d343d8353ed от2019-02-23 вводит per-ID Auto
и сохраняет global bool для старого btn_widget_auto. Комментарий Utils:277–286
объясняет совместимость1.5.5→1.5.6: старый виджет мог сохранить прежний view ID.
Текущие IDs horizontal/vertical используют per-ID/defaultfalse, старый ID —
global/defaultfalse. **Общий fallback global при отсутствии per-ID не является
точным AS-IS алгоритмом.** E20/LB-026 уточнены; RULE-022/SCN-030 пока предлагают
нормализацию миграции с приоритетом explicit per-ID, затем global, затемfalse.
Старые layout/host fixtures нужны, прежде чем объявлять effective preference
перенесённой без изменения. Само обновление не применяет свет.

Исторические97c59fd9/4fcef69b от2015-03-09 добавляют keyguard layouts.
Utils:693–714 ограничивает их API17..20; Legacy min21 уже делает ветвь
недостижимой. Не переносить её в min26; это не вывод, что современные
launcher/ОС никогда не поддерживают размещение виджетов на lockscreen.
XML category сама не гарантирует доступного host.

### BUG-001 и пределы старых тестов

[Исходное письмо](../bugs/bug-register.md#bug-001-значения-яркости-виджета-после-включения-экрана)
не уточняет тип/версию/launcher, явное нажатие после включения и конкретный
результат. Не выводить reboot, force-stop или потерю preference из письма.
37b2a331ecddcc889057d65f02e0c59a75e09680 от2022-02-25, BCD-46, добавляет
own-write marker для shared controls path; current widget +/- path его
не устанавливает (DimmerService:343–355,442–453). Это отдельный кандидат
проверки observer, не диагноз BUG-001. Исторический7573269b от2015-03-08
обновлял lockscreen widget на SCREEN_ON; он не обещает повторного применения
яркости и не устанавливает причину сообщения2026.

DimmerServiceTest:665–699 создаёт widget Intent и запускает service напрямую.
Такой тест не проходит через настоящий host/PendingIntent и не проверяет
коллизию двух экземпляров, Cancel/Delete или реакцию после сна. Старые тесты
не запускались. Для BUG-001 нужен отдельный контроль: одинаковое явное
нажатие до сна/после включения и unlock, сохранённые настройки, readback ОС,
overlay/ошибка и сравнение с main при том же доступе. Добавить API36/Android16
в будущую матрицу TEST-026/028 после согласования; сообщение не закрыто.

### Исключения: причина, история и пределы распознавания

Strings help_page6/pref_summary_auto_disable_dimmer_service объясняют назначение:
overlay может блокировать защищённые Install/Pay. Это мотив снять окно,
не автоматически увеличить brightness или считать покупку успешной.
[Android tapjacking documentation](https://developer.android.com/privacy-and-security/risks/tapjacking)
подтверждает возможность фильтрации касаний из-за overlay; не гарантирует
поведение всех пяти приложений/версий. SpecialAppsPackages:11–18 сохраняет
historical Android10/11 наблюдение о com.google.android.packageinstaller и
Xiaomi com.miui.securitycenter/AdbInputApplyActivity: возможно ОС уже убирала
окно/не блокировала их. Модели/точные версии и воспроизведение отсутствуют;
эти два пакета не входят в active fixed5, не добавлять их по догадке.

e3eb555a от2021-11-24 реализовал Accessibility open/closed Google Play;
0bc5ba4b32840f2fb733232d375a9bba97d3641d от2021-12-11 добавил UsageStats draft;
4b31cbcc42fc506ba2afb2a69d2cbca91559647b от2021-12-13 подключил polling.
3f22ba075a8d6b187899ed9528522867650d8be1 от2021-12-16 отключил запрос
Accessibility;63499b7e67925136826277b4ededdb0439698878 от2022-03-01 закомментировал
service в manifest (BCD-28). Комментарий называет путь работающим и планируемым
для будущего, но конкретная причина окончательного отключения не раскрыта.
Не утверждать, что это вызвано Google Play rejection, OEM или доказанной
бесполезностью Accessibility. a7de7ba4 от2022-01-29 добавил APK installer,
25c20db1 от2022-03-03 — Gmail, b0f5dcba/372c862d от2022-04-08 — Pay/GMS.
Назначение списка согласуется с protected flows; отдельные жалобы/устройства
и подробный мотив каждого добавления в просмотренных diffs не найдены.

ForegroundAppChecker:30–99 проверяет AppOps; выбирает largest lastTimeUsed
из DAILY stats за диапазон now-1day..now+1day. При null использует первый
running process; ошибки/пустой список дают empty string. Это не достоверный
факт видимого foreground; несколько packages могут иметь одинаковый timestamp.
Watcher:21,60,79–113 проверяет с периодом1500ms; до пяти вызовов checker в
одном проходе читают разные снимки. Переход boolean false, включая unknown,
может послать CLOSED; первый такой проход также может послать CLOSED.
По [UsageStatsManager API](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
статистика требует special access, а сAPI30 может быть null при
UserManager.isUserUnlocked=false. Это состояние user storage, не доказательство
null после каждого обычного выключения/блокировки экрана.

DimmerService:249–260,956–962 связывает OPENED→removeOverlay,
CLOSED→addOverlay без проверки p/mode/timer/grant. Поэтому callbacks сами
не отменяют timer/цель; но возврат окна после Auto/positive и stale events
возможен по коду. При новой negative command setNegative:708–711 добавляет
окно независимо от recognised exclusion; watcher flags могут не послать
повторный OPENED, пока boolean остаётсяtrue. Возобновление должно проверять
актуальную цель; новая negative команда при исключении должна оставаться
приостановленной. Это предложения review, не подтверждённые изменения.
Не обещать zero leakage или точные1500ms на устройстве.

### Частичный selector и отключённый Accessibility

6da1a4ba/0c403ae7 от2022-04-26 помечают selector WIP;
5eaeb884 открывает его из TestTools. Activity показывает installed-app names,
но не сохраняет selection и не подключает его к fixed watcher. TODO ссылается
на [исходное обсуждение списка приложений](https://stackoverflow.com/questions/2695746/how-to-get-a-list-of-installed-android-applications-and-pick-one-to-run):
оно про получение/запуск списка, не готовое исключение. PremiumUpgrade:65–66
комментирует будущую настройку; это не принятое дополнительное право/gate.
Предложение DROP касается незавершённого selector, сохраняя fixed функцию.

AccessibilityServiceStatusChecker ссылается на
[лекцию автора Яндекса2018](https://habr.com/ru/company/yandex/blog/417865/):
исторически пустой enabled-service list обходили чтением Settings.Secure;
там также отдельно описаны MIUI autostart проблемы. Это первичный рассказ
автора доклада, не результаты BCD и не правило современных Xiaomi.
7f43c42f от2021-11-19 сохраняет источник динамической конфигурации
[GeeksforGeeks](https://www.geeksforgeeks.org/how-to-create-an-accessibility-service-in-android-with-example/);
пример поясняет происхождение setServiceInfo/package filter, не надёжность BCD.
TestTools:308–315 сам предупреждает, что startService не заменяет включение
пользователем; SO10727837 не дал читаемого ответа, SO64445251 доступен.
Официальный [AccessibilityService lifecycle](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService)
подтверждает включение пользователем, binding ОС и необходимость declaration.
Это основание не считать debug startService активным production detector,
но не основание приписать конкретную причину отказа от альтернативы.
Ссылка DimmerService:763 на SO3455123 (widget update) также не дала содержимого;
официальное правило initial configuration update доступно и проверено отдельно.

### Неопределённость, которую review не устраняет

Не выбраны detector, FGS/start path, допустимая задержка/оценка полезности,
подписанные widget upgrade fixtures и сохранение host IDs. Пока предлагается
unknown не считать выходом из исключения и не возвращать приостановленный
overlay по empty result; отзыв Usage access отдельно отключает функцию,
без автоматического возврата снятого окна. При явно выбранном отключении
исключений возврат актуальной отрицательной сессии — отдельный случай review.
При исходном исследовании эти уточнения ожидали ответа. Теперь пользователь
подтвердил случаи1–16; RULE/SCN/TEST обновлены без утверждения runtime результатов.

[Полученный после согласования снимок виджетов Legacy](widget-device-evidence.md)
сохранён без изменения; видны четыре типа и варианты Auto. Снимок не устанавливает
параметры ОС, версию BCD/устройство, механизм обновления или причину BUG-001.

## Уточнение LB-035: null при закрытии выбора длительности —2026-10-12

На вопрос пользователя подтверждено: nullable цепочка уже отмечена в E23 и
[инвентаризации LB-035](legacy-behavior-inventory.md), а no-crash требование уже
в RULE-026. Перечитаны поле `Integer progress`, порядок makeDialogSeekBar/listener,
dismiss consumer и вызывающий putInt в исходниках E23. Это статический риск:
если callback изменения не назначил progress, unboxing null небезопасен;
фактический порядок callbacks и crash на устройстве здесь не воспроизводились.
Пользователь поручил написать новую версию так, чтобы проблемы не было:
начальный выбор доступен без движения slider/callback, Save без изменения и
Cancel/Back/закрытие безопасны, prefs и прежний срок сохраняются. Явный вариант
добавлен в [TEST-034–035](test-plan.md)/SCN-034–035 и [случай7](timer-and-safety-cases.md#7-отмена-или-закрытие-окна).
Нового runtime BUG сообщения нет; эта запись не объявляет исправленный APK.

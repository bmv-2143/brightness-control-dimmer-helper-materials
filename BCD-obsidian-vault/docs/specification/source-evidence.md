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
| E20 | `J/utils/Utils.java:217–286,316–465,693–714`, `KEY_WIDGET_BTN_SHOW_AUTO_BRIGHTNESS_BTN*`, `isKeyguardMode` | PendingIntent requestCode0+одинаковый action +/- с UPDATE_CURRENT, widget ID не в identity; extras step могут заменяться; старый global Auto key fallback; keyguard branch только API17..20 |
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

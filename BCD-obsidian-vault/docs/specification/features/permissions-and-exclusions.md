# Разрешения, ошибки и исключения overlay

[Глоссарий: термины и обозначения](../glossary.md). Местные пояснения сохраняют тот же смысл.

CAP-005; RULE-018 относится также к CAP-003/FEAT-008. Правила изменяют жёсткий Legacy gate, но сохраняют значимые команды. Официальные P01/P02/P04/P06/P08/P09: [source-evidence](../source-evidence.md).

| RULE / Feature / DEC | Формулировка, применимость и результат | Необходимые примеры |
|---|---|---|
| RULE-016 / FEAT-014 / DEC-010 | Просмотр panel/settings/help не требует grant. Командыmanual>=0/Auto требуют WRITE_SETTINGS; negative дополнительно SYSTEM_ALERT_WINDOW. Запрашивается только недостающий доступ с объяснением; результат определяется текущим canWrite/canDrawOverlays, не resultCode или сохранённым флагом | WRITE granted/overlay denied→manual25 доступен,negative-25 блокируется;noWRITE→Auto блокируется;readonlyhelp доступна |
| RULE-017 / FEAT-014 / DEC-010 | Denial/cancel/missing settings handler/API write false/exception/window failure не объявляются success и не создают deferred command. Сообщить доступный результат/причину и оставить безопасный путь исправления. При отзыве overlay убрать собственное окно, не обещать неизменность уже принятогоOSraw; invalid input вообще не начинает операции | Denied-25→безoverlay/безпозднегоapply;grantlater безnewtap не применяет-25; writefailed→error;raw12 succeeded/windowfailed→partial state; revokeactiveoverlay→removed |
| RULE-018 / FEAT-008 / DEC-010 | POST_NOTIFICATIONS спрашивать только API33+ при user intent включить controls. Denial не блокирует manual/Auto/dimming сам по себе; UI показывает, что controls в shade могут отсутствовать. FGS notice всё равно передаётся ОС; видимость по системным правилам | API31/32 нетrequestPOST;API33deny→light работает,shadeavailabilityfalse;grant→controls; revoke→display currentgrant |
| RULE-030 / FEAT-015 / DEC-018 | Принято2026-10-12: exclusions defaultoff, optional Usage access; missing/denied/отсутствующий settings handler→disabled и объяснение/доступный путь из пользовательского UI; основной свет работает. Только fixed5 E27, без custom selector/Accessibility. Поздний grant сам не включает функцию: нужен explicit enable. Установленный revoke Usage отключает функцию без автоматического возврата снятого overlay; новая light command допустима по обычным grants при честной недоступности exclusions | noUsage/deny→disabled;grantlater→disabled;explicitEnable→enabled;revoke suspended→disabled/nooverlay;no deferred enable/restore |
| RULE-031 / FEAT-015 / DEC-018 | Принято2026-10-12: распознанный excluded package при enabled exclusions приостанавливает только актуальный negative overlay, сохраняет mode/raw/requestedp/deadline. Новая negative команда остаётся suspended и задаёт новый срок поRULE-027. Распознанный выход возвращает только актуальнуюnegative сессию при grants/неистёкшем сроке. Unknown не выход: снятое окно остаётся снятым, видимое сам unknown не снимает. Auto/positive/expiry/external sync/revoke overlay не оживляют старую сессию. Explicit off допускает актуальныйnegative overlay и в excluded app, без новойlightcommand/rearm;timer не пауза | -25→GooglePlay→suspend/end16→validother→restore;unknown→no restore;revokeUsage→disabled/no restore;new-50→suspended/end17→validother→-50;off→eligible-25/end16;Auto/25/expiry→no oldoverlay |

Fixed list: `com.android.vending`, `com.google.android.gm`, `com.android.packageinstaller`, `com.google.android.apps.walletnfcrel`, `com.google.android.gms`. Гарантия RULE-031 условна фактом распознавания, не обещает zero leakage при polling/unknown stats; unknown не следует выдавать как доказанно safe/excluded. Способ detection и приемлемость на устройствах остаются G04. Пересмотреть DEC-018, если будущая platform validation не подтвердит полезность. Не превращать fake detector test в доказательство реального UsageStats.

## Принята группа4 —2026-10-12

DEC-010/RULE-016–RULE-018 подтверждены по [случаям1–4 и6](../../workflows/group4-notifications-and-permissions-review.md).
При отсутствии системного экрана сохранить просмотр и предложить доступную
альтернативу/объяснение; фоновое событие не открывает permission Activity само.
Поздний grant не выполняет прежнюю отклонённую команду без нового действия.
Не навязывать фиксированное ожидание10s: проверить актуальность исторического
Android8 обхода до выбора реализации, не объявлять непроверенный grant успешным.
Принятие группы4 само не подтверждало группу5; её отдельное принятие записано ниже.
Механизм FGS и результаты device tests ещё не подтверждены.

## Принята группа5 —2026-10-12

[Случаи9–16](../../workflows/group5-widgets-and-exclusions-review.md) подтверждают
DEC-018/019/020 и RULE-030–031. Настройки BCD сами не excluded: при их открытии
возврат актуального окна уже допустим по распознанному выходу; после explicit off
возврат в Google Play не снимает окно. Объяснить возможное влияние на protected
кнопки. Реальная надёжность/полезность detector и допустимый запуск ещё G04/G03;
принятие не обещает мгновенного снятия, no-leak или успешной оплаты/установки.

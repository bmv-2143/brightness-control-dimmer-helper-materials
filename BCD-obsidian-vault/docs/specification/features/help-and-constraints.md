# Справка, распространение и общие ограничения

[Глоссарий: термины и обозначения](../glossary.md). Местные пояснения сохраняют тот же смысл.

CAP-007/CAP-008. Нефункциональные требования опираются на существующую инфраструктуру нового проекта, не на выдуманные целевые метрики.

| RULE / Feature / DEC | Формулировка, применимость и результат | Необходимые примеры |
|---|---|---|
| RULE-032 / FEAT-019 / DEC-024 | Help доступна по первому предложению и повторно из интерфейса; объясняет numeric/Auto, overlay, защитное переключение, permissions, controls/widgets/timer и реальные platform ограничения. Нет secret Premium taps и promises unkillable/physical4press5s | Firstofferdismiss→manualreopen;текст0% неoff,negativeoverlay, delayedtimer,screen-eventsнеhardwareguarantee |
| RULE-033 / FEAT-020 / DEC-026 | Share открывает системный выбор получателя text/plain со ссылкой `https://play.google.com/store/apps/details?id=net.humblegames.brightnesscontroldimmer`; не передаёт settings/состояние экрана. Отсутствие получателя сообщить безcrash | Receiveravailable→chooser/correctlink;none→message;cancelchooser→lightunchanged |
| RULE-034 / FEAT-021 / DEC-027 | Основной UI/ошибки/help доступны на русском и английском по locale ОС; доступные labels для controls и numeric state/Auto/error не только цвет/иконка. Семантика чисел одинакова, нет скрытого перевода keys | RU/EN invalidpreset одинаковоеотклонение+локальныйтекст;screenreaderAuto/controlnames;largertext не скрывает путьSettings |
| RULE-035 / FEAT-021 / DEC-028 | Работоспособность на API26+ с target/compile37 и заданным Compose/toolchain. Основные manual/Auto/dim действия не требуют сети. Platform grants/user notification preferences уважаются; нет новой requirement менять dependencies/архитектуру | API26/37 launch иосновныеоперации;offlinemanual/Auto/dim;accessibility checks34+;widgets37memorylimitбезcrash |

Документ не вводит billing/ads/privacy-network-policy из Q-002. Offline независимость света следует из E05 и не равна утверждению «в приложении вообще нет сети». TESTING.md: JVM Jupiter6.1.3/CoroutinesTest1.11.0; AndroidJUnit4/Compose/UIAutomator2.4.0; Kover JVM-only, без coverage gate. Для физического результата нужен реальный экран, emulator недостаточен.

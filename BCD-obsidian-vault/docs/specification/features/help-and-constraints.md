# Справка, распространение и общие ограничения

[Глоссарий: термины и обозначения](../glossary.md). Местные пояснения сохраняют тот же смысл.

CAP-007/CAP-008. Нефункциональные требования опираются на существующую инфраструктуру нового проекта, не на выдуманные целевые метрики.

| RULE / Feature / DEC | Формулировка, применимость и результат | Необходимые примеры |
|---|---|---|
| RULE-032 / FEAT-019 / DEC-024 | Help доступна по первому предложению и повторно из интерфейса; объясняет numeric/Auto, overlay, защитное переключение, permissions, controls/widgets/timer и реальные platform ограничения. Нет secret Premium taps и promises unkillable/physical4press5s | Firstofferdismiss→manualreopen;текст0% неoff,negativeoverlay, delayedtimer,screen-eventsнеhardwareguarantee |
| RULE-033 / FEAT-020 / DEC-026 | Share открывает системный выбор получателя text/plain со ссылкой `https://play.google.com/store/apps/details?id=net.humblegames.brightnesscontroldimmer`; не передаёт settings/состояние экрана. Отсутствие получателя сообщить безcrash | Receiveravailable→chooser/correctlink;none→message;cancelchooser→lightunchanged |
| RULE-034 / FEAT-021 / DEC-027 | Основной UI/ошибки/help доступны на русском и английском по locale ОС; доступные labels для controls и numeric state/Auto/error не только цвет/иконка. Семантика чисел одинакова, нет скрытого перевода keys | RU/EN invalidpreset одинаковоеотклонение+локальныйтекст;screenreaderAuto/controlnames;largertext не скрывает путьSettings |
| RULE-035 / FEAT-021 / DEC-028 | Работоспособность на API26+ с target/compile37 и заданным Compose/toolchain. Основные manual/Auto/dim действия не требуют сети. Platform grants/user notification preferences уважаются; нет новой requirement менять dependencies/архитектуру | API26/37 launch иосновныеоперации;offlinemanual/Auto/dim;accessibility checks34+;widgets37memorylimitбезcrash |

Коммерческая политика Q-002 теперь задаётся отдельным [monetization](monetization.md); скрытые сетевые запросы/privacy/аналитика этим документом не принимаются. Offline независимость света следует из E05 и не равна утверждению «в приложении вообще нет сети». TESTING.md: JVM Jupiter6.1.3/CoroutinesTest1.11.0; AndroidJUnit4/Compose/UIAutomator2.4.0; Kover JVM-only, без coverage gate. Для физического результата нужен реальный экран, emulator недостаточен.

## Уточнение предмета review группы6 —2026-10-13

[Переработанные случаи1–12](../../workflows/group6-help-sharing-and-accessibility-review.md)
сохраняют предложения RULE-032–034, не принимают всю группу6 и не задают новые ID.
Общий принятый контекст навигации/отсчёта проверяется отдельными обоснованными
взаимодействиями, не повторением таймера/света во всех текстовых случаях.
Прямое уточнение пользователя: экран числового значения кнопки требует цифровую
клавиатуру. Числовой пример101 относится к Legacy upper100; диапазон новой версии
редактора/clamp ещё группа7. Cancel Share не ошибка; отказ запуска BCD и ошибка
отправки выбранного приложения различаются, форма сообщения ещё не выбрана.
В помощь не предлагаются внутренние BUG ID. Случаи не исчерпывающая тестовая матрица.

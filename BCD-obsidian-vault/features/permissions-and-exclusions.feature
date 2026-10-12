# language: en
# Общий глоссарий: ../docs/specification/glossary.md
Feature: Доступы Android и временное исключение затемнения

  Rule: RULE-016 Разрешения соответствуют выбранной возможности
    @FEAT-014 @SCN-022
    Scenario Outline: Не требовать overlay для ручной яркости и просмотра
      Given разрешение WRITE_SETTINGS "<write>" и SYSTEM_ALERT_WINDOW "<overlay>"
      And ОС поддерживает выбранную возможность
      When пользователь выбирает "<action>"
      Then результат "<result>"

      Examples:
        | write      | overlay    | action          | result                                |
        | выдано     | не выдано  | manual 25       | ручной режим и raw 63                 |
        | выдано     | не выдано  | Auto            | Auto без запроса overlay access       |
        | выдано     | не выдано  | negative -25    | объяснён недостающий overlay access    |
        | не выдано  | выдано     | Auto            | объяснён недостающий WRITE_SETTINGS    |
        | не выдано  | не выдано  | открыть help    | help открыта без запроса grants       |
        | не выдано  | не выдано  | открыть settings| настройки открыты без запроса grants  |

  Rule: RULE-017 Отказ и частичный результат не являются успехом
    @FEAT-014 @SCN-023
    Scenario: Не применять отклонённую команду после последующей выдачи разрешения
      Given SYSTEM_ALERT_WINDOW не выдано и overlay отсутствует
      When пользователь выбирает -25 и отказывается выдать разрешение
      Then BCD объясняет отказ и не показывает применённое затемнение
      When пользователь позднее выдаёт SYSTEM_ALERT_WINDOW без новой команды света
      Then overlay не появляется и прежняя отклонённая команда не применяется

    @FEAT-014 @SCN-024
    Scenario Outline: Показать фактический исход неуспешной операции
      Given главный экран BCD открыт с доступами "<access>"
      When при операции происходит "<failure>"
      Then пользователь видит "<result>"
      And BCD не сообщает о полностью применённой команде

      Examples:
        | access                        | failure                                     | result                                      |
        | необходимые grants выданы     | ОС отклоняет запись ручной яркости           | ошибка записи и прочитанное состояние ОС     |
        | необходимые grants выданы     | raw 12 принят, но создание overlay отклонено | частичный результат без действующего overlay|
        | необходимые grants выданы     | grant overlay отозван при active dimming     | overlay снят и доступ требуется снова        |
        | WRITE_SETTINGS отсутствует    | нет Activity для special access settings     | объяснение недоступного пути выдачи доступа  |

  Rule: RULE-018 Notification permission существует с API 33
    @FEAT-008 @SCN-025
    Scenario Outline: Учитывать API и отказ в уведомлениях
      Given устройство имеет API <api> и WRITE_SETTINGS выдано
      And POST_NOTIFICATIONS "<permission>"
      When пользователь включает быстрые controls и при запросе выбирает "<answer>"
      Then запрос POST_NOTIFICATIONS "<request>"
      And доступность controls в shade описана как "<availability>"
      And разрешённая ОС ручная команда 25 по-прежнему устанавливает raw 63

      Examples:
        | api | permission | answer | request         | availability                    |
        | 31  | неприменимо| нет    | не производится | определяется настройками ОС     |
        | 32  | неприменимо| нет    | не производится | определяется настройками ОС     |
        | 33  | не выдано  | отказ  | производится    | уведомления не разрешены        |
        | 37  | не выдано  | выдать | производится    | разрешены с учётом channel ОС    |

  Rule: RULE-030 Exclusions требуют только свой optional доступ
    @FEAT-015 @SCN-038
    Scenario: Отказ Usage access не блокирует основные команды
      Given exclusions выключены и Usage access отсутствует
      And WRITE_SETTINGS выдано
      When пользователь включает exclusions и отказывается выдать Usage access
      Then exclusions остаются выключены и причина объяснена
      And ручная команда 25 остаётся доступна
      And BCD не требует Accessibility access или custom app selection
      When пользователь позднее выдаёт Usage access без повторного включения exclusions
      Then exclusions остаются выключены

  Rule: RULE-031 Suspend и restore зависят от актуальной отрицательной цели
    @FEAT-015 @SCN-039
    Scenario Outline: Не восстанавливать overlay после отмены затемнения
      Given exclusions включены с Usage access и необходимые grants выданы
      And ОС принимает команды яркости и допускает overlay вне suspension
      And BCD имеет актуальную цель -25, raw 12 и таймер до 16:00 с длительностью 3 часа
      When распознано активное исключённое приложение com.android.vending
      Then overlay приостановлен, а цель -25, системный raw и deadline 16:00 сохранены
      When во время suspension происходит "<action>"
      Then состояние во время suspension описано как "<during>"
      When детектор получает "<detection>"
      Then результат "<result>"

      Examples:
        | action                                      | during                             | detection                      | result                                       |
        | нет других действий                         | -25 и срок 16:00 без overlay        | достоверное другое приложение   | overlay восстановлен с alpha 64/255          |
        | пользователь выбирает Auto                  | Auto без overlay и срока            | достоверное другое приложение   | Auto и отсутствие overlay                    |
        | истекает действующий таймер                  | запрос Auto без overlay и срока     | достоверное другое приложение   | Auto и отсутствие overlay                    |
        | в 14:00 пользователь выбирает -50            | -50 без overlay и новый срок 17:00   | достоверное другое приложение   | overlay восстановлен с alpha 128/255          |
        | пользователь выбирает 25                    | manual 25 без overlay и срока       | достоверное другое приложение   | ручной raw 63 и отсутствие overlay           |
        | отозван grant overlay                       | overlay отсутствует                 | достоверное другое приложение   | overlay отсутствует и показан отказ доступа   |
        | нет других действий                         | -25 и срок 16:00 без overlay        | пустой результат                | suspension сохранена, -25 и срок 16:00        |
        | нет других действий                         | -25 и срок 16:00 без overlay        | ошибка или неопределённый пакет | suspension сохранена, -25 и срок 16:00        |
        | отозван Usage access                        | exclusions выключены без overlay    | достоверное другое приложение   | старый overlay автоматически не возвращается |
        | Usage access отозван и позднее снова выдан   | exclusions остаются выключены       | достоверное другое приложение   | старый overlay автоматически не возвращается |

# language: en
# Общий глоссарий: ../docs/specification/glossary.md
Feature: Понятный интерфейс и заданные границы платформы

  Rule: RULE-032 Help объясняет реальное поведение
    @FEAT-019 @SCN-040
    Scenario: Повторно открыть справку после первого предложения
      Given пользователь уже закрывал первое предложение help
      When пользователь открывает help из BCD
      Then help доступна и объясняет, что 0% BCD не выключает экран, а negative означает overlay
      And timer описан с возможной задержкой ОС
      And защита описана screen-событиями без обещания аппаратных нажатий или неубиваемого service
      And taps по тексту help не меняют право доступа к функциям

  Rule: RULE-033 Share передаёт только ссылку приложения
    @FEAT-020 @SCN-041
    Scenario Outline: Поделиться ссылкой или объяснить отсутствие получателя
      Given системный получатель text/plain "<receiver>"
      And BCD имеет цель -25
      When пользователь выбирает Share
      Then результат "<result>"
      And настройки и состояние света не передаются получателю и не меняются

      Examples:
        | receiver    | result                                                                                                  |
        | доступен    | chooser с https://play.google.com/store/apps/details?id=net.humblegames.brightnesscontroldimmer             |
        | отсутствует | объяснение отсутствия получателя без crash                                                               |

  Rule: RULE-034 Язык не меняет правила и результат
    @FEAT-021 @SCN-042
    Scenario Outline: Объяснить ошибку и озвучить controls на языке ОС
      Given locale ОС "<locale>" и editor доступен с сохранённым preset 25
      When пользователь вводит недопустимый preset 101
      Then preset остаётся 25 и ошибка показана на языке "<language>"
      And controls имеют доступные имена и состояние Auto различимо без цвета или иконки

      Examples:
        | locale | language   |
        | ru-RU  | русском    |
        | en-US  | английском |

  Rule: RULE-035 Основные команды не зависят от сети на поддерживаемых API
    @FEAT-021 @SCN-043
    Scenario Outline: Управлять светом без подключения к сети
      Given устройство API <api> без сети и BCD с заданным targetSdk 37
      And необходимые grants выданы и ОС разрешает соответствующие операции
      When пользователь выбирает manual 25, затем negative -25, затем Auto
      Then manual устанавливает raw 63, negative устанавливает raw 12 и допустимый overlay, Auto убирает overlay
      And для этих команд не требуется сетевой ответ

      Examples:
        | api |
        | 26  |
        | 37  |

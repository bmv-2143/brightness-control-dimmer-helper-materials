# Brightness Control & Dimmer — вспомогательные материалы

Отдельный репозиторий для заметок, исходных материалов, результатов анализа и
вспомогательных инструментов, связанных с переписыванием приложения.

## Структура

- `BCD-obsidian-vault/` — хранилище Obsidian: заметки, вложения и документы.
- `BCD-obsidian-vault/Base/` — существующие заметки.
- `BCD-obsidian-vault/Files/` — существующие вложения; архивы здесь сохраняются в Git.
- `BCD-obsidian-vault/docs/specification/legacy-behavior-inventory.md` — место
  будущего отчёта об обнаруженном поведении Legacy. Отчёт пока не создан.
- `tools/obsidian/git-overview-stripes/` — сохранённая копия отдельно
  установленного плагина и архивы его версий.
- `AGENTS.md` — инструкции для работы Codex с этим репозиторием.

Git-репозиторий расположен в корне `BrightnessControlDimmerHelperMaterials`.
Внутри vault второго репозитория нет. Соседние `BrightnessControlDimmerLegacy`
и `BrightnessControlDimmer` имеют самостоятельные истории; их код сюда не копируется.

## Политика Obsidian

Под Git сохраняются все заметки и вложения, а также проверенные файлы настроек:
`app.json`, `appearance.json`, `hotkeys.json`, `core-plugins.json`,
`community-plugins.json` и собственные CSS snippets в `.obsidian/snippets/`.

Рабочие области, состояние графа, установленные плагины и темы, настройки
плагинов (`data.json`) и `.trash/` исключены через `.gitignore`.
Исключение файла из Git не удаляет его и не мешает Obsidian использовать его.
Для новых полезных настроек следует добавлять адресные исключения после проверки
содержимого. Учётные данные и настройки авторизации остаются локальными.

Списки плагинов не заменяют их установку и не сохраняют все персональные
настройки. При восстановлении их потребуется настроить заново. Для полной
резервной копии личного окружения нужна отдельная копия исключённой `.obsidian/`.

## Работа с Git из Obsidian и Codex

В установленном Obsidian Git 2.38.6 обнаружение родительского репозитория
поддерживается. Оставить `Custom base path (Git repository path)` пустым.
После первоначального создания репозитория перезагрузить Obsidian или плагин.

Использовать ручные операции. На момент настройки:

- `autoSaveInterval`, `autoPushInterval`, `autoPullInterval` равны `0`;
- `autoPullOnBoot` и `autoBackupAfterFileChange` выключены;
- `basePath` пустой.

Эти локальные настройки Obsidian Git не хранятся в репозитории. При восстановлении
их нужно проверить до выполнения Git-команд из плагина.

Во время работы Codex не запускать параллельно commit, pull, checkout или откат
из Obsidian. Операции «все изменения» затрагивают весь репозиторий, включая
`README.md`, `AGENTS.md` и `tools/` вне vault. Перед коммитом просматривать список
файлов. `Commit` сохраняет локальный коммит; `Commit-and-sync` по умолчанию
также делает pull и push. Remote пока не настроен.

Локальная ветка — `main`. `core.autocrlf=false` позволяет `.gitattributes`
управлять переводами строк; `core.quotepath=false` делает русские пути читаемыми
в выводе Git. Эти настройки относятся только к текущей копии репозитория.
При клонировании повторить:

```powershell
git config --local core.autocrlf false
git config --local core.quotepath false
```

Идентичности автора и коммитера наследуются из пользовательских настроек Git.
Активные hooks при инициализации отсутствовали; Android-проверки соседнего
репозитория к этим материалам не применяются.

## Восстановление Obsidian

1. Открыть `BCD-obsidian-vault` как хранилище Obsidian.
2. Установить нужные community plugins. Ниже зафиксированы версии существующих
   установок на момент начального коммита; это список окружения, а не требование
   автоматически обновлять или понижать версии.
3. Восстановить Git Overview Stripes по `tools/obsidian/git-overview-stripes/INSTALL.md`.
4. Включить плагины согласно `community-plugins.json` и восстановить личные
   настройки вручную. Проверить отключение автоматических операций Obsidian Git.

| Плагин | ID | Версия | Состояние при инициализации |
| --- | --- | --- | --- |
| Commander | `cmdr` | 0.5.7 | Включён |
| Editor Width Slider | `editor-width-slider` | 1.0.5 | Включён |
| Git Overview Stripes | `git-overview-stripes` | 1.0.1 | Включён, копия в `tools/` |
| Code Editor Shortcuts | `obsidian-editor-shortcuts` | 1.14.0 | Включён |
| Filename Heading Sync | `obsidian-filename-heading-sync` | 1.11.1 | Включён |
| Git | `obsidian-git` | 2.38.6 | Включён |
| Linter | `obsidian-linter` | 1.33.0 | Включён |
| Style Settings | `obsidian-style-settings` | 1.0.9 | Включён |
| Vault Changelog | `obsidian-vault-changelog` | 1.8.0 | Включён |
| Templater | `templater-obsidian` | 2.25.1 | Включён |
| Editing Toolbar | `editing-toolbar` | 4.1.4 | Установлен, отсутствует в списке включённых |

## Проверки перед коммитом

Просмотреть `git status` и diff, проверить изменённые JSON и убедиться, что
локальные данные Obsidian не попали в индекс. Для проверки правил:

```powershell
git check-ignore -v BCD-obsidian-vault/.obsidian/workspace.json
git check-ignore -v BCD-obsidian-vault/.obsidian/plugins/obsidian-git/data.json
git diff --cached --check
```

Существующие заметки и вложения сохраняются без редактирования. Отчёт о Legacy
создаётся только по отдельному запросу; в нём нужно фиксировать commit SHA
исследованной версии и пути доказательств относительно Legacy-репозитория.

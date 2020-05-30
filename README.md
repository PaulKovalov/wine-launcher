## Что это за проект?

**Wine Launcher** - Контейнер для Windows приложения на основе Wine.  

[Видео инструкция](https://www.youtube.com/watch?v=GRlebaAVWn8)  

**Основные идеи:**  
- Изолированность от системы  
- Для каждого приложения отдельный набор из Wine и Prefix-а  


##### Возможности:

- Отдельный **Wine\Prefix**
- Сжатие **Wine\Data** в **squash** образы для экономия места
- Обновление **Wine**
- Интеграция с **DXVK**, **MangoHud**, **VkBasalt**
- Поддержка нескольких приложений в одном порте
- Генерация патчей
- Диагностика

## Установка

1. Скачайте актуальный файл `start` со станицы [релизов](https://github.com/hitman249/wine-launcher/releases).
2. В любом месте создайте пустую директорию и переместите файл туда.
3. Сделайте файл исполняемым и запустите
   ```bash
   chmod +x ./start && ./start
   ```
4. Дождитесь инициализации.
5. Закройте лаунчер и переместите файл `start` в появившуюся папку `bin`.
6. Готово.

> В один Wine Launcher рекомендуется устанавливать только одну игру. Тогда вам будет удобней её сжимать для экономии
> места в разделе `Инструменты > Упаковка`

## Как сделать порт?

Принцип создания порта представляет собой создание слоёв - патчей.  
Любое действие должно быть проведено через систему патчей, будь то установка кодеков, настроек или игры.  
По завершении действия программа сгенерирует патч из **Prefix**-а откуда автоматически выдернет все внесённые изменения.  
Это позволяет отделять каждую программу друг от друга, а также отвязаться от **Prefix**-а, а значит и версии **Wine**.


#### Игры

Реализован простой запуск игр, но расширенный дополнительными возможностями, такими как расширенное логирование и
отображение счетчика FPS.

![Main](main.gif)


#### Обновление Wine

Удобный GUI для обновления Wine включает 5 репозиториев

![Main](wine.gif)


#### Настройка Prefix

  * В настройках prefix-а присутствует автоматическая установка DXVK, MangoHud, VkBasalt.  
  * Восстановление разрешения активного монитора после выхода из игры.  

![Main](prefix.gif)


#### Настройки игр

  * Все игры должны устанавливаться в папку по умолчанию, которая задана в настройках prefix-а по умолчанию `Games`.  
  * В самих играх можно задать оформление из **иконки** и **фона**.
  * В настройках игр путь указывается относительно папки `Games`. Будьте внимательны!
    Пример, если путь до исполняемого файла - `C:/Games/The super game/bin/game.exe`, то в настройку игры нужно писать
      - В поле **Путь до папки**: `The super game/bin`
      - В поле **Имя файла**: `game.exe`

![Main](games.gif)


#### Патчи

  * Всё что находится в **prefix**-е, оформляется в виде **патчей**.
  * Если вы используете сторонние патчи, то чтобы их применить необходимо пересоздать **prefix**.
  * Другими словами **prefix** не долгоживущая структура, пересоздавать его нужно при каждом изменении версии **wine** 
    или для накатывания сторонних патчей.

![Main](patches.gif)


#### Создание нового патча

При создании патча вам доступны следующие возможности:  
Перед началом обязательно прочтите **Настройки игр**  ^

  * Установка приложения(игры)
  * Установка приложения(игры) из образа диска
  * Регистрация `dll`, `ocx` библиотек
  * **Winetricks**, доступен из коробки
  * Wine Config
  * Wine File Manager
  * Wine Regedit

![Main](patch.gif)

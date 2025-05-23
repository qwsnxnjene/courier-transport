

# Система аренды транспортных средств для курьеров

## Настройка и запуск проекта

### Бэкенд
Для запуска проекта в главной директории выполните команду:
```powershell
npm start
```
Перед запуском проверятся зависимости(при необходимости будут запущены команды npm install и go mod tidy)
## Организация работы

### Коммуникация
- Обсуждение задач и решений происходит в Telegram
- Все задачи фиксируются в Issues GitHub

### Работа с задачами
1. Создаем Issue с четким описанием ожидаемого результата
2. Помечаем соответствующими тегами (Frontend/Backend)
3. При необходимости декомпозируем на подзадачи
4. После обсуждения приступаем к реализации

## Стиль кода

### Бэкенд (Go)
- Следование [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- `camelCase` для переменных и функций
- `PascalCase` для экспортируемых имен
- Короткие осмысленные названия переменных
- Документация для экспортируемых функций и типов
- Явная обработка ошибок
- Использование context для долгих операций

### Фронтенд (React)
- Следование [React Style Guide]([https://vuejs.org/style-guide/](https://dev.to/abrahamlawson/react-style-guide-24pp))
- `camelCase` для методов и переменных
- `PascalCase` для компонентов
- `kebab-case` для имен компонентов в шаблонах

Комментарии оставляем только там, где это действительно необходимо

## Работа с Git

1. Создаем ветку от `dev`:
   ```bash
   git checkout origin/dev
   git fetch
   git pull
   ```

2. Создаем Issue в GitHub с тегами (Backend/Frontend)

3. Создаем ветку для задачи:
   ```bash
   git checkout -b "название-задачи" origin/dev
   ```

4. Названия коммитов в формате:  
   `<номер-таски>-Название-коммита`  
   (осмысленные сообщения, ясно отражающие изменения)

5. Пушим изменения в свою ветку:
   ```bash
   git push origin название-ветки
   ```

**Важно:**
- Запрещено пушить напрямую в `main` или `dev`
- После пуша создаем Pull Request в `dev`
- В `main` попадает только стабильная версия

## Участники проекта
[Халимов Данил](https://github.com/qwsnxnjene)
[Кабиров Ильдар](https://github.com/IldarKab)
[Ширгалин Осман](https://github.com/shirgx)

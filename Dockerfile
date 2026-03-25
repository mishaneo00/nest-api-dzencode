# ЭТАП 1: Сборка (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ЭТАП 2: Запуск (Runtime)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# 1. Копируем скомпилированные файлы
COPY --from=builder /app/dist ./dist

# 2. --- ВОТ ЭТА СТРОКА ДЛЯ ОТЛАДКИ ---
# Она выведет структуру папок в терминал во время сборки
RUN ls -R ./dist

# 3. Копируем остальное
COPY --from=builder /app/client ./client
COPY --from=builder /app/temp ./temp
COPY --from=builder /app/uploads ./uploads

RUN mkdir -p temp uploads

EXPOSE 3000

# 4. Проверь этот путь после того, как увидишь вывод от ls -R
CMD ["node", "dist/src/main.js"]
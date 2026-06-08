# Stage 1: Сборка приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем описание зависимостей и схему Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем все зависимости (включая devDependencies для сборки TypeScript)
RUN npm ci

# Копируем исходный код
COPY . .

# Генерируем типы Prisma Client и запускаем компиляцию Next.js
RUN npx prisma generate
RUN npm run build

# Stage 2: Запуск в продакшене
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Копируем из сборочного контейнера только необходимые файлы для работы
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Создаем папку для монтирования персистентной БД SQLite
RUN mkdir -p /app/data

EXPOSE 3000

# Перед стартом применяем миграции к базе данных, затем запускаем Next.js
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

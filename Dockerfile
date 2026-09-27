# Đổi từ node:18-alpine sang node:22-alpine
FROM node:22-slim

WORKDIR /shopapp

# 1. Copy package gốc và cài đặt dependency gốc
COPY package*.json yarn.lock* ./
RUN yarn install

# 2. Copy toàn bộ code vào container
COPY . .

# 3. Cài đặt dependency cho cả backend và fontend
RUN cd backend && yarn install
RUN cd fontend && yarn install

EXPOSE 3000 5000

# 4. Chạy script start
CMD ["yarn", "start"]
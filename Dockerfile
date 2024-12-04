# 1. Node.js 이미지를 사용하여 빌드
FROM node:20 AS build

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_FRONT_BASE_URL
ARG VITE_BACK_BASE_URL
ARG VITE_SOCKET_URL

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_FRONT_BASE_URL=$VITE_FRONT_BASE_URL
ENV VITE_BACK_BASE_URL=$VITE_BACK_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 파일 복사
COPY . .

# Vite로 빌드
RUN npm run build

# 2. Nginx 이미지를 사용하여 배포
FROM nginx:latest

# Nginx 기본 설정을 대체
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Vite 빌드 파일을 Nginx HTML 디렉토리에 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx가 3000 포트로 서비스
EXPOSE 3001

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
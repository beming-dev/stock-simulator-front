# 1. Node.js 이미지를 사용하여 빌드
FROM node:20 AS build

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

# Nginx가 80 포트로 서비스
EXPOSE 80

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
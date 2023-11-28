FROM node:18-alpine

RUN mkdir -p /app

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

CMD ["node", "index.js"]
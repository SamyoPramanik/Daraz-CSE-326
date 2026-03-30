FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN apk update && apk add --no-cache curl
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && apk update && apk add --no-cache curl

COPY . .
ARG NEXT_INTERNAL_SERVER_URL
ENV NEXT_INTERNAL_SERVER_URL=$NEXT_INTERNAL_SERVER_URL
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
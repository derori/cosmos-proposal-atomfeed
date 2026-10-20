FROM node:24-slim

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]

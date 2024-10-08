FROM node:21.7.1

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]

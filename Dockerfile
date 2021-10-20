FROM node:16.4.0

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]

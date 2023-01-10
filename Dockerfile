FROM node:19.2.0

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]

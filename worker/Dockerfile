FROM node:16-alpine
RUN apk --update add npm
RUN npm install -g typescript && \
    npm install -g ts-node

COPY . /opt
WORKDIR /opt
CMD node app.js


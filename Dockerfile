FROM node:12
ENV NODE_ENV production
WORKDIR /home/node
COPY package.json package-lock.json /home/node/
RUN npm ci
COPY dist /home/node/dist
EXPOSE 3000
USER node
CMD [ "npm", "start" ]

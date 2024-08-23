FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install pm2 -g

COPY . .

RUN npx prisma generate
RUN npm run build


CMD ["pm2-runtime", "ecosystem.config.js"]
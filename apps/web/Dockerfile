FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm install

EXPOSE 3000

CMD ["sh", "-c", "npm run build --workspace @ksl/shared && npm run dev --workspace @ksl/web"]

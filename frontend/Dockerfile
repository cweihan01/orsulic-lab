# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /frontend

# copy only package manifests & install
COPY package*.json ./
RUN npm ci

# copy the rest of your source & build production bundle
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /frontend

# install a tiny static server
RUN npm install -g serve

# pull in just the build output
COPY --from=builder /frontend/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]

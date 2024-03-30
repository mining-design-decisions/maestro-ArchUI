FROM node:21-alpine3.18 AS build

WORKDIR /app

CMD ["npm", "run", "dev", "--", "--host"]

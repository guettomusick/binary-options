FROM node:10

# Set working directory
WORKDIR /app

# Copy client package.json
COPY package* yarn* ./

RUN yarn

# Copy directory to container
COPY . ./

CMD ["yarn", "executor"]

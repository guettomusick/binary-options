FROM node:14

# Set working directory
WORKDIR /app

# Copy client package.json and yarn.lock and install dependencies
COPY package* yarn* ./
RUN yarn

# Copy directory to container
COPY . ./
# Compile smart contracts
RUN yarn compile

CMD ["yarn", "executor"]

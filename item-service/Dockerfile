# Step 1: Base image
FROM node:18-alpine

# Step 2: Box ke andar folder
WORKDIR /app

# Step 3: Package files copy
COPY package*.json ./
RUN npm install

# Step 4: Baaki code copy
COPY . .

# Step 5: Server chalu
CMD ["npm", "start"]
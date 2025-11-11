# Step 1: Base image (Node.js ka box)
FROM node:18-alpine

# Step 2: Box ke andar ek folder banayein
WORKDIR /app

# Step 3: 'npm install' karne ke liye package files copy karein
COPY package*.json ./
RUN npm install

# Step 4: Baaki saara code copy karein
COPY . .

# Step 5: Server ko chalu karne ka command
CMD ["npm", "start"]
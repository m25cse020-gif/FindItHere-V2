# --- STAGE 1: Build the React App ---
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# React app ko build karein
RUN npm run build

# --- STAGE 2: Serve the App ---
# Ek chhota web server (nginx) istemaal karein
FROM nginx:alpine

# Pehle stage se build folder ko web server mein copy karein
COPY --from=builder /app/build /usr/share/nginx/html

# Port 80 par server chalega
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
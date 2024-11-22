# Step 1: Build the React app
FROM node:16 as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app source code
COPY . .

# Build the app for production
RUN npm run build && ls -l /app/build

# Step 2: Serve the built app using Nginx
FROM nginx:alpine AS production-stage

# Copy the built files from the previous stage to the Nginx web root
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
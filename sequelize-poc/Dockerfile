# Use an official Node.js LTS image as the base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# and install dependencies. This step is cached if package.json doesn't change.
COPY package.json ./
# If you have a package-lock.json, uncomment the following line:
COPY package-lock.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application - this will be executed by docker-compose or manually
# We'll define a script in package.json to manage the execution of the examples
CMD ["npm", "run", "start:docker"]

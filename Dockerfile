# Official Image using node 20 alphine
FROM node:20-alpine

# working directory 
WORKDIR /dumpstore/backend

# Changes in package* . json file 
COPY package*.json ./

# Install dependencies using npm ci for faster, consistent installs
RUN npm ci \
    && npm cache clean --force

 # Add node_modules/.bin to PATH for easier access to executables
ENV PATH /dumpstore/backend/node_modules/.bin:$PATH

# Copy all changes 
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# expose the app on port 9009
EXPOSE 3008

# Start the server
CMD ["node", "dist/server.js"]
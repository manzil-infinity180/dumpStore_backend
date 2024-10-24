# Official Image using node 20 alphine
FROM node:20-alpine

# working directory 
WORKDIR /dumpstore/backend

# Changes in package* . json file 
COPY package*.json ./

# Install Dependencies
RUN npm install

# Copy all changes 
COPY . .

# expose the app on port 9009
EXPOSE 3008

# Start the server
CMD ["npm", "start"]
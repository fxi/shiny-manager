FROM node:21-alpine

# Install shiny-manager from npm 
RUN npm install -g @fxi/shiny-manager --loglevel=error && \
    npm cache clean --force

# Verify the binary is installed correctly
RUN ls -la $(which shiny-manager)

# Run version check as default command
CMD ["shiny-manager", "--version"]
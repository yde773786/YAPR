FROM node:14
ENV NPM_CONFIG_LOGLEVEL info

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json .

RUN npm install

RUN apt-get update && apt-get install \
    git libx11-xcb1 libxcb-dri3-0 libxtst6 libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 \
    -yq --no-install-suggests --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \

RUN npm install --save electron
RUN npm install prismjs
RUN npm install electron-builder

COPY . .
CMD ["npm", "start"]

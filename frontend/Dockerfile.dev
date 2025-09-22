FROM node:20-alpine

WORKDIR /app

# Nainštaluj Quasar CLI globálne
RUN npm install -g @quasar/cli

# Skopíruj celý projekt (nie len package.json)
COPY . .

# Nainštaluj všetky dependencies (aj dev)
RUN npm install

EXPOSE 9000

CMD ["quasar", "dev"]

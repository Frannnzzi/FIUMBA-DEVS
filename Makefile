.PHONY: start-db run-backend stop-db start-backend start-frontend run-frontend run-all

start-db:
	cd ./Backend && docker compose up -d

stop-db:
	cd ./Backend && docker compose down

start-backend:
	cd ./Backend && npm run dev

start-frontend:
	cd ./Frontend && python3 -m http.server 3000

run-frontend: start-frontend

run-backend: start-db start-backend

run-all: start-db start-backend start-frontend
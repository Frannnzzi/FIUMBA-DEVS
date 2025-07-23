.PHONY: start-db run-backend stop-db start-backend start-frontend run-frontend run-all

start-db:
	cd ./backend && docker compose up -d db

stop-db:
	cd ./backend && docker compose down db

################################################

start-project:
	cd ./Backend && docker compose up -d

stop-project:
	cd ./Backend && docker compose down

start-backend:
	cd ./Backend && docker compose up backend

stop-backend:
	cd./Backend && docker compose down backend

run-project: start-project

################################################

start-frontend:
	cd ./Backend && docker compose up frontend

stop-frontend:
	cd ./Backend && docker compose down frontend

run-frontend: start-frontend

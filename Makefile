.PHONY: start-db run-backend stop-db start-backend # Todos los objetivos .PHONY en la misma línea

start-db:
	cd ./Backend && docker compose up -d # Esta línea DEBE empezar con UNA TABULACIÓN

stop-db:
	cd ./Backend && docker compose down # Esta línea DEBE empezar con UNA TABULACIÓN

start-backend:
	cd ./Backend && npm run dev

run-backend: start-db start-backend
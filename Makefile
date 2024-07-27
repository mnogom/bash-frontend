install:
	@echo "=== 🗑️ Installing ==="
	npm install

run:
	@echo "=== 🏃 Running ==="
	npm run dev

build:
	@echo "=== 📦 Building ==="
	npm run build

build-no-ssl:
	@echo "=== 🐳 Building Docker no SSL ==="
	docker build --tag mnogom/bash-frontend-no-ssl --target no-ssl --progress plain .

build-ssl:
	@echo "=== 🐳 Building Docker with SSL ==="
	docker build --tag mnogom/bash-frontend --progress plain .


build-docker: build-no-ssl build-ssl


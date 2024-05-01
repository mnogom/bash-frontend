install:
	@echo "=== 🗑️ Installing ==="
	npm install

run:
	@echo "=== 🏃 Running ==="
	npm run dev

build:
	@echo "=== 📦 Building ==="
	npm run build

build-docker:
	@echo "=== 🐳 Building Docker ==="
	docker build \
		--tag mnogom/bash-frontend \
		.
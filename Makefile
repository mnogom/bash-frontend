install:
	@echo "=== 🗑️ Installing ==="
	npm install

run:
	@echo "=== 🏃 Running ==="
	npm run dev

build:
	@echo "=== 📦 Building ==="
	npm run build

build-docker: build
	@echo "=== 🐳 Building Docker ==="
	docker build \
		--tag mnogom/bash-frontend-without-ssl \
		-f Dockerfile.without-ssl \
		.; \
	docker build \
		--tag mnogom/bash-frontend-with-ssl \
		-f Dockerfile.with-ssl \
		.

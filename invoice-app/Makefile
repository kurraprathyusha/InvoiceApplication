.PHONY: setup dev backend frontend

# ─── First-time setup ────────────────────────────────────────────────────────
setup:
	@echo "==> Installing frontend dependencies..."
	cd frontend && npm install
	@echo "==> Downloading backend Maven dependencies..."
	cd backend && JAVA_HOME=$$(/usr/libexec/java_home -v 17) mvn dependency:resolve -q
	@echo ""
	@echo "✓ Setup complete. Run 'make dev' to start the app."
	@echo "  Make sure MySQL is running and a database 'invoice_db' is accessible."

# ─── Start both servers ───────────────────────────────────────────────────────
dev:
	@echo "==> Starting backend (port 8080) and frontend (port 5173)..."
	@trap 'kill 0' INT; \
	  (cd backend && JAVA_HOME=$$(/usr/libexec/java_home -v 17) mvn spring-boot:run -q 2>&1 | sed 's/^/[backend] /') & \
	  (cd frontend && npm run dev 2>&1 | sed 's/^/[frontend] /') & \
	  wait

# ─── Individual targets ───────────────────────────────────────────────────────
backend:
	cd backend && JAVA_HOME=$$(/usr/libexec/java_home -v 17) mvn spring-boot:run

frontend:
	cd frontend && npm run dev

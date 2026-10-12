# KubeWatch — Kubernetes Deployment & Observability

A from-scratch local Kubernetes project using kind, React + Vite, FastAPI, Docker, GitHub Actions, and optional Prometheus/Grafana.

## Architecture
Browser :8080 → React/Nginx frontend → FastAPI backend (2 replicas) → Kubernetes Service

## Requirements
Docker Desktop running, `kubectl`, `kind`, and Git. Python/Node are only needed for local development.

## Run on Windows PowerShell
From the extracted folder:
```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\kind-up.ps1
```
Open http://localhost:8080, health at http://localhost:8080/api/health, status at http://localhost:8080/api/api/status. Keep the terminal open for port-forwarding; Ctrl+C stops forwarding.

## Verify
```powershell
kubectl get nodes
kubectl get pods,services -n kubewatch
kubectl logs deployment/kubewatch-backend -n kubewatch
```
Self-healing demo:
```powershell
kubectl delete pod -n kubewatch -l app=kubewatch-backend
kubectl get pods -n kubewatch -w
```
Scale:
```powershell
kubectl scale deployment/kubewatch-backend -n kubewatch --replicas=3
kubectl get pods -n kubewatch
```

## Local tests (optional)
Backend:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m pytest -v
cd ..
```
Frontend:
```powershell
cd frontend
npm install
npm run build
cd ..
```

## CI
`.github/workflows/ci.yml` runs backend tests, Bandit, pip-audit, frontend build, and Docker image builds. It does not deploy to a remote cluster.

## Optional monitoring
See `k8s/monitoring/README.md` for a Prometheus/Grafana starter guide. Install separately; monitoring is not part of the quick-start to keep local resource usage manageable.

## Cleanup
```powershell
kind delete cluster --name kubewatch
```

Security notes: the backend container runs as non-root and manifests include probes and resource limits. This is a local learning/demo project, not a production deployment.

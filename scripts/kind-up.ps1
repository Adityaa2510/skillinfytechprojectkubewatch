$ErrorActionPreference = "Stop"
$ClusterName = "kubewatch"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

foreach ($tool in @("docker", "kubectl", "kind")) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Required command '$tool' not found. Install it and reopen PowerShell." }
}
docker info | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Docker Desktop is not running. Start it and retry." }

$clusters = kind get clusters
if ($clusters -notcontains $ClusterName) {
  kind create cluster --name $ClusterName --wait 120s
  if ($LASTEXITCODE -ne 0) { throw "kind cluster creation failed." }
} else { Write-Host "Using existing kind cluster '$ClusterName'." }

docker build -t kubewatch-backend:local ./backend
if ($LASTEXITCODE -ne 0) { throw "Backend image build failed." }
docker build -t kubewatch-frontend:local ./frontend
if ($LASTEXITCODE -ne 0) { throw "Frontend image build failed." }

kind load docker-image kubewatch-backend:local --name $ClusterName
if ($LASTEXITCODE -ne 0) { throw "Loading backend image failed." }
kind load docker-image kubewatch-frontend:local --name $ClusterName
if ($LASTEXITCODE -ne 0) { throw "Loading frontend image failed." }

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl rollout status deployment/kubewatch-backend -n kubewatch --timeout=180s
if ($LASTEXITCODE -ne 0) { throw "Backend deployment did not become ready." }
kubectl rollout status deployment/kubewatch-frontend -n kubewatch --timeout=180s
if ($LASTEXITCODE -ne 0) { throw "Frontend deployment did not become ready." }

kubectl get pods,services -n kubewatch -o wide
Write-Host "`nDashboard: http://localhost:8080"
Write-Host "Keep this window open for port-forwarding. Press Ctrl+C to stop forwarding."
kubectl port-forward -n kubewatch service/kubewatch-frontend 8080:80

# Optional Prometheus + Grafana

Monitoring is intentionally optional so the base app works on a modest laptop.

With Helm installed and internet access:
```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```
Then port-forward Grafana and explore Kubernetes pod/deployment dashboards. This is not run by the quick-start script and can use significant memory.

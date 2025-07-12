kubectl apply -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add mongodb https://mongodb.github.io/helm-charts || true
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack
helm upgrade --install kubernetes-operator mongodb/mongodb-kubernetes --namespace mongodb --create-namespace
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.18.0 --set installCRDs=true

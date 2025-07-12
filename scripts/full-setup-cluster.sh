if kind get clusters | grep -q kind; then
    kind delete cluster
fi
kind create cluster --config local.kind.config.yaml

# check if params --build if exist build docker image
if [[ $1 == "--build" ]]; then
    sh scripts/build-docker-image.sh
fi

sh scripts/load-images-to-kind.sh

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add mongodb https://mongodb.github.io/helm-charts || true
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add jetstack https://charts.jetstack.io
helm repo update
kubectl apply -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack
helm upgrade --install kubernetes-operator mongodb/mongodb-kubernetes --namespace mongodb --create-namespace
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.18.0 --set installCRDs=true

#start load balancer

kubectl apply -f k8s -R

echo "✅ Cluster created successfully and configured."
echo "Assure you have install kind-loadbalancer and start load balancer with admin permission using command sudo ~/go/bin/cloud-provider-kind"
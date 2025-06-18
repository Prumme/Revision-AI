# Setup 

1. Lancer le cluster kind
```bash
kind create cluster --config=k8s/local.kind.config.yaml
```

2. Build image production (pour les rendre disponible dans kind)
```bash
sh scripts/build-docker-image.sh
```

3. Loader les images dans kind
```bash
sh scripts/load-images-to-kind.sh #load les images précédement build dans chaque noeud du cluster
```

4. Créer une config map et un secret avec les clé du .env.example copier le contenu et s'assurer que les env secret ne sont pas présente dans la config map
```bash
kubectl create configmap NAME --from-env-file=./.env --dry-run=client -o=yaml 
kubectl create secret generic NAME --from-env-file=./.env --dry-run=client -o=yaml
#n'execute pas sur le cluster mais affiche en console le yaml a apply
```

5. Installer l'operator k8s rabbitmq pour le clustering
```bash
kubectl apply -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml
```

6. Créer un yaml de type `RabbitmqCluster` suivant la documentation, ces etapes on créer un secret nommé `rabbitmq-default-user` qui permet de s'authentifier aux servers rabbitmq dans les app

7. Retirer la clé RABBITMQ_URL de la config map et utiliser la `connection_string` présente dans le secret  `rabbitmq-default-user` dans les déployements
```yaml
env:
    - name: RABBITMQ_URL
    valueFrom:
        secretKeyRef:
        name: rabbitmq-default-user
        key: connection_string
```

8. Créer les deployements des services `api`, `file-parser`, `quiz-generator` en utilisant la `RABBITMQ_URL` du cluster

9. Créer un service pour les pods `api` afin d'exposer sur `8080` sur le noeud (temporaire utilisé ingress par la suite)

10. Lancer un port-forward du service `api-service` sur localhost:8080 afin d'acceder a l'api pour upload un fichier 
```bash
kubectl port-forward service/api-service 8080:8080
```

11. installer helm macos
```bash
brew install helm
```

12. Installer prometheus pour obtenir les metrics business mais aussi les metrics des pods pour définir les ressources necessaire
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

13. Obtenir les credential de connexion graphana dans le secret créer par le chart helm  et se connecter a graphana (se rendre sur http://localhost:8080)
```bash
kubectl get secrets prometheus-grafana -o=yaml
kubectl port-forward services/prometheus-grafana 8080:80
```

14. Exporter les metrics de rabitmq, rabbitmq cluster operator vient créer des server rabbitmq avec un exporter prometheus déjà configurer sur le port 15692/TCP il est déjà exposer dans le service/rabbitmq créer par l'operateur. Il faut créer un `ServiceMonitor` (CRD de prometheus-operator) pour spéicifé a prometheus ou scrapper les informations.

15. Afficher dans graphana les metrics de rabbitmq avec l'id du dashboard graphana `10991`

16. Créer un le service `quiz-generator` pour exposer le serveur metrics prometheus en clusterIP, puis créer un  `ServiceMonitor` pour créer une target prometheus sur le serveur metrics exposé par le service  `quiz-generator`, Créer un dashboard grapahana pour voir les infos

17. Pour logger les pod business il faut ajouter un label a chaque deployement template avec le label debug=true et tapper la commande
```bash
kubectl logs -l debug=true --all-containers=true -f --max-log-requests=20
```
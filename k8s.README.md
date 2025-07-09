# Setup Kubernetes

## 1. Lancer le cluster kind

```bash
kind create cluster --config=k8s/local.kind.config.yaml
```

La configuration kind crée un cluster avec 1 nœud master et 2 nœuds workers, avec redirection de port sur les nœuds workers pour l’ingress.

---

## 2. Build de l’image production

```bash
sh scripts/build-docker-image.sh
```

Cette étape construit les images Docker pour les rendre disponibles dans kind.

---

## 3. Charger les images dans kind

```bash
sh scripts/load-images-to-kind.sh
```

Charge les images précédemment buildées dans chaque nœud du cluster kind.

---

## 4. Créer une ConfigMap et un Secret à partir du fichier `.env`

```bash
kubectl create configmap NAME --from-env-file=./.env --dry-run=client -o=yaml
kubectl create secret generic NAME --from-env-file=./.env --dry-run=client -o=yaml
```

- Copier le contenu et vérifier que les variables sensibles (secrets) ne sont **pas** présentes dans la ConfigMap.
- Ces commandes n’appliquent pas directement sur le cluster mais affichent le YAML à appliquer.

---

## 5. Installer l’operator Kubernetes RabbitMQ pour le clustering

```bash
kubectl apply -f https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml
```

---

## 6. Créer un manifest `RabbitmqCluster`

Suivre la documentation officielle pour créer un `RabbitmqCluster`.
Cela génère un secret nommé `rabbitmq-default-user` utilisé pour s’authentifier aux serveurs RabbitMQ dans les applications.

---

## 7. Mettre à jour les déploiements pour utiliser le secret RabbitMQ

Retirer la clé `RABBITMQ_URL` de la ConfigMap et utiliser la `connection_string` présente dans le secret `rabbitmq-default-user` :

```yaml
env:
  - name: RABBITMQ_URL
    valueFrom:
      secretKeyRef:
        name: rabbitmq-default-user
        key: connection_string
```

---

## 8. Créer les déploiements des services

Déployer les services `api`, `file-parser`, `quiz-generator` en utilisant la variable `RABBITMQ_URL` du cluster.

---

## 9. Créer un service pour les pods `api`

Exposer le service `api` sur le port `8080` du nœud (temporaire, l’ingress sera utilisé ensuite).

---

## 10. Faire un port-forward sur le service `api-service`

```bash
kubectl port-forward service/api-service 8080:8080
```

Permet d’accéder à l’API localement pour uploader un fichier.

---

## 11. Installer Helm (sur macOS)

```bash
brew install helm
```

---

## 12. Installer Prometheus pour la collecte des métriques

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

Permet d’obtenir les métriques business et les métriques des pods pour définir les ressources nécessaires.

---

## 13. Récupérer les credentials Grafana et se connecter

```bash
kubectl get secrets prometheus-grafana -o=yaml
kubectl port-forward services/prometheus-grafana 8080:80
```

Se connecter à Grafana via [http://localhost:8080](http://localhost:8080).

---

## 14. Exporter les métriques RabbitMQ

Le RabbitMQ Cluster Operator crée des serveurs RabbitMQ avec un exporter Prometheus configuré sur le port `15692/TCP`.
Ce port est exposé dans le service `rabbitmq` créé par l’opérateur.
Il faut créer un `ServiceMonitor` (CRD de Prometheus Operator) pour spécifier à Prometheus où scrapper les métriques.

---

## 15. Afficher les métriques RabbitMQ dans Grafana

Utiliser le dashboard Grafana avec l’ID `10991`.

---

## 16. Configurer les métriques pour `quiz-generator`

- Créer un service `quiz-generator` exposant le serveur métriques Prometheus en `ClusterIP`.
- Créer un `ServiceMonitor` pour ajouter une cible Prometheus sur ce service.
- Créer un dashboard Grafana pour visualiser les métriques.

---

## 17. Logger les pods business

Ajouter un label `debug=true` dans le template des déploiements, puis lancer la commande :

```bash
kubectl logs -l debug=true --all-containers=true -f --max-log-requests=20
```

---

## 18. Mise à jour des Secrets et ConfigMaps

Mettre à jour pour supporter les nouvelles fonctionnalités : MinIO, Stripe, utilisateurs, billing API.
Recréer ConfigMaps et Secrets avec les nouvelles variables d’environnement.

```bash
kubectl create configmap NAME --from-env-file=./.env --dry-run=client -o=yaml
kubectl create secret generic NAME --from-env-file=./.env --dry-run=client -o=yaml
```

- Ne prendre que ce qui est utile aux services backend.
- Ne pas inclure les variables front-end dans ConfigMap ou Secret.
- Bien distinguer variables d’environnement secrètes et non secrètes.

---

## 20. Mettre en place un cluster MongoDB

Créer un namespace `mongodb` et installer MongoDB via Helm :

```bash
helm repo add mongodb https://mongodb.github.io/helm-charts
helm install kubernetes-operator mongodb/mongodb-kubernetes --namespace mongodb --create-namespace
```

---

## 21. Créer les ressources MongoDB

Créer les secrets et le ReplicaSet dans `k8s/mongo`.

---

## 22. Ajouter la MongoDB URI en secret global

URI MongoDB à utiliser :
`mongodb://<user>:<password>@mongodb-svc.mongodb.svc.cluster.local:27017/revisionAI?replicaSet=mongodb&authSource=admin`

> Note : `authSource=admin` est nécessaire, je n’ai pas réussi à faire fonctionner l’auth avec un autre utilisateur.

---

## 23. Installer l’Ingress NGINX

```bash
kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml
```

---

## 24. Modifier la configuration du déploiement de l’Ingress Controller

Ajouter un `nodeSelector` plus spécifique pour forcer le pod sur `worker1` :

Avant :

```yaml
nodeSelector:
  kubernetes.io/os: linux
```

Après :

```yaml
nodeSelector:
  kubernetes.io/os: linux
  ingress-ready: "true"
```

---

## 26. Ajouter le label `ingress-ready=true` sur le nœud `worker1`

```bash
kubectl label node kind-worker1 ingress-ready=true
```

---

## 27. Supprimer les pods controllers existants

```bash
kubectl delete pod -n ingress-nginx -l app.kubernetes.io/component=controller
```

L’ingress controller devrait alors être déployé uniquement sur `worker1`.

Exemple de sortie :

```bash
kubectl get pods -n ingress-nginx -o wide

NAME                                        READY   STATUS      RESTARTS   AGE     IP            NODE           NOMINATED NODE   READINESS GATES
ingress-nginx-admission-create-q9scv        0/1     Completed   0          30m     10.244.2.16   kind-worker2   <none>           <none>
ingress-nginx-admission-patch-8887s         0/1     Completed   1          30m     10.244.2.17   kind-worker2   <none>           <none>
ingress-nginx-controller-5dbfb97bbd-qrftd   1/1     Running     0          5m20s   10.244.1.20   kind-worker1  <none>           <none>
```

---

## 28. Modifier le fichier `etc/hosts` pour les domaines de test

Ajouter la ligne suivante :

```bash
127.0.0.1 api.revision-ai.local
```

Tester l’API à l’adresse : [http://api.revision-ai.local](http://api.revision-ai.local)


# DEPLOYEMENT SCALEWWAY

# 29. Créer une action GitHub pour le déploiement
Faire le build et le push des images dockers des services,
Et modifier les deployement pour utiliser les dernières images.

# 30. Limiter la ressources du rabitMQ
Les services dépendant de rabbitMQ ne se lancais pas correctement parce que RabbitMQ n’avait pas assez de ressources pour lancer ses pods
Etapes pour debbuger
- Regarder les logs du service failed, se rendre compte que le service ne se connecte pas a RabbitMQ
- Voir l'ip du service rabbitMQ, -> Bonne addresse bon port
- Regarder l'état du pod RabbitMQ, avec describe, voir les events warning : `0/2 nodes are available: 1 Insufficient cpu, 2 Insufficient memory. preemption: 0/2 nodes are available`
- Voir comment limiter les ressources de RabbitMQ https://www.rabbitmq.com/kubernetes/operator/troubleshooting-operator & https://github.com/rabbitmq/cluster-operator/tree/main/docs/examples/resource-limits

# 31 obtenir l'addresse fournis par le load balancer notre url internet pour acceder au cluster
kubectl --kubeconfig c.yaml get svc --all-namespaces

# 32 editer l'ingress pour qu'il soit lier a l'ingressClassName nginx
kubectl edit ingress api-ingress -n default
et ajouter la ligne ingressClassName: nginx dans spec sans ca 404
apres ca on a eu un 502 BadGateway, en analysant il semblait que les pod api-service était deffectueux pas connecté a mongo

# 33 limiter la ressource mongodb
Pareil pour mongo probleme avec les limites de ressource
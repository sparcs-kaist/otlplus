# Deployment Resource Definitions for Taxi Backend Service

### directories
```
├── README.md
├── base
│   ├── kustomization.yaml
│   ├── redis
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   └── server
│       ├── configmap.yaml
│       ├── deployment.yaml
│       ├── ingress.yaml
│       ├── sealed-secret.yaml
│       ├── secret-template.yaml
│       ├── secret.yaml
│       └── service.yaml
└── overlays
    └── dev
        └── kustomization.yaml
```

*under base folder*
- shared resource definitions for all environments

*under overlay folder*
- environment specific settings
- you can add more environments

### Using kubeseal
[Document Notion Link](https://www.notion.so/sparcs/K8S-Sealed-Secret-kubeseal-c3e315e429c442bebf8998b048404e17) [sparcs only]
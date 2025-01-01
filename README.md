# Curl Edu

Un outil pédagogique pour l'apprentissage et la compréhension de curl et des requêtes HTTP. Ce projet sert de support de cours pour enseigner :
* Les fondamentaux des requêtes HTTP
* L'utilisation de curl en ligne de commande
* Les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
* L'analyse des réponses HTTP

## 🎓 Contexte éducatif

Ce toolkit est conçu comme matériel pédagogique pour les cours de réseaux et développement web. Il permet aux étudiants de :
* Comprendre comment fonctionnent les requêtes HTTP dans un environnement contrôlé
* Apprendre à utiliser curl efficacement
* Pratiquer différents types de requêtes HTTP
* Analyser les en-têtes et les réponses HTTP

## 📁 Structure du projet

```
curlEdu/
└── script.py      # Script principal d'apprentissage
```

## 🔧 Installation

```bash
# Cloner le dépôt
git clone https://github.com/bouhenic/curlEdu.git
cd curlEdu

# Donner les droits d'exécution
chmod +x script.py

# Installation des dépendances Python (si nécessaire)
pip install -r requirements.txt
```

## 🚀 Utilisation dans un cadre pédagogique

```bash
./script.py [options]
```

Le script permet d'explorer progressivement les concepts, des plus basiques aux plus avancés :
* Requêtes HTTP simples
* Manipulation des en-têtes
* Envoi de données
* Gestion des cookies
* Authentification
* HTTPS et certificats

## 📚 Exemples d'utilisation

```bash
# Exemple de requête GET simple
./script.py --method GET --url https://api.example.com

# Exemple avec en-têtes personnalisés
./script.py --method POST --url https://api.example.com --headers '{"Content-Type": "application/json"}'

# Exemple avec authentification
./script.py --method GET --url https://api.example.com --auth user:password
```

## ⚡️ Fonctionnalités

* Simulation de différentes requêtes HTTP
* Visualisation détaillée des en-têtes
* Support des méthodes HTTP courantes
* Gestion de l'authentification
* Manipulation des cookies
* Support HTTPS

## 📝 Notes pédagogiques

Cet outil est conçu pour accompagner l'apprentissage des concepts HTTP et l'utilisation de curl. Il est recommandé de :
* Commencer par les requêtes GET simples
* Progresser vers les autres méthodes HTTP
* Explorer les différentes options d'en-têtes
* Pratiquer avec différents types d'API

## 👨‍💻 Auteur

[@bouhenic](https://github.com/bouhenic)

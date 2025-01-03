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

## 📋 Prérequis

- Python 3.x
- [Ollama](https://ollama.ai) - Pour le traitement des requêtes et le support IA
- curl - Généralement préinstallé sur Linux/macOS, à installer sur Windows

### Installation d'Ollama

1. Téléchargez et installez Ollama depuis [ollama.ai](https://ollama.ai)
2. Vérifiez l'installation :
```bash
ollama --version
```

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
python3 script.py
```
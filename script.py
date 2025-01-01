import os
import re
import json
import tempfile
import subprocess
import requests
from typing import Dict, List, Optional
from urllib.parse import urlparse

class CurlExecutor:
    def __init__(self, ollama_host: str = "http://localhost:11434", 
                 model: str = "mistral", 
                 allowed_hosts: Optional[List[str]] = None):
        self.ollama_host = ollama_host
        self.model = model
        self.allowed_hosts = allowed_hosts or []
        
        self.base_prompt = """
En tant qu'assistant spécialisé dans la création de requêtes HTTP, je vais t'aider à analyser cette requête.

Les informations pour la requête sont :
- URL: {url}
- Méthode: {method}
- Content-Type: {content_type}
- Données: {data}

Analyse les paramètres et donne des informations pertinentes sur la requête.
"""

    def call_ollama(self, prompt: str) -> str:
        try:
            response = requests.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            return response.json()["response"]
        except requests.exceptions.RequestException as e:
            raise Exception(f"Erreur lors de l'appel à Ollama: {str(e)}")

    def analyze_request(self, url: str, method: str, 
                      content_type: Optional[str] = None, 
                      data: Optional[str] = None) -> Dict:
        prompt = self.base_prompt.format(
            url=url,
            method=method,
            content_type=content_type or '',
            data=data or ''
        )
        analysis = self.call_ollama(prompt)
        return {'analysis': analysis}

    def execute_curl_with_data(self, url: str, method: str, 
                             content_type: Optional[str] = None, 
                             data: Optional[str] = None) -> Dict:
        try:
            # Création de la commande de base avec l'option verbose (-v)
            cmd = ['curl', '-v', '-X', method]
            if content_type:
                cmd.extend(['-H', f'Content-Type: {content_type}'])

            # Si nous avons des données, les écrire dans un fichier temporaire
            if data:
                with tempfile.NamedTemporaryFile(mode='w', delete=False) as tf:
                    if content_type == 'application/json':
                        json_data = json.loads(data)
                        json.dump(json_data, tf)
                    else:
                        tf.write(data)
                    tf.flush()
                    cmd.extend(['-d', f'@{tf.name}'])

            cmd.append(url)

            # Exécute la commande en capturant stderr pour les en-têtes
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            # Nettoie le fichier temporaire si utilisé
            if data:
                os.unlink(tf.name)

            return {
                'success': result.returncode == 0,
                'command': ' '.join(cmd),
                'output': result.stdout,
                'headers': result.stderr,  # Les en-têtes sont dans stderr avec -v
                'error': None if result.returncode == 0 else result.stderr
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'command': ' '.join(cmd) if 'cmd' in locals() else None
            }

def interactive_mode():
    """Mode interactif pour l'utilisateur."""
    print("\n=== Générateur de requêtes curl avec assistance LLM ===\n")
    
    print("Configuration d'Ollama:")
    ollama_host = input("URL du serveur Ollama [http://localhost:11434]: ").strip() or "http://localhost:11434"
    model = input("Modèle à utiliser [mistral]: ").strip() or "mistral"
    
    executor = CurlExecutor(ollama_host=ollama_host, model=model)
    
    while True:
        try:
            print("\n" + "="*50 + "\n")
            url = input("URL (ou 'q' pour quitter): ").strip()
            if url.lower() == 'q':
                break
                
            method = input("Méthode HTTP [GET]: ").strip().upper() or "GET"
            
            content_type = None
            data = None
            if method in ['POST', 'PUT']:
                content_type = input("Content-Type [application/json]: ").strip() or "application/json"
                data = input("Données: ").strip()

            print("\nAnalyse de la requête via LLM...")
            analysis = executor.analyze_request(url, method, content_type, data)
            print("\nAnalyse LLM:")
            print(analysis.get('analysis', 'Pas d\'analyse disponible'))
            
            print("\nExécution de la requête...")
            result = executor.execute_curl_with_data(url, method, content_type, data)
            
            print("\nRésultat:")
            if result.get('command'):
                print(f"\nCommande exécutée:\n{result['command']}\n")
            
            if result.get('headers'):
                print("\nDétails de la communication HTTP:")
                print(result['headers'])
            
            if result['success']:
                print("\n✅ Requête réussie!")
                if result.get('output'):
                    print("\nCorps de la réponse:")
                    print(result['output'])
            else:
                print("\n❌ Erreur:")
                print(result.get('error', 'Erreur inconnue'))
                
        except KeyboardInterrupt:
            print("\nAu revoir!")
            break
        except Exception as e:
            print(f"\nErreur inattendue: {str(e)}")

if __name__ == "__main__":
    interactive_mode()

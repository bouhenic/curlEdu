const axios = require('axios');
const fs = require('fs');
const prompts = require('prompts');

const displayBanner = () => {
    // Codes couleur ANSI
    const cyan = '\x1b[36m';
    const yellow = '\x1b[33m';
    const green = '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(cyan + `
██████╗ ██╗   ██╗██████╗ ██╗              ██████╗██╗███████╗██╗     
██╔════╝██║   ██║██╔══██╗██║             ██╔════╝██║██╔════╝██║     
██║     ██║   ██║██████╔╝██║             ██║     ██║█████╗  ██║     
██║     ██║   ██║██╔══██╗██║             ██║     ██║██╔══╝  ██║     
╚██████╗╚██████╔╝██║  ██║███████╗        ╚██████╗██║███████╗███████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝         ╚═════╝╚═╝╚══════╝╚══════╝` + reset);

    console.log(yellow + `
                    Auteur: Samuel BOUHENIC
                    Lycée Isaac Newton/ENREA - Clichy
                    Version: 1.0.0 - Janvier 2025` + reset);

    console.log(green + `
    ✓ Un outil pédagogique pour comprendre et générer des requêtes HTTP
    ✓ Permet d'explorer les différentes méthodes HTTP (GET, POST, PUT, DELETE)
    ✓ Génère automatiquement les commandes CURL correspondantes pour l'apprentissage` + reset + '\n');
}

class SavedRequest {
   constructor(name, url, method, headers, body, timestamp) {
       this.name = name;
       this.url = url;
       this.method = method;
       this.headers = headers;
       this.body = body;
       this.timestamp = timestamp;
   }
}

class CurlGenerator {
   constructor() {
       this.commonHeaders = {
           'Content-Type': ['application/json', 'application/x-www-form-urlencoded', 'text/plain'],
           'Accept': ['*/*', 'application/json', 'text/plain'],
           'Accept-Language': ['fr-FR', 'en-US', 'es-ES'],
           'Authorization': ['Bearer ', 'Basic '],
           'Cache-Control': ['no-cache', 'no-store', 'max-age=0'],
           'User-Agent': ['Mozilla/5.0', 'curl/7.68.0', 'Node.js Requests']
       };
       this.savedRequestsFile = 'saved_requests.json';
       this.savedRequests = this.loadSavedRequests();
   }

   generateCurl(url, method, headers, body = null) {
       let curlCommand = `curl -X ${method} '${url}'`;
       for (const [header, value] of Object.entries(headers)) {
           if (value) {
               curlCommand += ` \\\n  -H '${header}: ${value}'`;
           }
       }
       if (body && ['POST', 'PUT'].includes(method)) {
           curlCommand += ` \\\n  -d '${body}'`;
       }
       return curlCommand;
   }

   async executeRequest(url, method, headers, body = null) {
       try {
           // Afficher les détails de la requête avant l'exécution
           console.log("\n=== Détails de la Requête ===");
           console.log(`URL: ${url}`);
           console.log(`Méthode: ${method}`);
           console.log("Headers envoyés:", headers);
           if (body) {
               console.log("Corps de la requête:", body);
           }

           const response = await axios({
               method,
               url,
               headers,
               data: body || undefined
           });

           // Afficher les détails de la réponse
           console.log("\n=== Détails de la Réponse ===");
           console.log(`Status: ${response.status} - ${response.statusText}`);
           console.log("Headers reçus:", response.headers);
           console.log("\nCorps de la réponse:", response.data);
       } catch (error) {
           console.error("\nErreur lors de l'exécution de la requête:", error.message);
           if (error.response) {
               // Afficher les détails de l'erreur si disponibles
               console.log(`Status: ${error.response.status}`);
               console.log("Headers reçus:", error.response.headers);
               console.log("Corps de l'erreur:", error.response.data);
           }
       }
   }

   saveRequest(name, url, method, headers, body = null) {
       const request = new SavedRequest(name, url, method, headers, body, new Date().toISOString());
       this.savedRequests.push(request);
       this.persistSavedRequests();
       console.log(`\nRequête '${name}' sauvegardée avec succès!`);
   }

   loadSavedRequests() {
       if (fs.existsSync(this.savedRequestsFile)) {
           try {
               const data = fs.readFileSync(this.savedRequestsFile, 'utf-8');
               return JSON.parse(data);
           } catch {
               return [];
           }
       }
       return [];
   }

   persistSavedRequests() {
       fs.writeFileSync(this.savedRequestsFile, JSON.stringify(this.savedRequests, null, 2), 'utf-8');
   }

   async createNewRequest() {
       const { url } = await prompts({
           type: 'text',
           name: 'url',
           message: 'URL:'
       });

       const { method } = await prompts({
           type: 'select',
           name: 'method',
           message: 'Méthode:',
           choices: [
               { title: 'GET', value: 'GET' },
               { title: 'POST', value: 'POST' },
               { title: 'PUT', value: 'PUT' },
               { title: 'DELETE', value: 'DELETE' }
           ]
       });

       let headers = {};
       while (true) {
           const { headerKey } = await prompts({
               type: 'select',
               name: 'headerKey',
               message: 'Choisir un header (ou Terminer pour continuer):',
               choices: [
                   ...Object.keys(this.commonHeaders).map(header => ({ title: header, value: header })),
                   { title: 'Terminer', value: null }
               ]
           });

           if (!headerKey) break;

           const { headerValue } = await prompts({
               type: 'select',
               name: 'headerValue',
               message: `Valeurs communes pour ${headerKey}:`,
               choices: [
                   ...this.commonHeaders[headerKey].map(value => ({ title: value, value })),
                   { title: 'Saisir une autre valeur', value: null }
               ]
           });

           let value = headerValue;
           if (headerValue === null) {
               const input = await prompts({
                   type: 'text',
                   name: 'value',
                   message: `Saisir la valeur pour ${headerKey}:`
               });
               value = input.value;
           }

           headers[headerKey] = value;
       }

       const { body } = await prompts({
           type: 'text',
           name: 'body',
           message: 'Corps de la requête (laisser vide si aucun):'
       });

       const curlCommand = this.generateCurl(url, method, headers, body);
       console.log("\n=== Commande CURL générée ===");
       console.log(curlCommand);

       const { execute } = await prompts({
           type: 'confirm',
           name: 'execute',
           message: 'Exécuter la requête?',
           initial: false
       });
       if (execute) {
           await this.executeRequest(url, method, headers, body);
       }

       const { save } = await prompts({
           type: 'confirm',
           name: 'save',
           message: 'Sauvegarder la requête?',
           initial: false
       });
       if (save) {
           const { name } = await prompts({
               type: 'text',
               name: 'name',
               message: 'Nom de la requête:'
           });
           this.saveRequest(name, url, method, headers, body);
       }
   }

   listSavedRequests() {
       console.log("\n=== Requêtes Sauvegardées ===");
       if (this.savedRequests.length === 0) {
           console.log("Aucune requête sauvegardée.");
           return null;
       }
       
       for (let i = 0; i < this.savedRequests.length; i++) {
           const request = this.savedRequests[i];
           console.log(`\n${i + 1}. ${request.name}`);
           console.log(`   URL: ${request.url}`);
           console.log(`   Méthode: ${request.method}`);
           console.log(`   Date: ${new Date(request.timestamp).toLocaleString()}`);
       }
       return this.savedRequests;
   }

   async loadAndExecuteRequest() {
       const requests = this.listSavedRequests();
       if (!requests) return;

       const { index } = await prompts({
           type: 'number',
           name: 'index',
           message: 'Entrez le numéro de la requête à exécuter (0 pour annuler):',
           validate: value => value >= 0 && value <= requests.length ? true : 'Numéro invalide'
       });

       if (index === 0) return;
       
       const request = requests[index - 1];
       console.log(`\nExécution de la requête '${request.name}'...`);
       
       const curlCommand = this.generateCurl(request.url, request.method, request.headers, request.body);
       console.log("\n=== Commande CURL générée ===");
       console.log(curlCommand);

       const { execute } = await prompts({
           type: 'confirm',
           name: 'execute',
           message: 'Exécuter la requête?',
           initial: false
       });
       
       if (execute) {
           await this.executeRequest(request.url, request.method, request.headers, request.body);
       }
   }

   async showMainMenu() {
       while (true) {
           const { action } = await prompts({
               type: 'select',
               name: 'action',
               message: 'Que souhaitez-vous faire?',
               choices: [
                   { title: 'Créer une nouvelle requête', value: 'new' },
                   { title: 'Charger une requête sauvegardée', value: 'load' },
                   { title: 'Quitter', value: 'quit' }
               ]
           });

           switch (action) {
               case 'new':
                   await this.createNewRequest();
                   break;
               case 'load':
                   await this.loadAndExecuteRequest();
                   break;
               case 'quit':
                   console.log("\nAu revoir!");
                   return;
           }
       }
   }
}

(async () => {
   displayBanner();  // Afficher la bannière au démarrage
   const generator = new CurlGenerator();
   await generator.showMainMenu();
})();

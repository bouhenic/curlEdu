const axios = require('axios');
const fs = require('fs');
const prompts = require('prompts');

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
            const response = await axios({
                method,
                url,
                headers,
                data: body || undefined
            });

            console.log("\n=== Détails de la Réponse ===");
            console.log(`Status: ${response.status} - ${response.statusText}`);
            console.log("Headers reçus:", response.headers);
            console.log("\nCorps de la réponse:", response.data);
        } catch (error) {
            console.error("\nErreur lors de l'exécution de la requête:", error.message);
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
}

(async () => {
    const generator = new CurlGenerator();
    await generator.createNewRequest();
})();
const fs = require('fs-extra')
const path = require('path');
const http = require('https');


function downloadFile(url, path) {
    return new Promise((res,rej) => {
        if (fs.pathExistsSync(path)) {
            res("File " + url + " already downloaded");
            return;
        }
        http.get(url, response => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(path);
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => res(url + " downloaded"))
                })
            } else {
                rej(url + " failed to download: " + response.statusCode);
            }
        })


    })
}

async function downloadExternalFiles(externalFiles) {
    for (let url in externalFiles) {
        const finalPath = externalFiles[url];
        try {
            const res = await downloadFile(url, finalPath);
            console.log(res);
        } catch(e) {
            console.error(e);
        }

    }
}

(async function optimizeAssets() {
    const externalFilesJSONPath = path.join(__dirname, '..', 'config','external-files.json')
    if (await fs.pathExists(externalFilesJSONPath)) {
        const externalFiles = await fs.readJSON(externalFilesJSONPath);
        await fs.ensureDir('theme/assets/external');
        await downloadExternalFiles(externalFiles);
    }
})()
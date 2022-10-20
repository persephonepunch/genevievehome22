const fs = require('fs-extra');
const fsp = fs.promises
const archiver = require('archiver');
const extract = require('extract-zip');
const path = require('path');
const { cwd } = require('process');

async function appendZip(source, callback) {
    try {
        let tempDir = source + "-temp"

        // create temp dir (folder must exist)
        await fsp.mkdir(tempDir, { recursive: true })

        // extract to folder
        await extract(source, { dir: tempDir })

        // delete original zip
        await fsp.unlink(source)

        // recreate zip file to stream archive data to
        const output = fs.createWriteStream(source);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // pipe archive data to the file
        archive.pipe(output);

        // append files from temp directory at the root of archive
        archive.directory(tempDir, false);

        // callback to add extra files
        callback.call(this, archive)

        // finalize the archive
        await archive.finalize();

        // delete temp folder
        fs.rmdirSync(tempDir, { recursive: true })

    } catch (err) {
        // handle any errors
        console.log(err)
    }
}

async function addFilesToFunctions() {
    const functionsPath = path.join(cwd(), 'functions');
    if (!await fs.pathExists(functionsPath)) {
        return;
    }
    const dirs = await fsp.readdir(functionsPath);
    for (let dir of dirs) {
        const pathToInclude = path.join(cwd(), 'public', '_includes', dir.replace('.zip', ''));
        if (await fs.pathExists(pathToInclude)) {
            await appendZip(path.join(functionsPath, dir), archive => {
                archive.directory(pathToInclude, 'includes')
            })

        }
    }

    try {
        fs.emptyDirSync(path.join(cwd(), 'public', '_includes'))
        fs.removeSync(path.join(cwd(), 'public', '_includes'))
    } catch(e) {

    }
}

module.exports = addFilesToFunctions
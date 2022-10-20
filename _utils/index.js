const registerFilters = require('./filters');
const registerCollections = require('./collections');
const registerTransforms = require('./transforms');
const registerShortcodes = require('./shortcodes');
const addFilesToFunctions = require('./zip')

module.exports = function (eleventyConfig) {

    eleventyConfig.setQuietMode(true);

    eleventyConfig.setLiquidOptions({
        dynamicPartials: true,
    });

    registerCollections(eleventyConfig);

    registerFilters(eleventyConfig);

    registerTransforms(eleventyConfig);

    registerShortcodes(eleventyConfig);

    eleventyConfig.addNunjucksFilter("dateLastMod", function(value) {
        try {
            return value.toISOString();
        } catch(e) {
            return new Date().toISOString();
        }
     });

    eleventyConfig.on('afterBuild', async () => {
        await addFilesToFunctions();
    });
}
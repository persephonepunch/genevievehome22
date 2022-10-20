const {memoize} = require('./memo');

module.exports = function(eleventyConfig) {

    eleventyConfig.addCollection("memoized", function(collectionApi) {
        return memoize(collectionApi.getAll())
    })

}
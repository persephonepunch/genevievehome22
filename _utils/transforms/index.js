const htmlmin = require("html-minifier");

module.exports = function(eleventyConfig) {
    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        if (outputPath.endsWith(".html")) {
            try {
                let minified = htmlmin.minify(content, {
                    useShortDoctype: true,
                    removeComments: true,
                    collapseWhitespace: true
                });
                return minified;
            } catch(e) {
                return content;
            }
        }

        return content;
    });
}
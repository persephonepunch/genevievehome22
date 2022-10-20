const markdownIt = require("markdown-it");

    // Add within your config module
    const md = new markdownIt({
    html: true,
    });
            

      const createCollectionsAndFilters = require('./_utils/index.js');
      
      module.exports = function(eleventyConfig) {

        eleventyConfig.addFilter("markdown", (content) => {
            if (typeof content == "string") {
                return md.render(content);
              }
              return content;
          });
               
        eleventyConfig.addPassthroughCopy({"theme/assets": "assets"});

        eleventyConfig.addPassthroughCopy("admin");
        
        createCollectionsAndFilters(eleventyConfig);
        
        return {
          dir: {
            input: "cms",
            includes: "../theme",
            output: "public"
          }
        };
      };
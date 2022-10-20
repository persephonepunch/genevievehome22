const Fuse = require('fuse.js')
const fs = require('fs-extra');
const get = require('lodash.get');

function removeMarkdown(text) {
    try {
        return text
            // Remove HTML tags
            .replace(/<[^>]*>/g, '')
            // Remove setext-style headers
            .replace(/^[=\-]{2,}\s*$/g, '')
            // Remove footnotes?
            .replace(/\[\^.+?\](\: .*?$)?/g, '')
            .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
            // Remove images
            .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, '$1' )
            // Remove inline links
            .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')
            // Remove blockquotes
            .replace(/^\s{0,3}>\s?/g, '')
            // Remove reference-style links?
            .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
            // Remove atx-style headers
            .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
            // Remove emphasis (repeat the line to remove double emphasis)
            .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
            .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, '$2')
            // Remove code blocks
            .replace(/(`{3,})(.*?)\1/gm, '$2')
            // Remove inline code
            .replace(/`(.+?)`/g, '$1')
            // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
            .replace(/\n{2,}/g, '\n\n');
    }
    catch(e) {
        return text;
    }
}

module.exports = function(memo) {

    const objectProps = ['url','data.tags[0]','data.title', 'data.slug', 'data.f_title', 'data.f_description', 'data.summary', 'data.f_summary', "data.excerpt", "data.f_excerpt"];

    const posts = Object.values(memo).map( originalPost => {

        const newPost = {};
        objectProps.forEach(prop => {
            const val = get(originalPost, prop, null);
            if (val) {
                newPost[prop.replace('data.','').replace('[0]','')] = val;
            }
        })

        if (!newPost.excerpt || !newPost.f_excerpt) {
            newPost.excerpt = removeMarkdown(originalPost.template.frontMatter.content.trim()).split(" ").slice(0, 50).join(" ");

        }

        return newPost;
    });

    const searchIndex = Fuse.createIndex(['title', 'slug', 'f_title', 'tags','f_description', 'summary', 'f_summary', 'excerpt', 'f_excerpt'], posts);

    fs.ensureDirSync('public/_data/')
    fs.writeJSONSync('public/_data/search-index.json', {data: posts, index: searchIndex.toJSON()})
}
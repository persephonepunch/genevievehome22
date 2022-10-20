const fs = require('fs-extra');
const path = require('path')

function stripSubdirectoryDots(s) {
    const clean = s.startsWith("/") ? s.substring(1) : s;
    return clean.replace(/\.\.\//gm, "")
}

module.exports = {
    appendMultiple: function () {
        return (Object.values(arguments) || []).join("")
    },
    writeToFile: function(content, filePath) {
        fs.outputFileSync(path.join(".", stripSubdirectoryDots(filePath)), content);
    },
    json: function(value) {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return "Invalid JSON"
        }
    },
    trim: function(s) {
        return ('' + s).trim();
    },
    escape: function (s) {
        return ('' + s) /* Forces the conversion to string. */
            .replace(/\\/g, '\\\\') /* This MUST be the 1st replacement. */
            .replace(/\t/g, '\\t') /* These 2 replacements protect whitespaces. */
            .replace(/\n/g, '\\n')
            .replace(/\u00A0/g, '\\u00A0') /* Useful but not absolutely necessary. */
            .replace(/&/g, '\\x26') /* These 5 replacements protect from HTML/XML. */
            .replace(/'/g, '\\x27')
            .replace(/"/g, '\\x22')
            .replace(/</g, '\\x3C')
            .replace(/>/g, '\\x3E')
            ;
    },
    slugify: function(s) {
        return s
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-") // Replace spaces with -
            .replace(/&/g, "-and-") // Replace & with 'and'
            .replace(/[^\w\-]+/g, "") // Remove all non-word chars
            .replace(/\--+/g, "-") // Replace multiple - with single -
            .replace(/^-+/, "") // Trim - from start of text
            .replace(/-+$/, "") // Trim - from end of text
    }
}
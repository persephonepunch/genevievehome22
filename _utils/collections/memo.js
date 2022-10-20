const createSearchIndex = require('../search');

let memo;

/**
 * Memoize an eleventy collection into a hash for faster lookups.
 * Important: Memoization assumes that all post slugs are unique.
 * @param {Array<Object>} collection An eleventy collection.
 * Typically collections.all
 * @return {Array<Object>} The original collection. We return this to make
 * eleventy.addCollection happy since it expects a collection of some kind.
 */
const memoize = (collection) => {

    memo = {};
    collection.forEach((item) => {

        const inputPath = item.inputPath.replace('./', '');

        memo[inputPath] = item;
    });

    createSearchIndex(memo);

    return [];
};

const findByInputPath = (inputPath) => {
    if (!inputPath) {
        throw new Error(`input path is either null or undefined`);
    }

    if (!memo) {
        throw new Error(`No collection has been memoized yet.`);
    }
    const found = memo[inputPath];
    if (!found) {
        throw new Error(`Could not find post with input path: ${inputPath}`);
    }

    return found;
};

module.exports = { memoize, findByInputPath };
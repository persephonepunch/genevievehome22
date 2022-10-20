const get = require('lodash.get');
const chunk = require('lodash.chunk');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

module.exports = {
    paginate: function(array, limit) {
        try {
            return chunk(array, limit)
        } catch(e) {
            return [];
        }
    },
    limit: function (array, limit) {
        if (!array) {
            return [];
        }
        limit = Number(limit)
        if (!limit || isNaN(limit)) {
            return array;
        }

        return array.slice(0, limit);

    },
    offset: function (array, offset) {
        if (!Array.isArray(array)) {
            return [];
        }
        offset = Number(offset)
        if (!offset || isNaN(offset)) {
            return array;
        }

        return array.slice(offset);
    },
    sort: function (array, filterString) {
        if (!Array.isArray(array)) {
            return [];
        }
        const filters = filterString.split(',').map(filter => {
            filter = filter.trim();
            const reverse = filter.startsWith("-");
            const field = reverse ? filter.substr(1) : filter;
            return {
                reverse, field
            }
        });
        let shuffle = false;
        filters.forEach(({field, reverse}) => {

            if (field == "_random") {
                    shuffle = true;
            }

            array = array.sort((a, b) => {
                if (reverse) {
                    return get(a.data, field, "") > get(b.data, field, "") ? -1 : 1;
                } else {
                    return get(a.data, field, "") > get(b.data, field, "") ? 1 : -1;
                }

            })
        })

        if (shuffle) {
            shuffleArray(array);
        }
        return array;
    }
}
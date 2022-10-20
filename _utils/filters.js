const stringFilters = require('./strings/filters');
const arrayFilters = require('./array/filters');
const collectionFilters = require('./collections/filters');
const dateFilters = require('./date/filters');

module.exports = function (eleventyConfig) {
  const filters = [stringFilters, arrayFilters, collectionFilters, dateFilters];

  for (let filterSection of filters) {
    for (let filter in filterSection) {
      eleventyConfig.addLiquidFilter(filter, filterSection[filter]);
    }
  }

}
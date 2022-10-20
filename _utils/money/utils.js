const path = require('path');
const fetch = require('node-fetch');

const cache = {};

async function getRemoteRates(base) {

    cache[base] = {}
    return {};


}


let ecommerceFormat = {
    "decimal": ".",
    "group": ",",
    "template": "{symbol} {amount} {currencyCode}",
    "fractionDigits": 2,
    "hideDecimalForWholeNumbers": false,
    "currencies": [{"currencyCode": "usd", "symbol": "$"}]
};
try {
    const {currencies_and_formats} = require(path.join(process.cwd(), 'cms', '_data', 'settings', 'ecommerce.json'));
    ecommerceFormat = currencies_and_formats;
} catch (e) {
}

function formatPrice(number, currency) {
    const amount = Number(number).toLocaleString('en-UK', {
        minimumFractionDigits: ecommerceFormat.hideDecimalForWholeNumbers ? 0 : ecommerceFormat.fractionDigits,
        maximumFractionDigits: ecommerceFormat.fractionDigits
    }).replace(/,/gm, ecommerceFormat.group || ',').replace(/\./gm, ecommerceFormat.decimal || '.')
    return ecommerceFormat.template.replace(/{symbol}/gm, currency.symbol).replace(/{amount}/gm, amount).replace(/{currencyCode}/gm, currency.currencyCode.toUpperCase());
}

async function convertPrice(number, baseCurrency, newCurrency) {
    const rates = await getRemoteRates(baseCurrency);
    const rate = !!rates[newCurrency] ? rates[newCurrency] : 1;

    return Number((Number(number) * Number(rate)).toFixed(2));
}

async function sanitizePrice(price) {
    const baseCurrency = ecommerceFormat.currencies[0].currencyCode;
    const basePrice = price[baseCurrency];

    const newPrice = {};

    for (let currency of ecommerceFormat.currencies) {
        if (price[currency.currencyCode]) {
            newPrice[currency.currencyCode] = price[currency.currencyCode]
        } else {
            newPrice[currency.currencyCode] = await convertPrice(basePrice, baseCurrency.toUpperCase(), currency.currencyCode.toUpperCase())
        }
    }

    return newPrice;

}

module.exports = {
    formatPrice,
    ecommerceFormat,
    convertPrice,
    sanitizePrice
}
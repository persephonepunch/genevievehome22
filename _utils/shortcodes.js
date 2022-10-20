const Image = require("@11ty/eleventy-img");
const path = require('path');
const {formatPrice, ecommerceFormat, convertPrice} = require('./money/utils');
const fetch = require('node-fetch');

let config;

try {
    const {images_optimization} = require(path.join(process.cwd(), 'cms', '_data', 'settings', 'site.json'));
    config = images_optimization;
} catch (e) {
    config = {
        formats: ['webp'],
        dimensions: [800, 1080, 1600]
    }
}

function escape(s) {
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
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = function (eleventyConfig) {

    eleventyConfig.addShortcode('embedVideo', async function(video) {
        if (!video || !video.url) {
            return ""
        }
        
        let oembedUrl = null;
        if (video.url.includes("vimeo")) {
            oembedUrl = "https://vimeo.com/api/oembed.json?url=" + video.url;
            
        } else if (video.url.includes("youtube")) {
          oembedUrl = `https://youtube.com/oembed?url=${video.url}&format=json`;
        }

        if (oembedUrl != null) {
            const oembedRes = await (await fetch(oembedUrl)).json()
            return oembedRes.html;
        }

        return "";
    });


    eleventyConfig.addShortcode('image', async function(src, alt = "", dataSizes = "", attributes = "") {

        if (!src) {
            return "";
        }

        if (!alt) {
            alt = ""
        }

        try {
            dataSizes = JSON.parse(dataSizes);
        } catch(e) {
            dataSizes = [];
        }
        

        const sizes = dataSizes.length ? dataSizes.map( next => {
            if (next.max !== 10000) {
                return `(max-width: ${next.max}px) ${next.size}`
            } else {
               return next.size;
            }
           
        }).join(', ').trim() : "100vw";

        
        if (src.includes('.svg') || src.includes('.gif')) {
            return `<img src="${src}" alt="${alt}" ${attributes}>`
        }

        if (!src.startsWith("http")) {
            src = "theme" + src;
        } else {
            return `<img src="${src}" alt="${alt}" ${attributes}>`;
        }

        try {
            let metadata = await Image(src, {
                widths: config.dimensions,
                formats: [...config.formats.sort(), null],
                urlPath: "/assets/images/",
                outputDir: "./public/assets/images/"
            });
            const formats = Object.keys(metadata);
            const lowsrc = metadata[formats[formats.length - 1]][0];

            return `<picture ${attributes}>
    ${Object.values(metadata).map(imageFormat => {
                return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
            }).join("\n")}
      <img
        src="${lowsrc.url}"
        alt="${alt}"
        ${attributes}
        decoding="async">
    </picture>`;
        } catch (e) {
            return `<img src="${src}" alt="${alt}" ${attributes}>`
        }

    })


    const buildTime = new Date().toUTCString();
    eleventyConfig.addShortcode('seo', function (seo) {
        let seoString = '';
        for (let key in seo) {
            switch (key) {
                case 'noindex':
                    if (seo.noindex) {
                        seoString += `<meta name="robots" content="noindex">`
                    }
                    break;
                case 'title':
                    seoString += `<title>${htmlEntities(seo.title)}</title><meta property="og:title" content="${htmlEntities(seo.title)}" />`;
                    break;
                case 'description':
                    seoString += `<meta name="description" content="${htmlEntities(seo.description)}">`;
                    break;
                default: {
                    if (key == 'additional_tags') {
                        seoString += seo.additional_tags;
                    } else if (key.startsWith('og:')) {
                        seoString += `<meta property="${escape(key)}" content="${htmlEntities(seo[key])}">`;
                    } else {
                        seoString += `<meta name="${escape(key)}" content="${htmlEntities(seo[key])}">`;
                    }
                    break;
                }
            }
        }

        seoString += `<meta http-equiv="last-modified" content="${buildTime}" />`

        return seoString;
    });

    eleventyConfig.addShortcode('variations', variations => {
        const mappedVariations = variations.map(variation => {
            const mappedVariation = {};
            for (let prop in variation) {
                mappedVariation[prop.replace('f_', '')] = variation[prop];
            }

            return mappedVariation;
        })

        return `<script type="application/json">${JSON.stringify(mappedVariations)}</script>`
    })

    eleventyConfig.addShortcode('money', async function (price) {
        if (!price) {
            return "";
        }

        const baseCurrency = ecommerceFormat.currencies[0].currencyCode;
        const basePrice = price[baseCurrency] || 0;

        
        return (await Promise.all(ecommerceFormat.currencies.map(async currency => {

            const currentPrice = !!price[currency.currencyCode] ? formatPrice(price[currency.currencyCode], currency) : formatPrice(await convertPrice(basePrice, baseCurrency.toUpperCase(), currency.currencyCode.toUpperCase()), currency);

            return `<price data-currency-code="${currency.currencyCode}">${currentPrice}</price>`;
        }))).join("");

    })
}
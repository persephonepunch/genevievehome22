(() => {
    function slugify(s) {
        return s
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-'); // Replace multiple - with single -
    }

    CMS.registerEventListener({
        name: 'preSave',
        handler: ({ entry }) => {
            const data = (entry.get('data'));
            const props = data.get('variation-properties');
            if (props) {
                const properties = props.toJSON();
                const newProperties = properties.map( property => {
                    property.slug = slugify(property.name);
                    property.values = property.values.map( value => {
                        return {
                            slug: slugify(value.name),
                            name: value.name
                        }
                    })
                    return property;
                });
                return entry.get('data').set('variation-properties',Immutable.List(newProperties));
            }
        },
    });

})();
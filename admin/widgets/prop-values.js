(() => {
    const SelectControl = CMS.getWidget('select').control;
    const PropValuesControl = createClass({
        getInitialState: function () {
            return {
                loading: true,
                variationProperties: this.getVariationProperties()
            };
        },
        handleChange: function (prop, value) {
            if (!this.props.value) {
                this.props.value = Immutable.Map();
            }

            this.props.onChange(this.props.value.set(prop, value));

        },
        getVariationProperties() {

            try {
                return this.props.entry.get('data').get('variation-properties').toJSON();
            } catch(e) {
                return null;
            }

        },
        render: function () {
            const {
                forID,
                entry,
                classNameWrapper,
                setActiveStyle,
                setInactiveStyle
            } = this.props;

            let value = {}
            try {
                value = this.props.value.toJSON() ;
            } catch(e) {
                value = {}
            }
            if (!this.state.variationProperties) {
                return h("p", null, "No properties");
            } else {

                return this.state.variationProperties.map((property) => {
                    return h("div", {
                        key: property.slug,
                        className: classNameWrapper,
                    }, h("label", null, property.name), h(SelectControl, {
                        onChange: e => this.handleChange(property.slug, e),
                        classNameWrapper: classNameWrapper,
                        setActiveStyle: setActiveStyle,
                        setInactiveStyle: setInactiveStyle,
                        forID: forID,
                        value: value[property.slug],
                        field: Immutable.Map({
                            required: true,
                            multiple: false,
                            options: property.values.map(function (value) {
                                return {
                                    value: value.slug,
                                    label: value.name
                                };
                            }),

                        })
                    }));
                });
            }
        }
    });


    CMS.registerWidget('prop-values', PropValuesControl, null);

})();
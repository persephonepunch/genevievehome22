(() => {
    const PriceControl = createClass({
        getInitialState: function () {
            return {
                loading: true
            };
        },
        handleChange: function (currencyCode, value) {
            if (!this.props.value) {
                this.props.value = Immutable.Map();
            }
            const number = Number(value);
            if (number > 0) {
                this.props.onChange(this.props.value.set(currencyCode, number));
            } else {
                const newMap = this.props.value.remove(currencyCode);
                if (newMap.size > 0) {
                    this.props.onChange(newMap);
                } else {
                    this.props.onChange(undefined)
                }
            }
        },
        render: function () {
            const {
                forID,
                query,
                classNameWrapper,
                setActiveStyle,
                setInactiveStyle
            } = this.props;


            if (this.state.loading) {
                query(forID, "settings", ["slug"], "ecommerce").then(res => {
                    const {
                        currencies_and_formats: {currencies}
                    } = res.payload.hits[0].data;
                    this.setState({
                        loading: false,
                        currencies
                    });
                });
            }

            var value = this.props.value;

            if (this.state.loading) {
                return h("p", null, "Wait...");
            }

            const values = value ? Object.fromEntries(value.entries()) : {};

            return h("div", {
                id: forID,
                className: classNameWrapper + " price-wrapper"
            },this.state.currencies.map(currency => h("div", {
                key: currency.currencyCode,
                className: "price-input-wrapper"
            }, h("span", {
                className: "currency-symbol"
            }, currency.symbol), h("input", {
                value: values[currency.currencyCode] || 0,
                type: "number",
                min: "0",
                step: "0.01",
                onFocus: setActiveStyle,
                onBlur: setInactiveStyle,
                onChange: e => this.handleChange(currency.currencyCode, e.target.value)
            }))));
        }
    });

    const schema = {
        query: {type: 'func'}
    }

    CMS.registerWidget('price', PriceControl, null, schema);

})();
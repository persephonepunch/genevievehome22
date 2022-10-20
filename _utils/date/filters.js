const {format} = require('date-fns')

module.exports = {
    formatDate: (dateString, formatString) => {
        try {
            return format(new Date(dateString), formatString);
        } catch (e) {
            return format(new Date(), "dd/MM/yyyy")
        }
    }
}
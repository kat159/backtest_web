const moment = require('moment')

let initialDate = moment('2022-01-01', 'YYYY-MM-DD');
console.log(initialDate.add(1, 'day').format())
const dates = []

for (let i = 1; i < 200; i ++) {
    dates.push(initialDate.format('YYYY-MM-DD'));
    initialDate = initialDate.add(1, 'day');
}
console.log(moment(1111).format())
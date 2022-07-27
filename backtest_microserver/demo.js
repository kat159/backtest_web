// console.log('111'.toString())
// console.log([1, 2, 3].toString())
// n = 1
// console.log(Number.isInteger(1.1))

// console.log(typeof([1, 2].join(1)))

// console.log('1/2/3'.split('/'))
// for (const s of '1/2/3'.split('/')) {
//     console.log(s)
// }

const s = {}
const n = 'A'
for (let i = 0 ; i < 10; i++) 
    s[n] = s[n] ? s[n] + 1 : 1
console.log(s)

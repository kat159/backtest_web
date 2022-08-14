
class MyArray {
    async filterAsync(array, filter) {
        const filterArr = await Promise.all(array.map(filter))
        const res = array.filter((v, i) => {
            return filterArr[i]
        })
        return res
    }
}

export default new MyArray();
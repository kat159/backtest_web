users = {
    'kat159': 'Yfx147159',  
}

updateUsers = (users) => { 
    // 错误！！ 改变不了，写入的文件是定死的，这里改变的只是内存的值，等重新开启又是只有写入的kat159
    this.users = users
} 

module.exports = {users, updateUsers}
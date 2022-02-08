module.exports = {
    exac(cmd) {
        const exec = require('child_process').exec;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.info('stderr:', stderr);
            } else {
                console.log('exec: ', stdout);
            }
        })
    },

    exacPython(path) {
        // 注意path中的’./‘是npm start所在的路径,也就是server文件夹开始
        const exec = require('child_process').exec;
        exec('python ' + path, (err, stdout, stderr) => {
            if (err) {
                console.info('stderr:', stderr);
            } else {
                console.log('exec: ', stdout);
            }
        })
    }
}

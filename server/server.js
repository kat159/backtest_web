
const express = require('express');
const app = express();
const port = 3333;
const { users, updateUsers } = require('./users');
const mqSend = require('./publisher').rabbitmqSend
const strategy = require('./strategy')
const amqp = require('amqplib/callback_api');

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.get('/server', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // console.log(req.query)
    res.send('HELLO AJAX')
})

app.post('/server', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(req.query)
    res.send('HELLO AJAX POOOOST')
})

app.all('/login', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('login:', req.query);
    const { username, password } = req.query
    if (users[username] === undefined) { // username not exists
        res.send('username not exists');
    }
    else if (users[username] === password) { // username exists and password matchs
        res.send('success');
    } else {    // username exists but password is incorrect
        res.send('password incorrect');
    }
})

app.all('/signup', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log('signUp:', req.query);
    const { username, password } = req.query;
    if (users[username] !== undefined) {
        res.send('false'); // username exists
    } else {
        users[username] = password;
        updateUsers(users);
        res.send('true');
    }

})
reports = [];
amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'test_report';

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, function (msg) {
            reports = JSON.parse(msg.content.toString());
        }, {
            noAck: true // 一旦收到，就popmessage，下次不再收到， 如果是false，message一直会在
        });
    });
});

app.all('/run_test', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    /*  **NOTE：
        axios.request中改变了请求头(json)，所以axios会发送两次请求，
        第一次OPTION， 没有body（为空）， 第二次才是post
        所以如果没有res.send(), axios会认为一次的OPTION发送失败，
        就没有第二次的post的body， 导致接收到的body是空的，
    */
    ret = []

    if (req.method === 'POST') {     // OPTION不执行
        const queue = 'backtest';
        const s = strategy.toStrategyFile(req.body)
        // console.log(s)
        mqSend(queue, JSON.stringify(s));
        setTimeout(() => {
            console.log('Received:', reports);
            res.send(reports);
        }, 3000); 
    } else {
        /*
            注意option请求的send不会传给服务端作为响应，所以不用区分
            但是OPTION会影响上面的代码，所以要区分
        */
        console.log('ssssssssssss', ret)
        res.send('111'); // **如果没有res.send() 得到的body是空的！**
        // 可能是因为改了请求头，axios会发送两次,
        // 如果没有send响应第一次的option请求， 
        // axios就不会发送第二次的post请求
    }


})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})
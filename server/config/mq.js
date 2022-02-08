const amqp = require('amqplib/callback_api');

module.exports = {
    async rabbitmqSend(queue, msg, durable = false) {
        amqp.connect('amqp://localhost', function (error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function (error1, channel) {
                if (error1) {
                    throw error1;
                }

                channel.assertQueue(queue, {
                    durable: durable
                });

                channel.sendToQueue(queue, Buffer.from(msg));
                console.log(" [x] Sent %s", msg);
                setTimeout(() => {
                    connection.close();
                }, 1000);
            });
        });
    },

    rabbitmqConsume(queue = 'test_report', options = { noAck: true }, durable = false) {
        return new Promise((resolve, reject) => {
            let reports = [];
            amqp.connect('amqp://localhost', function (error0, connection) {
                if (error0) {
                    throw error0;
                }
                connection.createChannel(function (error1, channel) {
                    if (error1) {
                        throw error1;
                    }
                    channel.assertQueue(queue, {
                        durable: durable
                    });

                    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
                    channel.consume(queue, function (msg) {
                        reports = JSON.parse(msg.content.toString());
                        // console.log('RECEIVE REPORT = ', reports);
                        connection.close(); 
                        resolve(reports);
                    }, options);

                });
            });
        })

    }

    // await async 错误案例
    /**
    这种情况只能用promise，而不能用async；用了async， return必须在最外层，才能替代promise
    async rabbitmqConsume(queue='test_report', options={noAck: true}, durable=false) {
        let reports = [];
        amqp.connect('amqp://localhost', function (error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function (error1, channel) {
                if (error1) {
                    throw error1;
                }
                channel.assertQueue(queue, {
                    durable: durable
                });

                console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
                channel.consume(queue, function (msg) {
                    reports = JSON.parse(msg.content.toString());
                    console.log('RECEIVE REPORT = ', reports);
                    connection.close();
                    // return reports  // 没用， 没用，return必须在最外面才能触发await
                }, options);
                
            });
        });
        // setTimeout(()=>{return reports;}, 10000); 没用，return必须在最外面才能触发await，这里return的会是undefined
        // return reports  ; 没用， 因为return在这个函数中会先于其他异步执行，所以reports是空的
    }
    */
}


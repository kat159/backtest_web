const amqp = require('amqplib/callback_api');
 
const rabbitmqSend = (queue, msg) => { 
    amqp.connect('amqp://localhost', function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msg));
            console.log(" [x] Sent %s", msg);
            setTimeout(() => {
                connection.close();
            }, 1000);
        });
    });
}

module.exports.rabbitmqSend = rabbitmqSend

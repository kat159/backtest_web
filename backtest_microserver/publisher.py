import pika

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

def mqSend(queue, msg):
    channel.queue_declare(queue=queue)

    channel.basic_publish(exchange='',
                        routing_key=queue,
                        body=msg)
    print(" [x] Sent to queue =", queue)

    # connection.close()

if __name__ == '__main__':
    queue = 'test_report'
    msg = 'Hello World!'

    channel.queue_declare(queue=queue)

    channel.basic_publish(exchange='',
                        routing_key=queue,
                        body=msg)
    print(" [x] Sent 'Hello World!'")

    connection.close()
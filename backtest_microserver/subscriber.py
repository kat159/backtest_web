import pika, sys, os, json
from stock import *
from test import run_test, test_one_stock
import publisher

STOCK_DATA_PATH = os.path.abspath('./backtest/stock_data')
STOCKS = get_all_stocks(STOCK_DATA_PATH)

# **TODO
# users create indicators by themself
''' Example:
indicator = {}
custom_indicator_formula = 'VAR1=(2*CLOSE+HIGH+LOW)/4;
VAR2=EMA(EMA(EMA(EMA(EMA(EMA(EMA(VAR1,2),2),2),2),2),2),2);
J=(VAR2-REF(VAR2,1))/REF(VAR2,1)*1000;
K1=MA(J,1);
K2=K1-REF(K1,1);
BLJJ=EMA(EMA(EMA(K2,2),2),1) * 2;' 
+ 'indicator['BLJJ'] = BLJJ'
exec(custom_indicator_formula)
print(indicator['BLJJ'])
'''

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=0))
    channel = connection.channel()
    queue = 'backtest'
    channel.queue_declare(queue=queue)
    count = [0]
    def callback(ch, method, properties, body):
        print(count[0], " [x] Received: ")
        s = json.loads(body)
        print(s)
        res = json.dumps(run_test(STOCKS, s))
        # print(res)
        publisher.mqSend('test_report_' + s['testid'], res)
        count[0] += 1
        
    channel.basic_consume(queue=queue, on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()
    

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
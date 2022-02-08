from datetime import *

def to_date(date, format='%Y-%m-%d'):
    return datetime.strptime(date, format).date()

def next_day(date):
    return date + timedelta(days=1)

def add_days(date, day):
    return date + timedelta(days=day)

if __name__ == '__main__':
    d1 = '2020-01-01'
    d2 = '2021-01-01'
    format = '%Y-%m-%d'
    t1 = to_date(d1, format)
    t2 = to_date(d2, format)
    print([str(t1)])
    print(next_day(t1))
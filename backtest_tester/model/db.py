import pymysql


def get_connection():
    conn = pymysql.connect(host='localhost', user='root', password='root', database='backtest')
    return conn


def update(sql, args=None):
    conn = get_connection()
    cursor = conn.cursor()
    res = cursor.execute(sql, args)
    conn.commit()
    cursor.close()
    conn.close()
    return res


def get(sql, args=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql, args)

    columns = [desc[0] for desc in cursor.description]
    data = cursor.fetchall()
    result = [dict(zip(columns, row)) for row in data]

    cursor.close()
    conn.close()

    return result

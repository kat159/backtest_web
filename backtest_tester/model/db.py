import pymysql


def get_connection():
    conn = pymysql.connect(host='localhost', user='root', password='root', database='backtest')
    return conn


def update(sql, args=None):
    conn = None
    cursor = None
    res = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        res = cursor.execute(sql, args)
        conn.commit()
    except Exception as e:

        conn.rollback()
    finally:
        cursor.close()
        conn.close()
    return res


def get(sql, args=None):
    conn = None
    cursor = None
    result = None

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(sql, args)
        columns = [desc[0] for desc in cursor.description]
        data = cursor.fetchall()
        result = [dict(zip(columns, row)) for row in data]
    except Exception as e:

        conn.rollback()
    finally:
        cursor.close()
        conn.close()

    return result

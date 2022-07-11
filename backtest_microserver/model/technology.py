import db_connector as db


host= 'localhost'
user= 'root'
pswd= 'root'
dtbs= 'test_schema'
connection = db.connect_to_database(host, user, pswd, dtbs)

def find_by_name(name):
    query = 'select * from technologies where name = %s'
    return db.execute_query(connection, query, (name,)).fetchall()

def find_all():
    query = 'select * from technologies'
    return db.execute_query(connection, query, ()).fetchall()

def find_by_id(id):
    query = 'select * from technologies where technology_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def update(body, id):
    query = 'update technologies set {} where technology_id = %s'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, list(body.values()) + [id]).fetchall()

def delete(id):
    query = 'delete from technologies where technology_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def create(body):
    query = 'insert into technologies set {}'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, (body.values())).fetchall()
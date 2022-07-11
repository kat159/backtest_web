import db_connector as db
from typing import Dict


host= 'localhost'
user= 'root'
pswd= 'root'
dtbs= 'test_schema'
connection = db.connect_to_database(host, user, pswd, dtbs)


def find_all():
    query = 'select * from regions'
    return db.execute_query(connection, query).fetchall()

def find_by_id(id):
    query = 'select * from regions where region_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def update(body, id):
    query = 'update regions set {} where region_id = %s'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, list(body.values()) + [id]).fetchall()

def delete(id):
    query = 'delete from regions where region_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def create(body):
    query = 'insert into regions set {}'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, (body.values())).fetchall()


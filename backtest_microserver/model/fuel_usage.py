import db_connector as db


host= 'localhost'
user= 'root'
pswd= 'root'
dtbs= 'test_schema'
connection = db.connect_to_database(host, user, pswd, dtbs)

def find_all():
    query = 'select * from fuelusages'
    return db.execute_query(connection, query, ()).fetchall()

def find_by_id(plant_id, fuel_id):
    query = 'select * from fuelusages where plant_id = %s and fuel_type_id = %s'
    return db.execute_query(connection, query, (plant_id, fuel_id)).fetchall()

def create(body):
    query = 'insert into fuelusages set {}'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, (body.values())).fetchall()

def delete(plant_id, fuel_id):
    query = 'delete from fuelusages where plant_id = %s and fuel_type_id = %s'
    return db.execute_query(connection, query, (plant_id, fuel_id, )).fetchall()

def update(body, plant_id, fuel_id):
    query = 'update fuelusages set {} where plant_id = %s and fuel_type_id = %s'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, list(body.values()) + [plant_id, fuel_id, ]).fetchall()


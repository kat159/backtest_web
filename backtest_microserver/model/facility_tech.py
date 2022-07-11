import db_connector as db


host= 'localhost'
user= 'root'
pswd= 'root'
dtbs= 'test_schema'
connection = db.connect_to_database(host, user, pswd, dtbs)

def find_all():
    query = 'select * from facilitytechnologies'
    return db.execute_query(connection, query, ()).fetchall()

def find_by_id(plant_id, tech_id):
    query = 'select * from facilitytechnologies where plant_id = %s and technology_id = %s'
    return db.execute_query(connection, query, (plant_id, tech_id)).fetchall()

def create(body):
    query = 'insert into facilitytechnologies set {}'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, (body.values())).fetchall()

def delete(plant_id, technology_id):
    query = 'delete from facilitytechnologies where plant_id = %s and technology_id = %s'
    return db.execute_query(connection, query, (plant_id, technology_id, )).fetchall()

def update(body, plant_id, technology_id):
    query = 'update facilitytechnologies set {} where plant_id = %s and technology_id = %s'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, list(body.values()) + [plant_id, technology_id, ]).fetchall()




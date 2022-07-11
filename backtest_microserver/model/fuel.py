import db_connector as db


host= 'localhost'
user= 'root'
pswd= 'root'
dtbs= 'test_schema'
connection = db.connect_to_database(host, user, pswd, dtbs)

def find_by_name(name):
    query = 'select * from fueltypes where name = %s'
    return db.execute_query(connection, query, (name,)).fetchall()

def find_all():
    query = 'select * from fueltypes'
    return db.execute_query(connection, query, ()).fetchall()

def find_by_id(id):
    query = 'select * from fueltypes where fuel_type_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def update(body, id):
    query = 'update fueltypes set {} where fuel_type_id = %s'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, list(body.values()) + [id]).fetchall()

def delete(id):
    query = 'delete from fueltypes where fuel_type_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def create(body):
    query = 'insert into fueltypes set {}'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, (body.values())).fetchall()


if __name__ == '__main__':
    body = {
        'fuel_type_id': '99999', 
        'name': 'INSERT_TEST', 
    }
    res = create(body)
    id = '99999'
    print('CREATE res:', find_by_id(id), '\n')
    
    body = {
        'fuel_type_id': '88888', 
        'name': 'UPDATE_TEST', 
    }
    
    update(body, id)
    id = '88888'
    print('UPDATE res:', find_by_id(id), '\n')
    
    delete(id)
    print('DELETE res:', find_by_id(id), '\n')
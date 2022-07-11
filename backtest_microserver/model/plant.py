import db_connector as db
from typing import Dict


host= 'localhost'
user= 'root'
pswd= 'root'
dtbs= 'test_schema'
connection = db.connect_to_database(host, user, pswd, dtbs)


def find(filter: Dict):
    """find facilities satisfying the filter, returning all the information including fuels and techs
    Receive: filter {
        'name': to find facilities with plant name match exactly with the name string
        'name_vague': to find facilities with plant name containing the name_vague string
        'name_vague_tail': to find facilities with plant name starting with the name_vague string
        
        'location_latitude': to find facilities with the same location_latitude
        'location_latitude_upper': to find facilities with location_latitude <= the given value
        'location_latitude_lower': to find facilities with location_latitude >= the given value
        'cost_of_construction'/'cost_of_construction_upper'/'cost_of_construction_lower': the same usage with location_latitude
        'date_of_construction'/'date_of_construction_lower'/'date_of_construction_upper': the same usage with location_latitude
        ...
        
        'fuel': to find facilities use the given fuel
        'limit': max resulting rows
    }
    Return: (
        plant1{
            'name':
            ...
            'fuels': all the fuels the plant uses, joined with commas. e.g. 'gas,oil'
            'technologies': all the techs the plant uses, joined with commas
        }, 
        plant2{...}...
    )
    """
    limit = filter['limit'] if 'limit' in filter else '100'
    query = 'select p.plant_id, p.name, p.location_country, p.location_state, p.location_street_address, \
        p.location_latitude, p.location_longitude, p.cost_of_construction, p.date_of_construction, \
        p.power_output, p.emission_output, p.region_id, r.name as region, group_concat(t.name) as technologies, \
        group_concat(f.name) as fuels' \
            + ' from facilities p' \
            + ' left join fuelusages pf using(plant_id)' \
            + ' left join fueltypes f using(fuel_type_id)' \
            + ' left join facilitytechnologies ft using(plant_id)' \
            + ' left join technologies t using(technology_id)' \
            + ' left join regions r using(region_id)' \
            + ' where p.plant_id in(' \
                + ' select p.plant_id ' \
                + ' from facilities p' \
                + ' left join fuelusages pf using(plant_id)' \
                + ' left join fueltypes f using(fuel_type_id)' \
                + ' left join facilitytechnologies ft using(plant_id)' \
                + ' left join technologies t using(technology_id)' \
                + ' left join regions r using(region_id)' \
                + ' where' \
                + (' p.name=\'' + filter['name'] + '\' and' if 'name' in filter else '')  \
                + (' p.name like \'%%' + filter['name_vague'] + '%%\'' + ' and' if 'name_vague' in filter else  '') \
                + (' p.name like \'' + filter['name_vague_tail'] + '%%\'' + ' and' if 'name_vague_tail' in filter else '') \
                + (' p.location_country=\'' + filter['location_country'] + '\'  and' if 'location_country' in filter else '' ) \
                + (' p.location_state=\'' + filter['location_state'] + '\'  and' if 'location_state' in filter else '' ) \
                + (' p.location_street_address=\'' + filter['location_street_address'] + '\'  and' if 'location_street_address' in filter else '' ) \
                + (' p.location_latitude=' + filter['location_latitude'] + ' and' if 'location_latitude' in filter else  '') \
                + (' p.location_latitude<=' + filter['location_latitude_upper'] + ' and' if 'location_latitude_upper' in filter else '') \
                + (' p.location_latitude>=' + filter['location_latitude_lower'] + ' and' if 'location_latitude_lower' in filter else '') \
                + (' p.location_longitude=' + filter['location_longitude'] + ' and' if 'location_longitude' in filter else '') \
                + (' p.location_longitude<=' + filter['location_longitude_upper'] + ' and' if 'location_longitude_upper' in filter else '') \
                + (' p.location_longitude>=' + filter['location_longitude_lower'] + ' and' if 'location_longitude_lower' in filter else '') \
                + (' p.emission_output=' + filter['emission_output'] + ' and' if 'emission_output' in filter else '') \
                + (' p.emission_output<=' + filter['emission_output_upper'] + ' and' if 'emission_output_upper' in filter else '') \
                + (' p.emission_output>=' + filter['emission_output_lower'] + ' and' if 'emission_output_lower' in filter else '') \
                + (' p.power_output=' + filter['power_output'] + ' and' if 'power_output' in filter else '') \
                + (' p.power_output<=' + filter['power_output_upper'] + ' and' if 'power_output_upper' in filter else '') \
                + (' p.power_output>=' + filter['power_output_lower'] + ' and' if 'power_output_lower' in filter else '') \
                + (' p.cost_of_construction=' + filter['cost_of_construction'] + ' and' if 'cost_of_construction' in filter else '') \
                + (' p.cost_of_construction<=' + filter['cost_of_construction_upper'] + ' and' if 'cost_of_construction_upper' in filter else '') \
                + (' p.cost_of_construction>=' + filter['cost_of_construction_lower'] + ' and' if 'cost_of_construction_lower' in filter else '') \
                + (' p.date_of_construction=' + filter['date_of_construction'] + ' and' if 'date_of_construction' in filter else '') \
                + (' p.date_of_construction<=' + filter['date_of_construction_upper'] + ' and' if 'date_of_construction_upper' in filter else '') \
                + (' p.date_of_construction>=' + filter['date_of_construction_lower'] + ' and' if 'date_of_construction_lower' in filter else '') \
                + (' f.name=\'' + filter['fuel'] + '\'' + ' and' if 'fuel' in filter else '') \
                + (' r.name=\'' + filter['region'] + '\'' + ' and' if 'region' in filter else '') \
                + (' t.name=\'' + filter['technology'] + '\'' + ' and' if 'technology' in filter else '') \
                + ' 1' \
                + ' group by p.plant_id)' \
            + ' group by p.plant_id' \
            + ' limit ' + limit
    return db.execute_query(connection, query).fetchall()

def find_all():
    query = 'select * from facilities'
    return db.execute_query(connection, query).fetchall()

def find_by_id(id):
    query = 'select * from facilities where plant_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def update(body, id):
    query = 'update facilities set {} where plant_id = %s'.format(', '.join('{}=%s'.format(k) for k in body))
    return db.execute_query(connection, query, list(body.values()) + [id]).fetchall()

def delete(id):
    query = 'delete from facilities where plant_id = %s'
    return db.execute_query(connection, query, (id,)).fetchall()

def create(body):
    query = 'insert into facilities set {}'.format(', '.join('{}=%s'.format(k) for k in body))
    print(query)
    return db.execute_query(connection, query, (body.values())).fetchall()

if __name__ == '__main__':
    filter = {
        'name_vague': 'a',
        'date_of_construction_lower': '1975',  # date_of_construction >= 1975
        'cost_of_construction_upper': '999',
        'location_longitude_lower': '9.22',
        'fuel': 'coal',
        'technology': 'Fuel Burning Turbine',
        'limit': '10',
    }
    res = find(filter)
    print('\nfilter:', filter, 'result:', res, '\n')
    
    id = '1'
    res = find_by_id(id)
    print('FIND id:', id, 'result:', res, '\n')
    
    body = {
        'plant_id': '99999', 
        'name': 'INSERT_TEST', 
        'location_country': 'INSERT_TEST', 
        'location_state': 'INSERT_TEST', 
        'location_street_address': 'INSERT_TEST', 
        'location_latitude': '99999', 
        'location_longitude': '99999', 
        'cost_of_construction': '99999', 
        'date_of_construction': '1111-11-11',
        'power_output': '99999',
        'emission_output': '99999',
        'region_id': '1',
    }
    res = create(body)
    id = '99999'
    print('CREATE res:', find_by_id(id), '\n')
    
    body = {
        'plant_id': '88888', 
        'name': 'INSERT_TEST', 
        'location_country': 'INSERT_TEST', 
        'location_state': 'INSERT_TEST', 
        'location_street_address': 'INSERT_TEST', 
        'location_latitude': '88888', 
        'location_longitude': '88888', 
        'cost_of_construction': '88888', 
        'date_of_construction': '2222-12-12',
        'power_output': '88888',
        'emission_output': '88888',
        'region_id': '2',
    }
    
    update(body, id)
    id = '88888'
    print('UPDATE res:', find_by_id(id), '\n')
    
    delete(id)
    print('DELETE res:', find_by_id(id), '\n')
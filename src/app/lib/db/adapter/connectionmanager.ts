import { MysqlConnection } from './mysqlconnection';
import { KeyValuePair, Singleton } from '../../interfaces';
import { ConfigResolver } from '../../filesystem/configreslover';


export class DBConnectionManager extends Singleton{
    connections:KeyValuePair<MysqlConnection>[] = [];

    retriveConnection(name:string) {
        let connection = this.connections[name];
        if (!connection) {
            let config = ConfigResolver.get('database');
            connection = new MysqlConnection(config[name]);
            this.connections[name] = connection;
        }
        return connection;
    }
}

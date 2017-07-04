import { DBConnectionManager } from './adapter/connectionmanager'
import { KeyValuePair, getConstructor } from '../interfaces';

export class BaseDbModel {
    protected connection:string = 'mysql';
    protected table:string;
    protected primaryKey:string;
    protected isDirty:boolean = false;
    protected data:KeyValuePair<any>[] = [];
    constructor() {}

    getConnection() {
        return DBConnectionManager.getInstance().retriveConnection(this.connection);
    }

    getConnectionName() {
        return this.connection;
    }

    setData(key:string, value:any) {
        if (this.data[key] !== value) {
            this.isDirty = true;
            this.data[key] = value;
        }
        return this;
    }

    getData(key:string) {
        return this.data[key];
    }

    save() {
        return this;
    }

    update() {
        return this;
    }

    delete() {
        return this;
    }

    find(value:any) {
        let sql = 'select * from ' + this.table + ' where ' + this.primaryKey + '=' + value;
        this.getConnection().query(sql).subscribe(data=>{
            console.log(data);
        });
    }

    static find(value:any) {
        let construct = getConstructor(this);
        let model:any = new construct();
        return model.find(value);
    }
}

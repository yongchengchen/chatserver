import * as mysql from 'mysql'
import { Observable } from 'rxjs/Observable';

export class MysqlConnection {
    connection: any;
    
    constructor(params: any) {
        this.connection = mysql.createConnection(params);
        let pthis = this;
        this.connection.connect(function(err) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                throw err;
            }
        })
    }
    
    query(sqltext) {
        return Observable.create(observer => {
            this.connection.query(sqltext, function(error, results, fields) {
                if (error) {
                    observer.error();
                } else {
                    observer.next({
                        fields: fields,
                        results: results
                    });
                }
            });
        });
    }
    
    streamQuery(sqltext, rowProcessor) {
        let pthis = this;
        return this.connection.query(sqltext).on('error', function(err) {
            console.log(err);
        }).on('result', function(row) {
            pthis.connection.pause();
            rowProcessor(row, pthis.connection);
        });
    }

    transaction(sqls: Array < string > ) {
        let pthis = this;
        this.connection.beginTransaction(function(err) {
            if (err) {
                throw err;
            }
            for (let sql in sqls) {
                pthis.connection.query(sql, function(err, results, fields) {
                    if (err) {
                        return pthis.connection.rollback(function() {
                            throw err;
                        });
                    }
                });
            }
            pthis.connection.commit(function(err) {
                if (err) {
                    return pthis.connection.rollback(function() {
                        throw err;
                    });
                }
                console.log('success!');
            });
        });
    }
}


import { KeyValuePair } from '../../interfaces';

export class QueryBuilder {
    protected fromTable:string;
    protected bindings:KeyValuePair<any>[] = [];
    protected connection;
    distinct:boolean = false;

    columns:string[] = [];
    joins:string[] = []; 
    wheres:any[] = []; 
    orders:any[] = [];
    limit:number = 0;
    offset:number = 0;
    unions:any[] = []; 

    //     'select' [],
    //     'join'   = [],
    //     'where'  = [],
    //     'having' = [],
    //     'order'  = [],
    //     'union'  = [],
    // ];

    from(table:string) {
        this.fromTable = table;
        return this;
    }

    constructor(connection)
    {
        this.connection = connection;
    }

    private operators:string[] = [
        '=', '<', '>', '<=', '>=', '<>', '!=',
        'like', 'like binary', 'not like', 'between', 'ilike',
        '&', '|', '^', '<<', '>>',
        'rlike', 'regexp', 'not regexp',
        '~', '~*', '!~', '!~*', 'similar to',
        'not similar to',
    ];

    where(column:string, operator:string, value:any=null, cond:string = 'and') {
        if (!(this.operators.indexOf(cond) > -1)) {
            throw new TypeError('');
        }

        let type = 'Basic';
        if (value === null) {
            // return this.where
        } else if (typeof value === "number" || typeof value === "string") {
            this.wheres.push({type:type, column:column, operator:operator, value:value, cond:cond});
        } else {
            // return this.whereSub();
        }
    }
}

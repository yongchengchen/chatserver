//<reference path="node.d.ts" />

import { Singleton } from './lib/interfaces';
import { IOServer } from './lib/ioserver';
import { RedisClient } from './lib/redisclient';
import { Helper } from './lib/helper';
import * as express from 'express';
import * as http from "http";
import * as https from "https";

import { ConfigResolver } from './lib/filesystem/configreslover';
import { EavAttribute } from './model/eavattribute';

export class App extends Singleton{
    server:any;
    id:string;

    private init() {
        this.server = http.createServer(express());
        ConfigResolver.setRootDir(__dirname);
        EavAttribute.find(1);
    }

    private register(ip:string, port:number) {
        this.id = ip + ':' +port;

        let created_at = Helper.timestamp()
        let update_at = created_at;
        RedisClient.getInstance().hset('cservers', this.id, {'created_at':created_at, 'update_at':update_at});
        
        RedisClient.getInstance().subscribe(this.id, function(channel, data) {
            IOServer.getInstance().dispatch(data);
        });
    }

    getId() {
        return this.id;
    }

    start(ip:string, port:number) {
        this.init();
        this.register(ip, port);
        IOServer.getInstance().listen(this.server);

        this.server.listen(port, ip, function(){
            console.log('Server listen at ' + port);
            console.log('Server started');
        })
    }
}


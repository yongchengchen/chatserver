import { UserAgent } from './useragent';
import { Singleton } from './interfaces';
import * as SocketIO from 'socket.io';


export class IOServer extends Singleton {
    private io:SocketIO;
    private clients:any = {}

    static getIO() {
        return IOServer.getInstance().io;
    }

    listen(server:any) {
        this.io = new SocketIO(server);
        this.io.on('connect', function (socket) {
            new UserAgent(socket);
        });
    }

    addUser(uid:string, user:UserAgent) {
        console.log('add user ' + uid);
        this.clients[uid] = user;
    }

    getUser(uid:string) {
        return this.clients[uid];
    }

    removeUser(uid:string) {
        console.log('remove user ' + uid);
        if(this.clients[uid]){
            delete this.clients[uid];
        }
    }

    dispatch(message) {
        console.log('receive msg from other server '+ message);
        let load = JSON.parse(message);
        let client = this.getUser(load.to);
        if (client !== undefined && client) {
            client.sendoutJson(load);
        }
    }

}

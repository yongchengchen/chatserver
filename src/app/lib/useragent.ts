import { IOServer } from './ioserver';
import { RedisClient } from './redisclient';
import { Helper } from './helper';
import { App } from '../app';
import { PrivateMessage } from './message/private'
import { SignalMessage } from './message/signal'

export class UserAgent {
    private socket:any
    uid:string;

    constructor(socket:any) {
        this.socket = socket;
        this.uid = null;
        this.attachEventHandler();
    }

    private attachEventHandler() {
        this.onAuthCheck();
        this.onDisconnect();
        SignalMessage.onMessage(this);
        PrivateMessage.onMessage(this);
    }

    private onAuthCheck() {
        let socket = this.socket;
        let pthis = this;
        this.socket.on('auth', function(rawstring) {
            let json = JSON.parse(rawstring);
            RedisClient.getInstance().get(json.sessionid).subscribe(session=>{
                pthis.uid = json.id;

                IOServer.getInstance().addUser(json.id, pthis);
                RedisClient.getInstance().cset(json.id, 
                    {
                        'uid':json.id,
                        'server':App.getInstance().getId(), 
                        'sessionid':json.sessionid,
                        'beat_at':Helper.timestamp()
                    }
                );

                if (session === null) {
                    // pthis.sendout('system', 'pm', 'auth fail');
                    // socket.disconnect();
                } else {
                    pthis.uid = json.id;
                    RedisClient.getInstance().cset(json.id, 
                        {
                            'uid':json.id,
                            'server':App.getInstance().getId(), 
                            'sessionid':json.sessionid,
                            'beat_at':Helper.timestamp()
                        }
                    );
                }
            })
        });
    }

    private onDisconnect() {
        let pthis = this;
        this.socket.on('disconnect', function() {
            pthis.logoff();
        });
    }

    logon(uid:string, sessionid:string) {
        this.uid = uid;
        IOServer.getInstance().addUser(uid, this);
        RedisClient.getInstance().cset(uid, 
            {
                'uid':uid,
                'server':App.getInstance().getId(), 
                'sessionid':sessionid,
                'beat_at':Helper.timestamp()
            }
        );
        this.socket.emit('sm', 'welcome');
    }

    logoff() {
        RedisClient.getInstance().cdel(this.uid);
        IOServer.getInstance().removeUser(this.uid);
    }

    getConnection() {
        return this.socket;
    }

    isAuthorized(){
        return this.uid !== null;
    }

    sendoutJson(load) {
        this.socket.emit(load.type, JSON.stringify(load));
    }

    sendto(uid:string, load:any) {
        let pthis = this;
        RedisClient.getInstance().cget(uid).subscribe(detail=>{
            if (detail !== null) {
                let user = JSON.parse(detail);
                if (user.server === App.getInstance().getId()) {
                    let toUser = IOServer.getInstance().getUser(user.uid); 
                    if (toUser != null && toUser !== undefined) {
                        toUser.sendoutJson(load);
                    } else {
                        console.log('User:' + user.uid +' not found in the service.');
                        pthis.saveToOffline(uid, load);
                    }
                } else {
                    console.log('from ' + App.getInstance().getId() + ' dispatch to server ' + user.server);
                    RedisClient.getInstance().publish(user.server, JSON.stringify(load));
                }
            } else {
                console.log('can not find '+ uid);
                pthis.saveToOffline(uid, load);
            }
        });
    }

    saveToOffline(to:string, load) {

    }
}

import { UserAgent } from '../useragent';
import { RedisClient } from '../redisclient';

export class AuthorizeMessage {
    static onMessage(user:UserAgent) {
        user.getConnection().on('auth', function(msg) {
            let json = JSON.parse(msg);
            RedisClient.getInstance().get(json.sessionid).subscribe(session=>{
                if (session === null) {
                    // user.sendout('system', 'pm', 'auth fail');
                    console.log('user auth error!');
                    user.getConnection().disconnect();
                    user = null;
                } else {
                    console.log('user authed!');
                    user.logon(json.id, json.sessionid);
                }
            })
        });
    }
}
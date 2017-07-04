import { UserAgent } from '../useragent';
import { Helper } from '../helper';

export class PrivateMessage {
    static onMessage(user:UserAgent) {
        user.getConnection().on('pm', function(msg) {
            console.log('PrivateMessage comming')

            if (user.isAuthorized()) {
                let load = JSON.parse(msg);
                load.type = 'pm';
                load.from = user.uid;
                load.id = Helper.newId();
                load.created_at = Helper.timestamp();
                
                user.sendto(load.to, load);
            }
        })
    }
}
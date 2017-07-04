import { UserAgent } from '../useragent';

export class SignalMessage {
    static onMessage(user:UserAgent) {
        user.getConnection().on('sgm', function(msg) {
            console.log('SignalMessage comming')
            if (user.isAuthorized()) {
                let json = JSON.parse(msg);
            }
        })
    }
}
import * as redis from 'redis'
import { Observable } from 'rxjs/Observable';

export class RedisClient {
	protected static instance:RedisClient;

	private client:any;
	private clientSub:any;	//for subscribe
	private clientPub:any;	//for subscribe publish

	private constructor() {
		this.client = redis.createClient();
		this.client.on('connect', function(){
			console.log('redis connected');
		})
		this.client.on("error", function (err) {
		    console.log("Error " + err);
		});

		this.clientSub = redis.createClient();
		this.clientSub.on('connect', function(){
			console.log('redis subscribe connected');
		})
		this.clientSub.on("error", function (err) {
		    console.log("Error " + err);
		});

		this.clientPub = redis.createClient();
		this.clientPub.on('connect', function(){
			console.log('redis subscribe publisher connected');
		})
		this.clientPub.on("error", function (err) {
		    console.log("Error " + err);
		});
	}

	static getInstance() {
		if (!RedisClient.instance) {
			RedisClient.instance = new RedisClient();
		}
		return RedisClient.instance;
	}

	set(key:string, value:string) {
		this.client.set(key, value);
	}

	get(key:string) {
		return Observable.create(observer => {
			this.client.get(key, function (err, reply) {
				observer.next(reply);
			});
		});
	}

	hset(hashkey:string, subkey:string, value:any) {
		return this.client.hset(hashkey, subkey, JSON.stringify(value));
	}

	hget(hashkey:string, subkey:string) {
		return Observable.create(observer => {
			this.client.hget(hashkey, subkey, function (err, reply) {
				observer.next(reply);
			});
		});
	}

	hkeys(hashkey:string):any {
		return this.client.hkeys(hashkey);
	}

	//spilit user id for redis hash set mem optimize
	private spilitKey(key:string) {
		let len = key.length;
		if (len==0) {
			return ['0', '0'];
		}
		if (len < 3) {
			return ['0', key];
		}

		let start = len-3;
		let part2 = key.substring(start);
		let part1 = key.substring(0, start);
		if (part1 == '') {
		    part1 = '0';
		}
		return [part1, part2];
	}

	cset(key:string, value:any) {
		let keys = this.spilitKey(key);
		return this.hset(keys[0], keys[1], value);
	}

	cget(key:string) {
		let keys = this.spilitKey(key);
		return this.hget(keys[0], keys[1]);
	}

	cdel(key:string) {
		let keys = this.spilitKey(key);
		return this.client.hdel(keys[0], keys[1]);
	}

	subscribe(channel, callback) {
		this.clientSub.on('message', callback);
		this.clientSub.subscribe(channel);
	}

	publish(channel, message) {
		this.clientPub.publish(channel, message);
	}
}
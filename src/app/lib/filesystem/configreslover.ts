import * as fs from 'fs';
import { KeyValuePair, Singleton } from '../interfaces';

export class ConfigResolver extends Singleton {
    private configs:KeyValuePair<any>[] = [];
	private dir:string;

	static setRootDir(dir:string) {
		ConfigResolver.getInstance().dir = dir + '/config/';
	}

	static get(key:string) {
		if (ConfigResolver.getInstance().configs[key]) {
			return ConfigResolver.getInstance().configs[key];
		} 

		return ConfigResolver.getInstance().recursiveValue(key);
	}

	private recursiveValue(key:string) {
		let keys = key.split('.');
		let tmps:string[] = [];
		let found:boolean = false;
		let i:number=0;

		tmps.push.apply(tmps, keys);
		for(i= keys.length-1; i>=0; i--) {
			let configFile = this.dir + tmps.join('/') + '.json';
			if (fs.existsSync(configFile)) {
				let config:any = this.configs[tmps.join('.')];
				if (!config) {
					config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
					this.configs[tmps.join('.')] = config;
				}
				if (config) {
					for(i=i+1; i<keys.length; i++) {
						config = config[keys[i]];
						if (!config) {
							return null;
						}
					}
					return config;
				}
				return null;
			}
			tmps.pop();
		}

		return null;
	}
}

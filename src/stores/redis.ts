import Redis from 'ioredis';

type State = {
	state: any;
};

let uri: string;

if (
	process.env.RUNNING_JEST === 'true' ||
	process.env.NODE_ENV === 'test'
) {
	uri = 'redis';
} else {
	uri = 'localhost';
}

export class RedisStore {
	private state: State;
	private redis: any;
    private sType: any;

	constructor(initialState: State, StoreType: any) {
		this.state = initialState;
        this.sType = StoreType;
		this.redis = new Redis({host: 'redis', port: 6379});
	}

	getState = async (): Promise<State> => {
		const data = await this.redis.get(this.sType);
		if (data) {
			this.state = JSON.parse(data);
		}
		return this.state;
	};

	setState = async (newState: Partial<State>) => {
		this.state = { ...this.state, ...newState };
		await this.redis.set(this.sType, JSON.stringify(this.state));
	};
}

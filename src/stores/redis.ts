import Redis from 'ioredis';

type State = {
	state: any;
};

export class RedisStore {
	private state: State;
	private redis: any;
    private sType: any;

	constructor(initialState: State, StoreType: any) {
		this.state = initialState;
        this.sType = StoreType;
		this.redis = new Redis();
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

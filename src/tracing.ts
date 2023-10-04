import * as opentracing from 'opentracing';

const initJaegerTracer = require('jaeger-client').initTracer;

export default function initTracer(serviceName: string) {
	const config = {
		serviceName: serviceName,
		sampler: {
			type: 'const',
			param: 1
		},
		reporter: {
			logSpans: false,
			agentHost: 'localhost',
			agentPort: 6832
		}
	};
	const options = {
		tags: {
			[serviceName + '.version']: '0.0.2'
		},
		logger: {
			info: function logInfo(msg: string) {
				console.log('INFO  ', msg);
			},
			error: function logError(msg: string) {
				console.log('ERROR ', msg);
			}
		}
	};
	return initJaegerTracer(config, options) as opentracing.Tracer;
}

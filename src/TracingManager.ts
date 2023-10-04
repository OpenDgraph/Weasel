import * as opentracing from 'opentracing';

export class TracingManager {
  private tracer: opentracing.Tracer;

  constructor(tracer: opentracing.Tracer) {
    this.tracer = tracer;
  }

  createSpan(name: string, parentSpan?: opentracing.Span): opentracing.Span {
    return this.tracer.startSpan(name, { childOf: parentSpan });
  }

  finishSpan(span: opentracing.Span): void {
    span.finish();
  }

  log(span: opentracing.Span, logObj: object): void {
    span.log(logObj);
  }

  error(span: opentracing.Span, error: Error): void {
    span.setTag(opentracing.Tags.ERROR, true);
    span.log({ event: 'error', message: error.message, stack: error.stack });
  }

  setTag(span: opentracing.Span, key: string, value: any): void {
    span.setTag(key, value);
  }
}

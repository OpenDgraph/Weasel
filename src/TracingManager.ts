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

  setTag(span: opentracing.Span, key: string, value: any): void {
    span.setTag(key, value);
  }
}

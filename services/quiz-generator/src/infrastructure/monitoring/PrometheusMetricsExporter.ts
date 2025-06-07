import client from 'prom-client'
import { IMetricsExporter } from "../../app/services/IMetricsExporter";
import { QuizGenerationError } from '../../app/exceptions/QuizGenerationError';
import * as http from "node:http";
export class PrometheusMetricsExporter implements IMetricsExporter {
  incQuizGenerationAttempts(): void {
      PrometheusMetricsExporter.QuizGenerationAttempts.inc();
  }
  reportQuizGenerationTime(time: number): void {
      PrometheusMetricsExporter.QuizGenerationDuration.observe(time);
  }
  reportSafetyCheckTime(time: number): void {
      PrometheusMetricsExporter.QuizSafetyCheckDuration.observe(time);
  }
  reportQuizGenerationRetries(retries: number): void {
      PrometheusMetricsExporter.QuizGenerationRetryAverage.observe(retries);
  }
  reportQuizGenerationError(error: QuizGenerationError): void {
      PrometheusMetricsExporter.QuizGenerationError.inc({ error: error.name });
  }

  private static QuizGenerationAttempts = new client.Counter({
    name: 'quiz_generation_attempts',
    help: 'Number of quiz generation attempts',
  })

  private static QuizGenerationDuration = new client.Histogram({
    name: 'quiz_generation_duration',
    help: 'Duration of quiz generation in seconds',
    buckets: [5, 10, 15, 20, 30, 40],
  })

  private static QuizSafetyCheckDuration = new client.Histogram({
    name: 'quiz_safety_check_duration',
    help: 'Duration of quiz safety check in seconds',
    buckets: [1, 3, 5, 7, 10, 15],
  })

  private static QuizGenerationError = new client.Counter({
    name: 'quiz_generation_error',
    help: 'Number of quiz generation errors',
    labelNames: ['error'],
  })

  private static QuizGenerationRetryAverage = new client.Histogram({
    name: 'quiz_generation_retry_average',
    help: 'Average number of retries for quiz generation',
    buckets: [1, 2, 3, 4, 5],
  })

  private static exposed = false
  static exposeMetrics(){
    if(PrometheusMetricsExporter.exposed) return;
    PrometheusMetricsExporter.exposed = true;

    const register = new client.Registry();
    register.registerMetric(PrometheusMetricsExporter.QuizGenerationAttempts);
    register.registerMetric(PrometheusMetricsExporter.QuizGenerationDuration);
    register.registerMetric(PrometheusMetricsExporter.QuizSafetyCheckDuration);
    register.registerMetric(PrometheusMetricsExporter.QuizGenerationError);
    register.registerMetric(PrometheusMetricsExporter.QuizGenerationRetryAverage);
    register.setDefaultLabels({
      app: 'quiz-generator',
    });
    client.collectDefaultMetrics({ register });

    const server = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    });

    const port = process.env.PROMETHEUS_PORT || 9090;
    server.listen(port, () => {
      console.log(`Prometheus metrics exposed at http://localhost:${port}/metrics`);
    });

  }
}
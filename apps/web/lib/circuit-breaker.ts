/**
 * Circuit Breaker for RPC Providers
 * 
 * Implements the Circuit Breaker pattern to prevent cascading failures:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail fast
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 * 
 * Based on Martin Fowler's Circuit Breaker pattern
 */

enum CircuitState {
  CLOSED = 'CLOSED',       // Everything is fine
  OPEN = 'OPEN',           // Too many failures, circuit is open
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening circuit
  successThreshold: number;    // Number of successes to close circuit from half-open
  timeout: number;             // Time in ms before attempting to close circuit
  monitoringPeriod: number;    // Time window for counting failures
}

interface CircuitStats {
  failures: number;
  successes: number;
  rejections: number;
  lastFailureTime: number | null;
  state: CircuitState;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private rejections: number = 0;
  private lastFailureTime: number | null = null;
  private nextAttempt: number = Date.now();
  private failureTimestamps: number[] = [];

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,      // Open after 5 failures
      successThreshold: 2,      // Close after 2 successes
      timeout: 60000,           // Try again after 1 minute
      monitoringPeriod: 120000, // Count failures in 2 minute window
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.rejections++;
        throw new Error(
          `Circuit breaker is OPEN for ${this.name}. ` +
          `Try again in ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`
        );
      }
      // Time to test if service recovered
      this.state = CircuitState.HALF_OPEN;
      this.successes = 0;
      console.log(`🔄 Circuit breaker for ${this.name} entering HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Record a successful execution
   */
  private onSuccess(): void {
    this.failures = 0;
    this.lastFailureTime = null;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        console.log(`✅ Circuit breaker for ${this.name} is now CLOSED`);
      }
    }
  }

  /**
   * Record a failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.failures++;
    this.lastFailureTime = now;
    this.failureTimestamps.push(now);

    // Clean up old failure timestamps outside monitoring period
    this.failureTimestamps = this.failureTimestamps.filter(
      (timestamp) => now - timestamp < this.config.monitoringPeriod
    );

    // Count failures within monitoring period
    const recentFailures = this.failureTimestamps.length;

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during test - reopen circuit
      this.state = CircuitState.OPEN;
      this.nextAttempt = now + this.config.timeout;
      this.successes = 0;
      console.error(
        `❌ Circuit breaker for ${this.name} reopened after test failure. ` +
        `Next attempt in ${this.config.timeout / 1000}s`
      );
    } else if (recentFailures >= this.config.failureThreshold) {
      // Too many failures - open circuit
      this.state = CircuitState.OPEN;
      this.nextAttempt = now + this.config.timeout;
      console.error(
        `🚨 Circuit breaker for ${this.name} is now OPEN! ` +
        `${recentFailures} failures in last ${this.config.monitoringPeriod / 1000}s. ` +
        `Next attempt in ${this.config.timeout / 1000}s`
      );
    }
  }

  /**
   * Get current circuit breaker stats
   */
  getStats(): CircuitStats {
    return {
      failures: this.failureTimestamps.length,
      successes: this.successes,
      rejections: this.rejections,
      lastFailureTime: this.lastFailureTime,
      state: this.state,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.rejections = 0;
    this.lastFailureTime = null;
    this.failureTimestamps = [];
    console.log(`🔄 Circuit breaker for ${this.name} manually reset to CLOSED`);
  }

  /**
   * Check if circuit is allowing requests
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }
    if (this.state === CircuitState.HALF_OPEN) {
      return true;
    }
    if (this.state === CircuitState.OPEN && Date.now() >= this.nextAttempt) {
      return true;
    }
    return false;
  }
}

// Create circuit breaker instances for different services
export const alchemyCircuitBreaker = new CircuitBreaker('Alchemy RPC', {
  failureThreshold: 10,     // Open after 10 failures
  successThreshold: 3,      // Close after 3 successes
  timeout: 120000,          // Try again after 2 minutes
  monitoringPeriod: 300000, // Count failures in 5 minute window
});

export const contractCallCircuitBreaker = new CircuitBreaker('Contract Calls', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  monitoringPeriod: 120000,
});

/**
 * Get all circuit breaker stats for monitoring
 */
export function getAllCircuitStats(): Record<string, CircuitStats> {
  return {
    alchemy: alchemyCircuitBreaker.getStats(),
    contracts: contractCallCircuitBreaker.getStats(),
  };
}

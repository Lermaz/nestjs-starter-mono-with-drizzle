/**
 * Contract for database connectivity health checks.
 */
export interface DatabaseHealthPort {
  checkConnectivity(): Promise<boolean>;
}

export const DATABASE_HEALTH = Symbol('DATABASE_HEALTH');

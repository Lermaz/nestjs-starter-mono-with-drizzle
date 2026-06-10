/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-nest',
      severity: 'error',
      comment: 'Domain layer must not depend on NestJS',
      from: { path: '^src/modules/[^/]+/domain/' },
      to: { path: '^node_modules/@nestjs' },
    },
    {
      name: 'domain-no-orm',
      severity: 'error',
      comment: 'Domain layer must not depend on ORM packages',
      from: { path: '^src/modules/[^/]+/domain/' },
      to: { path: '^node_modules/(drizzle-orm|@mikro-orm)' },
    },
    {
      name: 'app-no-presentation',
      severity: 'error',
      comment: 'Application layer must not import presentation DTOs',
      from: { path: '^src/modules/([^/]+)/application/' },
      to: { path: '^src/modules/$1/presentation/' },
    },
    {
      name: 'app-no-infra-entities',
      severity: 'error',
      comment: 'Application layer must not import persistence entities',
      from: { path: '^src/modules/([^/]+)/application/' },
      to: { path: '^src/modules/$1/infrastructure/entities/' },
    },
    {
      name: 'common-cross-module-public-only',
      severity: 'error',
      comment: 'Common may only import feature modules via public/ barrels',
      from: { path: '^src/common/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: '^src/modules/[^/]+/public/',
      },
    },
    {
      name: 'app-no-nest-common',
      severity: 'error',
      comment:
        'Application layer must not import @nestjs/common; use DomainError and application.decorators',
      from: { path: '^src/modules/([^/]+)/application/' },
      to: { path: '^node_modules/@nestjs/common' },
    },
    {
      name: 'cross-module-public-only',
      severity: 'error',
      comment:
        'Cross-module imports must use public/ facades or module wiring files',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/([^/]+)/',
        pathNot: [
          '^src/modules/$1',
          '^src/modules/[^/]+/public/',
          '^src/modules/[^/]+/infrastructure/schema/',
          '\\.module\\.ts$',
        ],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};

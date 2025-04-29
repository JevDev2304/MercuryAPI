import { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',  // Ejecuta los archivos que terminan en .spec.ts
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',  // Transformador para archivos TypeScript
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1', // Mapear la ruta 'src' en los imports
  },
  collectCoverageFrom: [
    '**/*.{ts,js}',        // Archivos de los que se recogerá coverage
    '!**/main.ts',         // Ignorar archivos específicos
    '!**/app.module.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.guard.ts',
    '!**/*.strategy.ts',
    '!**/*.spec.ts',       // Ignorar los archivos de test
    '!**/__tests__/**',    // Ignorar la carpeta de tests
    '!test/**',            // Ignorar la carpeta test,
    
  ],
  coverageDirectory: '../coverage',  // Dónde se guardará el reporte de cobertura
  testEnvironment: 'node',           // Entorno de pruebas (en este caso, Node.js)
  collectCoverage: true,             // Activar la recolección de cobertura
  coveragePathIgnorePatterns: [
    "/mocha-specs/song.controller.spec.ts"  // Ignorar archivo específico de Mocha
  ],
};

export default config;

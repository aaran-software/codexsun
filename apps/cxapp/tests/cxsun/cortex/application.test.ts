// __tests__/application.test.ts

// Mock dependencies first
import { CRequest, CResponse } from '../../../cortex/http/chttpx';

jest.mock('../../../cortex/db/connection', () => ({
  init: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../cortex/db/db', () => ({
  healthCheck: jest.fn().mockResolvedValue(undefined),
  query: jest.fn(),
  withTransaction: jest.fn(),
}));
jest.mock('../../../cortex/db/migrate', () => ({
  migrate: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../cortex/templates', () => ({
  registerTemplateRoutes: jest.fn(),
}));
jest.mock('../../../cortex/templates/routes-explorer', () => ({
  registerRoutesExplorer: jest.fn(),
}));
jest.mock('../../../cortex/templates/system', () => ({
  registerSystemEndpoints: jest.fn(),
}));
jest.mock('../../../cortex/auth/error.middleware', () => ({
  ErrorMiddleware: jest.fn().mockImplementation(() => ({
    handle: jest.fn(),
  })),
}));
jest.mock('../../../cortex/core/container', () => ({
  Container: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    resolve: jest.fn().mockReturnValue({}),
    createScope: jest.fn().mockReturnValue({}),
    list: jest.fn().mockReturnValue(['Database']),
  })),
}));
jest.mock('../../../cortex/core/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
  })),
}));
jest.mock('../../../cortex/core/modules', () => ({
  ModuleManager: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('../../../cortex/core/events', () => ({
  EventBus: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../../cortex/core/plugins', () => ({
  PluginManager: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('../../../cortex/core/lifecycle', () => ({
  Lifecycle: jest.fn().mockImplementation(() => ({
    runInit: jest.fn().mockResolvedValue(undefined),
    runStart: jest.fn().mockResolvedValue(undefined),
    runStop: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('../../../cortex/core/config', () => ({
  Config: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('../../../cortex/http/chttpx', () => {
  const mockRouter = {
    use: jest.fn(),
    register: jest.fn(),
    printRoutes: jest.fn().mockReturnValue([]),
    handle: jest.fn().mockResolvedValue(true),
    getRoutes: jest.fn().mockReturnValue([{ method: 'GET', path: '/' }]),
  };
  return {
    CHttp: jest.fn().mockImplementation(() => ({
      router: mockRouter,
    })),
    router: mockRouter, // Static router used by Application
  };
});

// Import after mocks
const { Application } = require('../../../cortex/core/application');

// Test suite
describe('CodexSun ERP Application Boot Process', () => {
  let app: { init: () => any; container: { resolve: any; register: any; }; plugins: { init: any; }; config: { load: any; }; start: () => any; handle: (arg0: CRequest, arg1: CResponse) => any; logger: any; printSummary: () => void; };

  beforeEach(() => {
    jest.clearAllMocks();
    app = new Application();
  });




});
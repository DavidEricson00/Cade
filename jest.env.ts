import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-de-teste-super-segura-123456';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '123456789012345';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'secret-test-key-abcdef';
process.env.CLOUDINARY_FOLDER = 'cade/test_items';

// Silencia logs de ruído da aplicação durante a execução dos testes
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = (...args: unknown[]) => {
    // Permite logs se necessário para depuração, suprime logs rotineiros da aplicação
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (
      first.includes('LOG REGISTRADO:') ||
      first.includes('MongoDB conectado') ||
      first.includes('Servidor rodando')
    ) {
      return;
    }
    // originalConsoleLog(...args);
  };

  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (
      first.includes('Erro ao conectar ao MongoDB') ||
      first.includes('ERRO NO UPLOAD') ||
      first.includes('ERRO AO EXPORTAR CSV') ||
      first.includes('ERRO AO GERAR RELATÓRIO') ||
      first.includes('ERRO NO PDF') ||
      first.includes('Erro ao buscar itens') ||
      first.includes('Erro ao excluir item') ||
      first.includes('Erro ao criar item') ||
      first.includes('Erro ao atualizar item')
    ) {
      // Suprime logs de erros propositais esperados nos testes
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { Router } from 'express';

const router = Router();

try {
  // Load yaml documentation file
  const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error('[SwaggerConfig] Failed to load swagger.yaml definitions:', error);
}

export default router;

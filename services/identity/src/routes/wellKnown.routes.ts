import { Router } from 'express';
import { getJwks } from '../security/jwks';
import { config } from '../config/env';

const router = Router();

router.get('/jwks.json', (req, res) => {
  try {
    const jwks = getJwks();
    
    // Set caching headers
    res.set('Cache-Control', `public, max-age=${config.JWKS_CACHE_TTL_SECONDS}`);
    res.set('Content-Type', 'application/json');
    
    res.json(jwks);
  } catch (error) {
    // Secure error handling - do not leak internals
    console.error('JWKS Endpoint Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
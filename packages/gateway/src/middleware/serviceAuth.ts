import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env';

export const verifyServiceAuth = async (req: FastifyRequest, reply: FastifyReply) => {
  const secret = req.headers['x-service-auth'];
  if (secret !== env.SERVICE_AUTH_SECRET) {
    return reply.status(401).send({ error: 'Invalid Service Secret' });
  }
};
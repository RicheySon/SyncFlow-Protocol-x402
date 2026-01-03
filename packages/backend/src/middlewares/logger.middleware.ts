import morgan from 'morgan';
import { env } from '../config/env';

// Predefined formats: 'combined', 'common', 'dev', 'short', 'tiny'
// We use 'dev' for local development and 'combined' for production (if we were logging to a file/stream)

const logger = morgan(env.NODE_ENV === 'development' ? 'dev' : 'tiny');

export default logger;

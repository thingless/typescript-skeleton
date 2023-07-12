import * as model from './model.js';
import { uuidv4, HttpError, isUuid4 } from '../helpers/util.js';
import * as moment from 'moment';
import { getMany, get, upsert, buildFilterSQL, pool, Filters, Columns, update } from './orm.js'
import { initLogger } from '../helpers/logger.js';
import * as assert from 'assert'
import { fileURLToPath } from 'url'
const logger = initLogger(fileURLToPath(import.meta.url));


export async function getUser(uid:model.Uuid):Promise<model.User> {
    throw new Error('Not Implemented')
}
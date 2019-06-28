import * as model from './model';
import { uuidv4, HttpError, isUuid4 } from '../helpers/util';
import * as moment from 'moment';
import { getMany, get, upsert, buildFilterSQL, pool, Filters, Columns, update } from './orm'
import { initLogger } from '../helpers/logger';
import * as assert from 'assert'
const logger = initLogger(__filename);


export async function getUser(uid:model.Uuid):Promise<model.User> {
    throw new Error('Not Implemented')
}
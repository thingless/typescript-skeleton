import { Request, Response } from 'express';
import { HttpError } from '../helpers/util.js';
import * as dal from '../dal/dal.js';
import * as orm from '../dal/orm.js';
import * as model from '../dal/model.js';

import { initLogger } from '../helpers/logger.js';
import { fileURLToPath } from 'url'
const logger = initLogger(fileURLToPath(import.meta.url));

export async function health(req: Request, res: Response) {
    let postgres = true;
    try {
        await orm.pool.query('SELECT 1;')
        postgres = true;
    } catch (e) {
        postgres = false;
    }
    res.json({
        postgres,
    });
}

export async function hello(req: Request, res: Response) {
    res.render('world', {
        uid: req.uid
    });
}
import { Request, Response } from 'express';
import { HttpError } from '../helpers/util';
import * as dal from '../dal/dal';
import * as orm from '../dal/orm';
import * as model from '../dal/model';

import { initLogger } from '../helpers/logger';
const logger = initLogger(__filename);

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
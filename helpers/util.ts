import { Uuid } from '../dal/model';
import { Filters } from '../dal/orm'
import * as rp from 'request'
import * as lodash from 'lodash'

import { initLogger } from '../helpers/logger';
const logger = initLogger(__filename);

const REGEX_UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
export function isUuid4(stringToTest: string): Boolean {
    if (!stringToTest) return false;
    return REGEX_UUID.test(stringToTest);
}

export function sleep(ms: number) {
    // tslint:disable-next-line
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function queryToFilters<T extends { [key: string]: any }>(query: { [key: string]: string | string[] }) {
    // Convert query string params into filter spec - repeated QS params appear as array in req.query
    let filters: Filters<T> = [];
    for (let key in query) {
        let val = query[key];
        if (Array.isArray(val)) {
            for (let inner of val) {
                filters.push([key, inner]);
            }
        }
        else {
            filters.push([key, val]);
        }
    }
    return filters
}

export class HttpError extends Error {
    status: number;
    constructor(status: number, message?: string) {
        super(`HttpError ${status}: ${message}`);
        this.status = status;
        Error.captureStackTrace(this, HttpError);
    }
}

export const uuidv4: () => Uuid = (function () {
    var rndByte: any
    try {
        rndByte = crypto.getRandomValues.bind(crypto, new Uint8Array(1))
    } catch (err) {
        let crypto = require('crypto')
        rndByte = crypto.randomBytes.bind(crypto, 1)
    }
    return () =>
        ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
            (c ^ rndByte()[0] & 15 >> c / 4).toString(16)
        )
})()


export function requestPromise(options: rp.UrlOptions & rp.CoreOptions): Promise<rp.Response> {
    return new Promise((resolve, reject) => {
        rp(options, (err, response, body) => {
            if (err) reject(err)
            else resolve(response)
        })
    })
}

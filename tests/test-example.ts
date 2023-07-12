import * as assert from 'assert'

import { initLogger } from '../helpers/logger.js';
import { fileURLToPath } from 'url'
const logger = initLogger(fileURLToPath(import.meta.url));

describe('Example Calss', function(){
    it.skip('It should hello world', async function(){
        assert.equal('hellow world', 'hellow world', ' y no hellow world?')
    })
})
import * as assert from 'assert'

import { initLogger } from '../helpers/logger';
const logger = initLogger(__filename);

describe('Example Calss', function(){
    it.skip('It should hello world', async function(){
        assert.equal('hellow world', 'hellow world', ' y no hellow world?')
    })
})
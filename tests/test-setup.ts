import * as orm from '../dal/orm.js'
afterEach(() => {

});

before(async () => {
    if(process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf('test-PROJECT_NAME')==-1){
        throw new Error('tests can only be ran on test database!')
    }
    orm.connect(process.env.DATABASE_URL || `postgresql://user:composePASSWORD@localhost:5431/test-PROJECT_NAME`); //default to docker compose connection string
    //any code to reset DB state should be written here
});

after(() => {

});

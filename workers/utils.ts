import * as amqplib from 'amqplib'
import type { Channel } from 'amqplib'
import assert from 'assert'

import { fileURLToPath } from 'url'
import { initLogger } from '../helpers/logger.js';
const logger = initLogger(fileURLToPath(import.meta.url));


export let channel: amqplib.Channel
export async function connect(connectionString: string) {
    const connection = await amqplib.connect(connectionString);
    channel = await connection.createChannel();
    channel.on('error', function (err) {
        console.error('rabbitmq channel error. Shutting down process.', err)
        process.exit(1)
    })
    channel.on('cancel', function (info) {
        console.error('rabbitmq consumer canceled error. Shutting down process.', info)
        process.exit(1)
    })
    //create consumers
    for (const constructor of workerConstructors) {
        const worker = constructor(channel)
        await worker.assertQueue()
        assert.ok(!workers[worker.constructor.name], `multiple workers with same constructor.name, "${worker.constructor.name}""`)
        workers[worker.constructor.name] = worker
        logger.info(`worker ${worker.constructor.name} constructed`)
    }
    return { connection, channel }
}

const workers: { [queueName: string]: Worker<any> } = {}
const workerConstructors: Array<(channel: Channel) => Worker<any>> = []
export function stopWorkers() {
    return Promise.allSettled(Object.values(workers).map(w => w.stop()))
}
export async function startWorkers() {
    for (const worker of Object.values(workers)) {
        await worker.start()
        logger.info(`worker ${worker.constructor.name} started`)
    }
}
type WorkerConstructor<TMSG, TCONFIG extends { threads?: number }> = { new(channel: Channel, config: TCONFIG): Worker<TMSG> };
export function registerWorker<TCONFIG extends { threads?: number }>(config: TCONFIG) {
    return function <T extends WorkerConstructor<any, TCONFIG>>(constructor: T) {
        workerConstructors.push((channel: Channel) => {
            return new constructor(channel, config)
        })
    }
}
export function sendToWorkerQueue<T>(constr: WorkerConstructor<T, any>, msg: T) {
    assert.ok(workers[constr.name], `worker with constructor.name "${constr.name}" not registered`)
    return workers[constr.name].sendToQueue(msg);
}

/**
 * A safe wrapper around channel.publish that accounts for channel's drain semantics 
 */
export async function publish<T>(channel: amqplib.Channel, routingKey: string, msg: T, exchange?: string, options?: amqplib.Options.Publish) {
    if ((channel as any)['full']) {
        await new Promise(resolve => channel.once('drain', resolve))
    }
    const full = !channel.publish(exchange || '', routingKey, Buffer.from(JSON.stringify(msg)), options)
    if (full) {
        (channel as any)['full'] = true;
        await new Promise(resolve => channel.once('drain', resolve));
        (channel as any)['full'] = false;
    }
}


export interface Worker<T> {
    start(): Promise<void>;
    stop(): Promise<void>;
    consume(msg: T): Promise<void>;
    assertQueue(): Promise<void>;
    sendToQueue(msg: T): Promise<void>;
}

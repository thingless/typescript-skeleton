import * as amqplib from 'amqplib'
import type { Channel } from 'amqplib'
import { Worker, publish } from './utils.js'

import { fileURLToPath } from 'url'
import { initLogger } from '../helpers/logger.js';
const logger = initLogger(fileURLToPath(import.meta.url));

export abstract class BaseWorker<TMSG, TCONFIG extends { threads?: number }> implements Worker<TMSG> {
    protected consumerTag: string | null = null;
    protected inFlight: Set<Promise<void>> = new Set()
    constructor(protected channel: Channel, protected config: TCONFIG) { }
    async start() {
        await this.channel.prefetch(this.config.threads || 1)
        this.consumerTag = (await this.channel.consume(this.queueName, this._consume.bind(this))).consumerTag
        await this.channel.prefetch(1) //so no one else gets surprised
    }

    async stop() {
        if (!this.consumerTag) return; //if there is no consumer tag then we are not consuming.
        await this.channel.cancel(this.consumerTag)
        this.consumerTag = null;
        await Promise.allSettled(this.inFlight)
    }

    protected async _consume(msg: amqplib.ConsumeMessage | null) {
        if (!msg) {
            this.channel.emit('cancel', { queue: this.queueName }) //bubble up to connect/channel which handles all errors
            return;
        }
        let parsedMessage: TMSG
        try {
            parsedMessage = JSON.parse(msg.content.toString());
        } catch (error) {
            logger.error('could not parse rabbit message', msg.content.toString(), error)
            this.channel.nack(msg)
            return;
        }
        let promise: Promise<void> | null = null;
        try {
            promise = this.consume(parsedMessage)
            this.inFlight.add(promise)
            await promise
            this.channel.ack(msg)
        } catch (error) {
            logger.error(`Error consuming message for queue ${this.queueName}`, error)
            this.channel.nack(msg, undefined, false) //XXX: prob want some customizability around requeue? 
        }
        if (promise) this.inFlight.delete(promise);
    }

    sendToQueue(msg: TMSG) {
        return publish(this.channel, this.queueName, msg, '')
    }

    async assertQueue() {
        await this.channel.assertQueue(this.queueName, { durable: true, arguments: { "x-queue-mode": "lazy" } })
    }
    protected get queueName() { return this.constructor.name }

    abstract consume(msg: TMSG): Promise<void>
}
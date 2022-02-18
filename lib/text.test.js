'use strict';

import request from "supertest";
import { text } from "../index.js";
import koa from "koa";
import { Buffer } from "buffer";

describe('parse.text(req, opts)', () => {
    describe('with valid str', () => {
        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await text(ctx));

            request(app.callback())
                .post('/')
                .send('Hello World!')
                .expect(200)
                .expect('Hello World!', done);
        });
    });

    describe('with invalid content encoding', () => {
        it('should throw 415', done => {
            const app = new koa();

            app.use(async ctx => {
                try {
                    await text(ctx);
                    ctx.status = 200;
                } catch (error) {
                    ctx.throw(error)
                }
            });

            request(app.callback())
                .post('/')
                .set('content-encoding', 'invalid')
                .send('Hello World!')
                .expect(415, done);
        });
    });

    describe('returnRawBody', () => {
        it('should return raw body when opts.returnRawBody = true', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await text(ctx, { returnRawBody: true }));

            request(app.callback())
                .post('/')
                .send('Hello World!')
                .expect({ parsed: 'Hello World!', raw: 'Hello World!' })
                .expect(200, done);
        });
    });

    describe('use no encoding', () => {
        it('should return raw body when opts.returnRawBody = true', done => {
            const app = new koa();

            app.use(async ctx => {
                const requestBody = await text(ctx, { encoding: false });
                ctx.body = { isBuffer: Buffer.isBuffer(requestBody) };
            });

            request(app.callback())
                .post('/')
                .send('Hello World!')
                .expect({ isBuffer: true })
                .expect(200, done);
        });
    });
});

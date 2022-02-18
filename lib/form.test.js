'use strict';

import request from "supertest";
import { form } from "../index.js";
import koa from "koa";

import qs from "safe-qs";

describe('parse.form(req, opts)', () => {
    describe('with valid form body', () => {
        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await form(ctx);
                expect(body.foo.bar).toEqual('baz')
                ctx.status = 200;
            })

            request(app.callback())
                .post('/')
                .type('form')
                .send({ foo: { bar: 'baz' } })
                .end(err => done(err));
        });
    });

    describe('with invalid content encoding', () => {
        it('should throw 415', done => {
            const app = new koa();

            app.use(async ctx => {
                try {
                    const body = await form(ctx);
                    expect(body.foo.bar).toEqual('baz');
                    ctx.status = 200;
                } catch (error) {
                    ctx.throw(error)
                }

            })

            request(app.callback())
                .post('/')
                .type('form')
                .set('content-encoding', 'invalid')
                .send({ foo: { bar: 'baz' } })
                .expect(415, done);
        });
    });

    describe('with qs settings', () => {
        const data = { level1: { level2: { level3: { level4: { level5: { level6: { level7: 'Hello' } } } } } } };

        it('should not parse full depth', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await form(ctx);
                expect(body.level1.level2.level3.level4.level5.level6['[level7]']).toEqual('Hello');
                ctx.status = 200;
            })

            request(app.callback())
                .post('/')
                .type('form')
                .send({ level1: { level2: { level3: { level4: { level5: { level6: { level7: 'Hello' } } } } } } })
                .end(err => done(err));

        });

        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await form(ctx, { queryString: { depth: 10 } });
                expect(body.level1.level2.level3.level4.level5.level6.level7).toEqual('Hello');
                ctx.status = 200;
            })

            request(app.callback())
                .post('/')
                .type('form')
                .send(data)
                .end(err => done(err));
        });
    });

    describe('with custom qs module', () => {
        it('should parse with safe-qs', done => {
            const app = new koa();

            app.use(async ctx => {
                try {
                    await form(ctx, { qs, });
                    throw new Error('should not run this');
                } catch (err) {
                    ctx.status = err.status;
                    ctx.body = err.message;
                }
            });

            request(app.callback())
                .post('/')
                .type('form')
                .send({ a: { 21: 'a' } })
                .expect('Index of array [21] is overstep limit: 20')
                .expect(400, done);
        });
    });

    describe('allowDots', () => {
        it('should allowDots default to true', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await form(ctx))

            request(app.callback())
                .post('/')
                .type('form')
                .send('a.b=1&a.c=2')
                .expect({ a: { b: '1', c: '2' } })
                .expect(200, done);
        });

        it('allowDots can set to false', done => {
            const app = new koa();
            app.use(async ctx => ctx.body = await form(ctx, { queryString: { allowDots: false } }))

            request(app.callback())
                .post('/')
                .type('form')
                .send('a.b=1&a.c=2')
                .expect({ 'a.b': '1', 'a.c': '2' })
                .expect(200, done);
        });
    });

    describe('returnRawBody', () => {
        it('should return raw body when opts.returnRawBody = true', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await form(ctx, { returnRawBody: true }))

            request(app.callback())
                .post('/')
                .type('form')
                .send('a[b]=1&a[c]=2')
                .expect({ parsed: { a: { b: '1', c: '2' } }, raw: 'a[b]=1&a[c]=2' })
                .expect(200, done);
        });
    });
});

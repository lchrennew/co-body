'use strict';

import request from "supertest";
import { json } from "../index.js";
import koa from "koa";

describe('parse.json(req, opts)', () => {
    describe('with valid json', () => {
        it('should parse', done => {
            const app = new koa();


            app.use(async ctx => {
                const body = await json(ctx);
                expect(body).toMatchObject({ foo: 'bar' });
                done();
            });

            request(app.callback())
                .post('/')
                .send({ foo: 'bar' })
                .end(() => undefined);
        });
    });

    describe('with invalid content encoding', () => {
        it('should throw 415', done => {
            const app = new koa();

            app.use(async ctx => {
                try {
                    const body = await json(ctx);
                    expect(body.foo.bar).toEqual('baz');
                    ctx.status = 200;
                } catch (error) {
                    ctx.throw(error)
                }

            })

            request(app.callback())
                .post('/')
                .type('json')
                .set('content-encoding', 'invalid')
                .send({ foo: { bar: 'baz' } })
                .expect(415, done);
        });
    });

    describe('with content-length zero', () => {
        it('should return null', done => {
            const app = new koa();
            app.use(async ctx => {
                const body = await json(ctx, { strict: false })
                expect(body).toEqual('')
                done();
            })

            request(app.callback())
                .post('/')
                .set('content-length', 0)
                .end(() => undefined);
        });
    });

    describe('with invalid json', () => {
        it('should parse error', done => {
            const app = new koa();

            app.use(async ctx => {
                try {
                    await json(ctx);
                } catch (error) {
                    expect(error).toBeInstanceOf(SyntaxError)
                    expect(error.status).toEqual(400)
                    expect(error.body).toEqual('{"foo": "bar')
                    done();
                }
            });

            request(app.callback())
                .post('/')
                .set('content-type', 'application/json')
                .send('{"foo": "bar')
                .end(() => undefined);
        });
    });

    describe('with non-object json', () => {
        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await json(ctx, { strict: false });
                expect(body).toEqual('foo')
                done();
            });

            request(app.callback())
                .post('/')
                .set('content-type', 'application/json')
                .send('"foo"')
                .end(() => undefined);
        });
    });

    describe('returnRawBody', () => {
        it('should return raw body when opts.returnRawBody = true', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await json(ctx, { returnRawBody: true }));

            request(app.callback())
                .post('/')
                .type('json')
                .send({ foo: 'bar' })
                .expect({ parsed: { foo: 'bar' }, raw: '{"foo":"bar"}' })
                .expect(200, done);
        });
    });
});

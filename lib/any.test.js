import request from "supertest";
import parse from "../index.js";
import koa from "koa";
import zlib from "zlib";

describe('parse(req, opts)', () => {
    describe('with valid form body', () => {
        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await parse(ctx)
                expect(body.foo.bar).toEqual('baz');
                done();
            })

            request(app.callback())
                .post('/')
                .type('form')
                .send({ foo: { bar: 'baz' } })
                .end(() => undefined);
        });
    });

    describe('with valid json', () => {
        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await parse(ctx)
                expect(body).toMatchObject({ foo: 'bar' });
                done();
            })

            request(app.callback())
                .post('/')
                .send({ foo: 'bar' })
                .end(() => undefined);
        });
    });

    describe('with valid text', () => {
        it('should parse', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await parse(ctx))

            request(app.callback())
                .post('/')
                .set('content-type', 'text/plain')
                .send('plain text')
                .expect(200)
                .expect('plain text', done);
        });
    });

    describe('with know json content-type', () => {
        const app = new koa();

        app.use(async ctx => ctx.body = await parse(ctx))

        it('should parse application/json-patch+json', done => {
            request(app.callback())
                .post('/')
                .type('application/json-patch+json')
                .send(JSON.stringify([ { op: 'replace', path: '/foo', value: 'bar' } ]))
                .expect(200)
                .expect([ { op: 'replace', path: '/foo', value: 'bar' } ], done);
        });

        it('should parse application/vnd.api+json', done => {
            request(app.callback())
                .post('/')
                .type('application/vnd.api+json')
                .send(JSON.stringify({ posts: '1' }))
                .expect(200)
                .expect({ posts: '1' }, done);
        });

        it('should parse application/csp-report', done => {
            request(app.callback())
                .post('/')
                .type('application/csp-report')
                .send(JSON.stringify({ posts: '1' }))
                .expect(200)
                .expect({ posts: '1' }, done);
        });

        it('should parse application/ld+json', done => {
            request(app.callback())
                .post('/')
                .type('application/ld+json')
                .send(JSON.stringify({ posts: '1' }))
                .expect(200)
                .expect({ posts: '1' }, done);
        });
    });

    describe('with custom types', () => {
        it('should parse html as text', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await parse(ctx, { textTypes: 'text/html' }))

            request(app.callback())
                .post('/')
                .set('Content-Type', 'text/html')
                .send('<h1>html text</ht>')
                .expect('<h1>html text</ht>', done);
        });

        it('should parse graphql as text', done => {
            const app = new koa();

            app.use(async ctx => ctx.body = await parse(ctx, { textTypes: [ 'application/graphql', 'text/html' ] }))

            const graphql = '{\n  user(id: 4) {\n    name\n  }\n}';

            request(app.callback())
                .post('/')
                .set('Content-Type', 'application/graphql')
                .send(graphql)
                .expect(graphql, done);
        });
    });

    describe('with missing content-type', () => {
        it('should fail with 415', done => {
            const app = new koa();

            app.use(async ctx => {
                try {
                    await parse(ctx)
                } catch (error) {
                    ctx.throw(error)
                }
            })

            request(app.callback())
                .post('/')
                .expect(415, 'Missing content-type', done);
        });
    });

    describe('with content-encoding', () => {
        it('should inflate gzip', done => {
            const app = new koa();
            const json = JSON.stringify({ foo: 'bar' });

            app.use(async ctx => {
                const body = await parse(ctx)
                expect(body).toMatchObject({ foo: 'bar' })
                done()
            })

            const req = request(app.callback())
                .post('/')
                .type('json')
                .set('Content-Encoding', 'gzip');
            req.write(zlib.gzipSync(json));
            req.end(() => undefined);
        });
        it('should inflate deflate', done => {
            const app = new koa();
            const json = JSON.stringify({ foo: 'bar' });

            app.use(async ctx => {
                const body = await parse(ctx)
                expect(body).toMatchObject({ foo: 'bar' })
                done()
            })

            const req = request(app.callback())
                .post('/')
                .type('json')
                .set('Content-Encoding', 'deflate');
            req.write(zlib.deflateSync(json));
            req.end(() => undefined);
        });

        describe('after indentity and with shared options', () => {
            const app = new koa();
            const options = {};

            app.use(async ctx => ctx.body = await parse(ctx, options))

            beforeEach(done => {
                request(app.callback())
                    .post('/')
                    .set('Content-Encoding', 'identity')
                    .send({ foo: 'bar', and: 'something extra' })
                    .expect(200, done);
            });

            it('should inflate deflate', done => {
                const json = JSON.stringify({ foo: 'bar' });
                const req = request(app.callback())
                    .post('/')
                    .type('json')
                    .set('Content-Encoding', 'deflate');
                req.write(zlib.deflateSync(json));
                req.expect(200, done);
            });
        });

        it('should pass-through identity', done => {
            const app = new koa();

            app.use(async ctx => {
                const body = await parse(ctx)
                expect(body).toMatchObject({ foo: 'bar' })
                done();
            })

            request(app.callback())
                .post('/')
                .set('Content-Encoding', 'identity')
                .send({ foo: 'bar' })
                .end(() => undefined);
        });
    });

});

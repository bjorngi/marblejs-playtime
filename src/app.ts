import {
  createServer,
  httpListener,
  r,
} from '@marblejs/core'
import { logger$ } from '@marblejs/middleware-logger'
import { bodyParser$ } from '@marblejs/middleware-body'
import { XMLHttpRequest } from 'xmlhttprequest'

import {
  map,
  switchMap,
  catchError,
} from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'
import {of} from 'rxjs';

const createXHR = () => new XMLHttpRequest()

const getPosts = ajax({
  createXHR,
  url: 'http://www.mocky.io/v2/5cf81c3330000059a0a38118'
}).pipe(
  map(resp => resp.response)
)

export const api$ = r.pipe(
  r.matchPath('/'),
  r.matchType('GET'),
  r.useEffect(req$ => req$.pipe(
    switchMap(() => getPosts),
    map((posts) => ({
      body: posts
    })),
    catchError(err => of(err)),
  ))
)

const effects = [
  api$
]

const middlewares = [
  logger$(),
  bodyParser$(),
]

const httpListenerImpl = httpListener({
  effects,
  middlewares,
})

const server = createServer({
  port: 1337,
  hostname: '127.0.0.1',
  httpListener: httpListenerImpl
})

server.run();

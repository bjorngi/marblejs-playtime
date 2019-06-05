import {
  createServer,
  httpListener,
  r,
  HttpStatus,
} from '@marblejs/core'
import { cors$ } from '@marblejs/middleware-cors'
import { logger$ } from '@marblejs/middleware-logger'
import { bodyParser$ } from '@marblejs/middleware-body'
import { XMLHttpRequest } from 'xmlhttprequest'

import {
  map,
  tap,
  switchMap,
} from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

const createXHR = () => new XMLHttpRequest()

const getPosts = ajax({
  createXHR,
  url: 'https://jsonplaceholder.typicode.com/posts'
}).pipe(
  tap(console.log),
  map(resp => resp.response),
)

export const api$ = r.pipe(
  r.matchPath('/'),
  r.matchType('GET'),
  r.useEffect(req$ => req$.pipe(
    switchMap(() => getPosts),
    tap(console.log),
    map(test => ({
      body: test
    })),
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

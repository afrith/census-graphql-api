import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import koaBody from 'koa-bodyparser'
import winston from 'winston'
import koaLogger from 'koa-logger'
import { ApolloServer } from 'apollo-server-koa'

import { typeDefs, resolvers } from './schema'
import { getPlaceTypeLoader, getPlaceLoader, getPlaceGeomLoader } from './db'
import tileRouter from './tiles'

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
})

const app = new Koa()
app.use(koaLogger(str => logger.info(str)))
app.use(koaBody())
app.use(cors())

const router = new Router()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ ctx }) => ({
    loaders: {
      placeType: getPlaceTypeLoader(),
      place: getPlaceLoader(),
      placeGeom: getPlaceGeomLoader()
    }
  })
})
server.start().then(() => {
  const apolloMiddleware = server.getMiddleware({ path: '/graphql', cors: false })
  router.get('/graphql', apolloMiddleware)
  router.post('/graphql', apolloMiddleware)

  router.use('/tiles', tileRouter.routes(), tileRouter.allowedMethods())

  app.use(router.routes()).use(router.allowedMethods())

  const port = process.env.PORT || 3000
  app.listen(port, function (err) {
    if (err) {
      logger.error(`Error starting server: ${err}`)
      process.exit(1)
    }

    logger.info(`Server listening on port ${port}`)
  })
})


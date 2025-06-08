require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { typeDefs, resolvers } = require('./schema')
const User = require('./models/user')
const { JWT_SECRET, MONGODB_URI } = require('./utils/config')

// اتصال به MongoDB
mongoose.set('strictQuery', false)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

const schema = makeExecutableSchema({ typeDefs, resolvers })

const app = express()          // حتما این خط قبل از استفاده app.use باشد
const httpServer = http.createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer({ schema }, wsServer)

const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          }
        }
      }
    }
  ]
})

async function start() {
  await server.start()

  app.use(
  '/graphql',
  cors({
    origin: 'http://localhost:5173',  // آدرس فرانت‌اند
    credentials: true,                // اجازه ارسال کوکی و هدرهای auth
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        try {
          const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id)
          return { currentUser }
        } catch (e) {
          return {}
        }
      }
      return {}
    },
  })
)


  const PORT = 4000
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
    console.log(`📡 Subscriptions ready at ws://localhost:${PORT}/graphql`)
  })
}

start()

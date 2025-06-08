const {GraphQLError } = require('graphql')
const bcrypt = require('bcrypt')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const { gql } = require('graphql-tag')
const User = require('./models/user')
const Author = require('./models/author')
const Book = require('./models/book')

const pubsub = new PubSub()
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here'

const typeDefs = gql`
  type Query {
    bookCount: Int!
    me: User
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Subscription {
    bookAdded: Book!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => await Book.countDocuments({}),

    me: (root, args, context) => {
      return context.currentUser
    },

    authorCount: async () => await Author.countDocuments({}),

    allBooks: async (root, args) => {
      let query = {}

      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) return []
        query.author = author._id
      }

      if (args.genre) {
        query.genres = { $in: [args.genre] }
      }

      return Book.find(query).populate('author')
    },

    allAuthors: async () => {
  // تعداد کتاب‌ها برای هر نویسنده را با aggregation می‌گیریم
  const authorsWithBookCount = await Author.aggregate([
    {
      $lookup: {
        from: 'books', // نام collection کتاب‌ها (معمولاً جمع اسم مدل با s)
        localField: '_id',
        foreignField: 'author',
        as: 'books'
      }
    },
    {
      $addFields: {
        bookCount: { $size: '$books' }
      }
    },
    {
      $project: {
        name: 1,
        born: 1,
        bookCount: 1
      }
    }
  ])

  // تبدیل _id به string
  return authorsWithBookCount.map(author => ({
    name: author.name,
    born: author.born,
    bookCount: author.bookCount,
    id: author._id.toString()
  }))
}

  },

  Mutation: {
    createUser: async (root, args) => {
      const saltRounds = 10
      const passwordHash = await bcrypt.hash('secret', saltRounds)  // رمز ثابت برای نمونه

      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        passwordHash,
      })

      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError('Creating user failed: ' + error.message, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const passwordCorrect = await bcrypt.compare(args.password, user.passwordHash)

      if (!user || !passwordCorrect) {
        throw new GraphQLError('Invalid username or password', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },

    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw new GraphQLError('Failed to save author: ' + error.message, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
            }
          })
        }
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id,
      })

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Failed to save book: ' + error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
          }
        })
      }

      const populatedBook = await book.populate('author')

      pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })

      return populatedBook
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Failed to update author: ' + error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
          }
        })
      }
      return author
    }
  },

  Author: {
    bookCount: async (root) => {
      const count = await Book.countDocuments({ author: root._id })
      return count
    }
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  },
}

module.exports = { typeDefs, resolvers }

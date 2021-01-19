const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Book = require('./models/Book')
const Author = require('./models/Author')

const MONGODB_URI = 'mongodb://localhost/fullstackopen-graphql-library'
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String!]
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: (root, args) => {
      return Book.find({}).populate('author')
      // TODO: 使用参数进行allBooks查询
      // let result = books;
      // if (args.author) {
      //   result = result.filter(book => book.author === args.author);
      // }
      // if (args.genre) {
      //   result = result.filter(book => book.genres.includes(args.genre));
      // }
      // return result;
    },
    allAuthors: () => Author.find({})
  },

  Author: {
    // TODO: 作者对象的bookCount字段
    bookCount: (root) => {
      return books.filter(book => book.author === root.name).length;
    }
  },

  // TODO: 一本书的author字段

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        const newAuthor = new Author({ name: args.author })
        author = await newAuthor.save();
      }
      const newBook = new Book({
        ...args,
        author: author._id
      })
      const savedBook = await newBook.save()
      return savedBook.execPopulate('author')
    },
    // TODO: editAuthorMutation
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name);
      if (!author) return null;
      const updatedAuthor = {
        ...author,
        born: args.setBornTo
      };
      authors = authors.map(u => u.name === updatedAuthor.name ? updatedAuthor : u);
      return updatedAuthor;
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})


/* 
query count {
  bookCount
  authorCount
}

query allAuthors{
  allAuthors {
    id
    name
    born
  }
}

query allBooks {
  allBooks {
    id
    title
    published
    genres
    author {
      id
      name
      born
    }
  }
}

mutation addBook{
  addBook(
    title: "new Book",
    author: "new author",
    published: 2021,
    genres: ["a", "b"]
  ) {
  	id
    title
    published
    genres
    author {
     	id
      name
      born
    }
  }
}
*/
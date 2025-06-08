import { useState, useEffect } from 'react'
import { useApolloClient } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/loginForm'
import Recommended from './components/Recommended'
import { useSubscription } from '@apollo/client'
import { BOOK_ADDED, ALL_BOOKS } from './queries'
const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
useSubscription(BOOK_ADDED, {
  onData: ({ data, client }) => {
    const book = data.data.bookAdded
      console.log('📡 Subscription fired!', data)

    window.alert(`📚 New book added: ${book.title} by ${book.author.name}`)

    // آپدیت کش برای همه ژانرها (genre: null)
    try {
      const dataInStore = client.readQuery({
        query: ALL_BOOKS,
        variables: { genre: null }
      })

      if (!dataInStore.allBooks.find(b => b.id === book.id)) {
        client.writeQuery({
          query: ALL_BOOKS,
          variables: { genre: null },
          data: {
            allBooks: dataInStore.allBooks.concat(book)
          }
        })
      }
    } catch (error) {
      console.log('Cache update error (bookAdded):', error.message)
    }
  }
})

  useEffect(() => {
    const savedToken = localStorage.getItem('library-user-token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.removeItem('library-user-token')
    client.resetStore()
    setPage('login')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token
          ? <>
              <button onClick={() => setPage('add')}>add book</button>
              <button onClick={logout}>logout</button>
            </>
          : <button onClick={() => setPage('login')}>login</button>
        }
        {token && <button onClick={() => setPage('recommended')}>recommended</button>}

      </div>
      {page === 'recommended' && <Recommended />}

      {page === 'authors' && <Authors />}
      {page === 'books' && <Books />}
      {page === 'add' && <NewBook />}
      {page === 'login' && <LoginForm setToken={setToken} setPage={setPage} />}
    </div>
  )
}

export default App

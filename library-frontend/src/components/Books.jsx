import { useQuery, useSubscription, useApolloClient } from '@apollo/client'
import { useState } from 'react'
import { ALL_BOOKS, BOOK_ADDED } from '../queries'

const Books = () => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const client = useApolloClient()

  const { loading, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
  })

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      alert(`New book added: ${addedBook.title} by ${addedBook.author.name}`)

      try {
        // خواندن کش موجود با همان متغیر ژانر
        const dataInStore = client.readQuery({
          query: ALL_BOOKS,
          variables: { genre: selectedGenre },
        })

        // اگر کتاب جدید در کش نبود، اضافه کن
        if (!dataInStore.allBooks.find(b => b.id === addedBook.id)) {
          client.writeQuery({
            query: ALL_BOOKS,
            variables: { genre: selectedGenre },
            data: {
              allBooks: dataInStore.allBooks.concat(addedBook),
            },
          })
        }
      } catch (error) {
        // اگر کش هنوز ساخته نشده یا خطایی بود، می‌توان refetch زد
        refetch()
      }
    }
  })

  if (loading) return <div>loading...</div>

  const books = data.allBooks

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre)
    refetch({ genre })
  }

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && <p>in genre <strong>{selectedGenre}</strong></p>}

      <table>
        <tbody>
          {books.map(b => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {[...new Set(books.flatMap(book => book.genres))].map(g => (
          <button key={g} onClick={() => handleGenreClick(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => handleGenreClick(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books

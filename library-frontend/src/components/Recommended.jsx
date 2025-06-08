import { useQuery } from '@apollo/client'
import { ME, BOOKS_BY_GENRE } from '../queries'

const Recommended = () => {
  const meResult = useQuery(ME)

  const favoriteGenre = meResult.data?.me?.favoriteGenre

  const booksResult = useQuery(BOOKS_BY_GENRE, {
    skip: !favoriteGenre, // صبر کن تا genre آماده بشه
    variables: { genre: favoriteGenre }
  })

  if (meResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  const books = booksResult.data.allBooks

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        Books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          {books.map(b => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended

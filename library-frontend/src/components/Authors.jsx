import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import SetBirthYearForm from './SetBirthYearForm'
const Authors = () => {

  
 const result = useQuery(ALL_AUTHORS)

  if (result.loading) return <p>Loading authors...</p>
  if (result.error) return <p>Error: {result.error.message}</p>
  if (!result.data) return <p>No data available.</p>  // 👈 این خط مهمه

  const authors = result.data.allAuthors
  return (
    <div>
      <h2>Authors</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born || '—'}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <SetBirthYearForm authors={authors} />
    </div>
  )
}

export default Authors

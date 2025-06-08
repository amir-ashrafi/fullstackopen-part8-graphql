import { useMutation } from "@apollo/client"
import { EDIT_AUTHOR,ALL_AUTHORS } from "../queries"
import { useState } from "react"
import Select from 'react-select'
const SetBirthYearForm = ({ authors }) => {
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.error(error.graphQLErrors?.[0]?.message)
    }
  })

  const submit = (event) => {
    event.preventDefault()
    if (!selectedAuthor) return

    editAuthor({
      variables: { name: selectedAuthor.value, setBornTo: Number(born) }
    })

    setSelectedAuthor(null)
    setBorn('')
  }

  const options = authors.map((a) => ({
    value: a.name,
    label: a.name
  }))

  return (
    <div>
      <h3>Set birth year</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <Select
            value={selectedAuthor}
            onChange={setSelectedAuthor}
            options={options}
            placeholder="Select author..."
          />
        </div>
        <div>
          Born:{' '}
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit" disabled={!selectedAuthor || born === ''}>
          Update author
        </button>
      </form>
    </div>
  )
}
export default SetBirthYearForm
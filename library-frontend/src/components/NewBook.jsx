import { useState } from 'react'
import { ADD_BOOK,ALL_BOOKS,ALL_AUTHORS } from '../queries'
import { useMutation } from '@apollo/client'

const NewBook = () => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

 
const [addBook] = useMutation(ADD_BOOK, {
  update(cache, { data }) {
    if (!data || !data.addBook) {
      console.error('⛔️ data.addBook موجود نیست:', data)
      return
    }

    const addedBook = data.addBook

    try {
      const existingBooks = cache.readQuery({ query: ALL_BOOKS, variables: { genre: null } })
      if (existingBooks && !existingBooks.allBooks.find(b => b.id === addedBook.id)) {
        cache.writeQuery({
          query: ALL_BOOKS,
          variables: { genre: null },
          data: {
            allBooks: [...existingBooks.allBooks, addedBook],
          },
        })
      }
    } catch (e) {
      console.error('خطا در آپدیت کش کتاب‌ها:', e)
    }

   try {
  const existingAuthors = cache.readQuery({ query: ALL_AUTHORS })
  if (existingAuthors && !existingAuthors.allAuthors.find(a => a.name === addedBook.author.name)) {
    cache.writeQuery({
      query: ALL_AUTHORS,
      data: {
        allAuthors: [
          ...existingAuthors.allAuthors,
          {
            ...addedBook.author,
            born: addedBook.author.born ?? null,
          },
        ],
      },
    })
  }
} catch (e) {
  console.error('خطا در آپدیت کش نویسنده‌ها:', e)
}

  }
})


const submit = async (event) => { 
  event.preventDefault();

  const publishedNumber = published ? Number(published) : null;

  try {
    await addBook({
      variables: {
        title,
        author,
        published: publishedNumber,
        genres,
      },
    });

    alert('Book added successfully!');

    setTitle('');
    setPublished('');
    setAuthor('');
    setGenres([]);
    setGenre('');
  } catch (error) {
    console.error('📛 خطای افزودن کتاب:', error);
  }
};

  const addGenre = () => {
    if (genre.trim() !== '') {
      setGenres(genres.concat(genre.trim()));
      setGenre('');
    }
  };

  return (
    <div>
      <h2>Add a new book</h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
import React, { useEffect, useState } from 'react'
import { Book, BookSearch } from './components/BookSearch'
import { BookList } from './components/BookList'

const App = () => {

  const [books, setBooks] = useState<Book[]>([])

  //This will load a reading list in from local storage into the
  //the component state books declared above.
  useEffect(() => {
    const storedBooks = localStorage.getItem("readingList")

    if (storedBooks) {
      setBooks(JSON.parse(storedBooks))
    }
  }, [])

  //while keeping all books in place add a new book to the array with a status of backlog.
  const addBook = (newBook:Book) => {

    //this line here will clone the older books array into this new one
    //It will also add a new book to the array with a status of backlog
    const updatedBooks:Book[]=[...books, {...newBook, status:"backlog"}]

    setBooks(updatedBooks)

    localStorage.setItem("readingList", JSON.stringify(updatedBooks))
  }

  const moveBook = (bookToMove:Book, newStatus:Book["status"]) => { 
    
    const updatedBooks:Book[] = books.map(
      /**
       * This will allow you to move the book within the array?
       */
      (book) => book.key===bookToMove.key? {...book, status:newStatus} : book
    )

    setBooks(updatedBooks)

    localStorage.setItem("readingList", JSON.stringify(updatedBooks))

  }

  return (
    <div className='container mx-auto'>
      <BookSearch onAddBook={addBook}/>
      <BookList books={books} onMoveBook={moveBook}/>
    </div>
  )
    
}

export default App
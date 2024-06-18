// This fine is actually not needed, but preffered for now
import { stat } from "fs"
import { create, createStore } from "zustand"

// Doing this to centralize the state
export type Book = {
    key: string
    title: string
    author_name: string[]
    first_publish_year: string
    number_of_pages_median: string | null
    status: "done" | "inProgress" | "backlog"
}

interface BookState {
    books: Book[]
}

interface BookStore extends BookState {
    addBook: (newBook: Book) => void
    moveBook: (bookToMove: Book, newStatus: Book["status"]) => void
    removeBook: (bookToRemove: Book) => void
    reorderBooks: (
        listType: Book["status"],
        startIndex: number,
        endIndex: number
    ) => void
    loadBooksFromLocalStorage: () => void
    
}

export const useStore = create<BookStore>((set) => ({
    books: [],
    addBook: (newBook) => { set((state: BookState) => {
        
        //this line here will clone the older books array into this new one
        //It will also add a new book to the array with a status of backlog
        const updatedBooks:Book[]=[...state.books, {...newBook, status:"backlog"}]

        localStorage.setItem("readingList", JSON.stringify(updatedBooks))

        return {books:updatedBooks}

    }) },
    removeBook: (bookToRemove) => { set((state: BookState) => {

        if (window.confirm("Are you sure you want to remove this book?")) {
            const updatedBooks = state.books.filter((book) => book.key !== bookToRemove.key)

            localStorage.setItem("readingList", JSON.stringify(updatedBooks))

            return {books:updatedBooks}
        }

        return state

    }) },
    moveBook: (bookToMove, newStatus) => { set((state: BookState) => {

        const updatedBooks:Book[] = state.books.map(
            /**
             * This will allow you to move the book within the array?
             */
            (book) => book.key===bookToMove.key? {...book, status:newStatus} : book
        )
      
        localStorage.setItem("readingList", JSON.stringify(updatedBooks))

        return {books:updatedBooks}

    }) },

    reorderBooks: (
        listType: Book["status"],
        startIndex: number,
        endIndex: number
    ) => { 
        set((state: BookState) => {
            const filteredBooks = state.books.filter(
                (book) => book.status === listType,

            )

            const [reorderBooks] = filteredBooks.splice(startIndex, 1)

            filteredBooks.splice(endIndex, 0, reorderBooks)

            const updatedBooks = state.books.map((book) =>
                book.status === listType? filteredBooks.shift() || book : book)

            localStorage.setItem("readingList", JSON.stringify(updatedBooks))

            return {books:updatedBooks}
        }) 
    },

    loadBooksFromLocalStorage: () => {
        const storedBooks = localStorage.getItem("readingList")

        if (storedBooks) {
            set({books : JSON.parse(storedBooks)})
        } else {
            set({books : []})
        }
    },
}))
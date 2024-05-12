import axios from 'axios'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  
export type Book = {
    key: string
    title: string
    author_name: string[]
    first_publish_year: string
    number_of_pages_median: string | null
    status: "done" | "inProgress" | "backlog"
}

export const BookSearch = (

    //this is a arrow function that will take in a parameter of book
    //with a type of book and will return void
    {onAddBook,}: {onAddBook : (book: Book) => void}

) => {

    //This is the query that we type into the search bar
    //query is the result from the input
    //setQuery is attached to the onchange in order to change the query
    const [query,setQuery] = useState("")

    //These are the results that we receive back from the api
    const [results,setResults] = useState<Book[]>([])

    //Loading state
    const [isLoading, setIsLoading] = useState(false)

    //total number of results
    const [totalResults, setTotalResults] = useState(0)

    //which page the user is on
    const [currentPage, setCurrentPage] = useState(1)

    //how many results to show on one page
    const resultsPerPage=100

    //declare the search results that will store the data from the api
    type SearchResults = {
        docs: Book[]
        numFound:number
    }

    //The async search fucntion that will run when we hit the search button.
    //takes a page number now, will default to page one.
    const searchBooks = async (page:number=1) => {

        //if there is no query then return
        if (!query) return

        //if there is a query then set loading to true so you wont be able to click the
        //button while there is a call in progress
        setIsLoading(true)

        //set off the async call with a try catch
        try {

            //this is going to make the call to the api with the search
            //query using axios
            const response = await axios.get<SearchResults>(
                `https://openlibrary.org/search.json?q=${query}&page=${page}&limit=${resultsPerPage}`
            )

            setResults(response.data.docs)
            setTotalResults(response.data.numFound)
            setCurrentPage(page)

        } catch (error) {
            console.error("Error fetching OpenLibrary API data", error)
        }

        setIsLoading(false)
    }

    const handleKeyPress=(event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            searchBooks()
        }
    }

    const handlePreviousClick=()=>{
        if (currentPage>1) {
            searchBooks(currentPage-1)
        }
    }

    const handleNextClick=()=>{
        if (currentPage<Math.ceil(totalResults/resultsPerPage)) {
            searchBooks(currentPage+1)
        }
    }

    //this is how you show the pagecount / result count
    const startIndex = (currentPage -1)*resultsPerPage+1

    //this will either be the total results if less than 100 results.
    const endIndex = Math.min(startIndex+resultsPerPage-1, totalResults)

    return (
        <div className="p-4">
            <div className="sm:max-w-xs">
                <Input
                    type="text"
                    value={query}
                    //when this value changes set the query as the e target value.
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyUp={handleKeyPress}
                    placeholder='Search for your next book!'
                />
            </div>
            <Button onClick={() => searchBooks()} disabled={isLoading} >
                {isLoading?"Searching...":"Search"}
            </Button>

            <div className="mt-2">
                {totalResults>0&& (
                    <p className="text-sm">
                        Showing {startIndex} - {endIndex} out of {totalResults} results
                    </p>
                )}
            </div>

            <div className="nt-4 max-h-64 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="p-2">Title</TableHead>
                        <TableHead className="p-2">Author</TableHead>
                        <TableHead className="p-2">Year</TableHead>
                        <TableHead className="p-2">Page Count</TableHead>
                        <TableHead className="p-2"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((book, index) => (
                            <TableRow key = {index}>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.author_name}</TableCell>
                                <TableCell>{book.first_publish_year}</TableCell>
                                <TableCell>{book.number_of_pages_median || "-"}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="link"
                                        onClick={
                                            () => { onAddBook({
                                                key: book.title,
                                                title: book.title,
                                                author_name: book.author_name,
                                                first_publish_year: book.first_publish_year,
                                                number_of_pages_median: book.number_of_pages_median || null,
                                                status: "backlog"
                                            }) }
                                        }
                                    >Add</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </div>
            <div className="mt-4 flex items-center justify-between">
                <Button
                    variant={'outline'}
                    onClick={handlePreviousClick}
                    disabled={ currentPage<=1 || isLoading }
                >Previous</Button>

                <Button
                    variant={'outline'}
                    onClick={handleNextClick}
                    disabled={ currentPage >= Math.ceil(totalResults/resultsPerPage) || isLoading }
                >Next</Button>
            </div>
        </div>
    )
}

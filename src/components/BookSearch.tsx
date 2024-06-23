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
import { Book, useStore } from '@/store'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { SlArrowRight, SlArrowLeft } from 'react-icons/sl'

export const BookSearch = () => {

    const {books, addBook} = useStore ((state)=>state)

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
        <div className="-m-1.5 overflow-x-auto">
            <div className='sm:divide-y sm:divide-gray-200 sm:rounded-2xl
            sm:border sm:dark:divide-gray-700 sm:dark:border-gray-700'>
                <div className="flex flex-col items-center gap-3 px-4 py-3 sm:flex-row">
                    <div className="realtive w-full sm:max-w-xs">
                        <Input
                            type="text"
                            value={query}
                            //when this value changes set the query as the e target value.
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyUp={handleKeyPress}
                            placeholder='Search for your next book!'
                        />
                    </div>
                    <Button className="max-sm:w-full sm:max-w-xs" onClick={() => searchBooks()} disabled={isLoading} >
                        {isLoading?
                        <>
                            <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                        </>:"Search"}
                    </Button>
                </div>

                <div className="
                block max-h-[200px] overflow-y-auto sm:max-h-[300px]
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-thumb]:bg-slate-500
                [&::-webkit-scrollbar-track]:bg-gray-100
                dark:[&::-webkit-scrollbar-track]:bg-slate-700
                [&::-webkit-scrollbar]:w-2
                ">
                    {query.length>0 && results.length>0?(
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead >Title</TableHead>
                            <TableHead >Author</TableHead>
                            <TableHead className="hidden sm:table-cell">Year</TableHead>
                            <TableHead className="hidden sm:table-cell">Page Count</TableHead>
                            <TableHead ></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='overflow-y-auto'>
                            {results.map((book, index) => (
                                <TableRow key = {index}>
                                    <TableCell>{book.title}</TableCell>
                                    <TableCell>{book.author_name}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{book.first_publish_year}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{book.number_of_pages_median || "-"}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            onClick={
                                                () => { addBook({
                                                    key: book.title,
                                                    title: book.title,
                                                    author_name: book.author_name,
                                                    first_publish_year: book.first_publish_year,
                                                    number_of_pages_median: book.number_of_pages_median || null,
                                                    status: "backlog"
                                                }) }
                                            }
                                            disabled={books.some((b) => b.key == book.title)}
                                        >Add</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ):(
                    <div className="flex max-h-60 items-center justify-center p-16">
                        <p className='text-graty-600 dark:text-gray-400'>Start your search!</p>
                    </div>
                )}
                    

                </div>

                <div className="flex w-full flex-col items-center gap-3
                border=t border-gray-200 px-6 py-4 sm:flex-row
                sm:justify-between dark:border-gray-700">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-grey-400">
                            {totalResults > 0 ? (
                                <>
                                    Showing{" "}
                                    <span className="font-semibold text-grey-800 dark:text-gray-200">
                                        {startIndex} - {endIndex}
                                    </span>{" "}
                                    out of{" "}
                                    <span className="font-semibold text-grey-800 dark:text-gray-200">
                                        {totalResults}
                                    </span>{" "}
                                    results
                                </>
                            ) : (
                                "0 results"
                            )}
                        </p>
                    </div>
                        <div className="inline-flex gap-x-2">
                            <Button
                                variant={'outline'}
                                onClick={handlePreviousClick}
                                disabled={ currentPage<=1 || isLoading }
                            ><SlArrowLeft className='size-4'/></Button>

                            <Button
                                variant={'outline'}
                                onClick={handleNextClick}
                                disabled={ currentPage >= Math.ceil(totalResults/resultsPerPage) || isLoading }
                            ><SlArrowRight className='size-4'/></Button>
                        </div>
                </div>

                
            </div>
        </div>
    )
}

import { useMediaQuery } from "@/hooks/useMediaQuery"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export const SearchDialog = ({children}:{children:React.ReactNode}) => {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
            {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add a new book</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add a new book</DrawerTitle>
          <DrawerDescription>
            Search
          </DrawerDescription>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  )
}

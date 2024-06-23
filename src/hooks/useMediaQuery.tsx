import * as React from "react"

export function useMediaQuery(query: string) {
    const [value, setValue] = React.useState(false)

    React.useEffect(() => {
        function onChange(e: MediaQueryListEvent) {
            setValue(e.matches)
        }

        const result = matchMedia(query)
        result.addEventListener("change", onChange)

        return () => result.removeEventListener("change", onChange)
    }, [query])

    return value
}
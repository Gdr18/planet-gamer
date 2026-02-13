import { useContext, useState, createContext } from "react";

const ErrorContext = createContext([[]])

export const useErrorContext = () => useContext(ErrorContext)

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null)

    const clearError = () => {
        setError({})
    }

    return (
        <ErrorContext.Provider
            value={{
                error,
                setError,
                clearError
            }}
        >
            {children}
        </ErrorContext.Provider>
    )
}
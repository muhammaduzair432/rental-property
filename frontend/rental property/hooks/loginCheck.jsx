import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const loginCheck = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

    return (!!user ? <Navigate to="/auth" replace /> : <children />)

}

export default loginCheck
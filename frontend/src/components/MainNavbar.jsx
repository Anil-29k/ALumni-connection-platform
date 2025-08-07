import React from 'react'
import { NavLink } from 'react-router-dom'
function MainNavbar() {
    return (
        <>
            <div id="navbarmain">
                <div id="logomain">Logo</div>
                <nav id='nav'>
                    <NavLink to='/'>Home</NavLink>
                    <NavLink to='/login-signup'>Login</NavLink>
                    <NavLink to='/aboutindex'>About Us</NavLink>
                </nav>
            </div>
        </>
    )
}

export default MainNavbar

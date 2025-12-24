// src/components/Navigation.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../css/nav.css"
import "../css/myFlashcards.css"
import *as AiIcons from "react-icons/ai";
import { SidebarData } from './SidebarData'
import { IconContext } from 'react-icons';


function Navigation({ iconcolor, sidebar, onClose }) {
    return (
        <> 
        <IconContext.Provider value={{ color: iconcolor }}>
            <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                <ul className='nav-menu-items' onClick={onClose}>
                    <li className='navbar-toggle'>
                        <Link to="#" className='menu-bars'>
                            <AiIcons.AiOutlineClose />
                        </Link>
                    </li>
                    {SidebarData.map((item, index) => {
                        return (
                            <li key={index} className={item.cName}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </IconContext.Provider>
        </>
    );
}

export default Navigation;
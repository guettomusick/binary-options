import React from 'react';

// type Props = {
//     pageHomeHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void,
//     pageAboutHandler?: (event: React.ChangeEvent<HTMLInputElement>) => void,
//   }

const NavBar = (props: any) => {

    return (
        <nav style={{height: '50px', marginTop: '50px'}}>
            <button onClick={props.pageHomeHandler}>
            Home
            </button>
            <button onClick={props.pageAboutHandler}>
            About  
            </button>
        </nav>
    );
}
 
export default NavBar;
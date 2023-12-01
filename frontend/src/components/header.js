import React from 'react'
class Header extends React.Component
{
    render()
    {
        return(
            <div style={{backgroundColor:'black',width:'100%',height:'10%'}}>
                <h1 style={{padding:'7px',margin:'0px',fontFamily:'cursive', color:'white'}}>Welcome to Codegen</h1>
            </div>
        );
    }
}
export default Header;
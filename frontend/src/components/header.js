import React from 'react'
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLargeScreen: window.innerWidth >= 1000
    };
  }

  componentDidMount() {
    this.handleResize(); // 立即调整尺寸
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.setState({ isLargeScreen: window.innerWidth >= 1000 });
  };

  render() {
    const { isLargeScreen } = this.state;
    const headerStyle = {
      backgroundColor: 'black',
      height: '10%',
      textAlign: 'center', // 文本居中
      position: 'fixed',
      top: 0,
      left: isLargeScreen ? 'calc(400px)' : 0,
      right: 0,
      width: isLargeScreen ? 'calc(100% - 400px)' : '100%',
      zIndex: 100,
      margin: '0 auto'
    };

    return (
      <div style={headerStyle}>
        <h1 style={{ padding: '7px', margin: '0px', color: 'white' }}>
          Welcome to Codegen
        </h1>
      </div>
    );
  }
}

  export default Header;

// 左右侧顶格，居中
// class Header extends React.Component
// {
//     render()
//     {
//         return(
//             <div style={{backgroundColor:'black',width:'100%',height:'10%'}}>
//                 <h1 style={{padding:'7px',margin:'0px', color:'white'}}>Welcome to Codegen</h1>
//             </div>
//         );
//     }
// }

// 
// class Header extends React.Component 
// {
//     render() {
//       return (
//         <div style={{
//           backgroundColor: 'black',
//           width: '80%',        // 调整宽度
//           height: '10%',
//           marginLeft: '20%',   // 将其向右推移
//           textAlign: 'center'  // 文本居中
//         }}>
//           <h1 style={{ padding: '7px', margin: '0px', color: 'white' }}>
//             Welcome to Codegen
//           </h1>
//         </div>
//       );
//     }
//   }




// class Header extends React.Component {
//     render() {
//       return (
//         <div style={{
//           backgroundColor: 'black',

//           width: 'calc(100% - 400px)', // 右侧区域的宽度
//           height: '10%',
//           marginLeft: '400px', // 与左边栏的宽度相同
//           textAlign: 'center', // 文本居中
//           position: 'fixed', // 固定位置
//           right: 0, // 紧贴右侧
//           top: 0 // 紧贴顶部
//         }}>
//           <h1 style={{ padding: '7px', margin: '0px', color: 'white' }}>
//             Welcome to Codegen
//           </h1>
//         </div>
//       );
//     }
//   }
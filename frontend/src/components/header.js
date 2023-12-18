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

    return (
      <div className="header-style">
        <div className="agent-info">CodeGen</div>
        <div className="decs">Code Agent, automatically run and execute code</div>
      </div>
    );
  }
}

export default Header;
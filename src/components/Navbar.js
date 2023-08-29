import { ethers } from 'ethers'
import logo from '../images/HollyStreetCryptoLogo.png'

const Navbar = ({ account, setAccount }) => {

  const connectHandler = async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.getAddress(accounts[0])
      setAccount(account)
  }

    return (
        <nav className="navbar fixed-top mx-0">
            <a
                className="navbar-brand col-sm-2 col-md-2 mr-0 mx-4"
                href="https://twitter.com/HollyStCrypto"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img src={logo} className="App-logo" alt="logo" />
                Holly St Crypto
            </a>

            {account ? (
                <a
                    href={`etherscan.com/address/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button nav-button btn-sm mx-4">
                    {account.slice(0, 5) + '...' + account.slice(38, 42)}
                </a>
            ) : (
                <button 
                    onClick={connectHandler}
                    className="button nav-button btn-sm mx-4"
                >
                    Connect Wallet
                </button>
            )}
        </nav>

    )
}

export default Navbar;
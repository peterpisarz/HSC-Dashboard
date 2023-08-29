import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LaPiscinaAbi from '../abis/LaPiscina.json';
import Navbar from './Navbar'

function App() {
  const contractAddress = '0x03E9E64484Fa3E7CBb4824C8633E901963894D42';

  const [total, setTotal] = useState(0)
  const [account, setAccount ] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const contract = new ethers.Contract(contractAddress, LaPiscinaAbi.abi, provider)
    setContract(contract)

    const maxSupply = await contract.maxSupply()
    setTotal(maxSupply)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.getAddress(accounts[0])
      setAccount(account)
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navbar account={account} setAccount={setAccount}/>
        <Container className="App">
          <Row>
            <Col>
              <h2>Hello, World</h2>
              { account ? (<p>{account}</p>) : <p>Account not loaded</p>}
              <p>Reading Contract: {contractAddress}</p>
              <p>Total NFTs in Contract: {total}</p>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default App;

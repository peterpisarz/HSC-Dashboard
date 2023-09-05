import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LaPiscinaAbi from '../abis/LaPiscina.json';
import Countdown from 'react-countdown'
import Navbar from './Navbar'

function App() {
  const contractAddress = '0x03E9E64484Fa3E7CBb4824C8633E901963894D42';
  const owner = '0xaFACf1b58669bA2684d1d1548e93380208e30eC3';

  const [total, setTotal] = useState(0)
  const [profit, setProfit] = useState(0)
  const [totalSupply, setTotalSupply] = useState(3)
  const [account, setAccount ] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [revealTime, setRevealTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date().getTime())
  const [balance, setBalance] = useState(0)

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    const contract = new ethers.Contract(contractAddress, LaPiscinaAbi.abi, provider)
    setContract(contract)

    // Get Max number of NFTs on the contract
    const maxSupply = await contract.maxSupply()
    setTotal(maxSupply.toString())
    const totalSupply = await contract.totalSupply()
    setTotalSupply(totalSupply)
    console.log(totalSupply)

    // Calculate the total profit on the smart contract
    const cost = await contract.cost()
    console.log("cost: ", cost)
    const profit = totalSupply * cost
    console.log("profit: ", profit)
    setProfit(ethers.formatEther(profit.toString()))

    // Get contract balance
    const contractBalance = await provider.getBalance(contractAddress)
    setBalance(ethers.formatEther(contractBalance.toString()))

    // Figure out if minting is live yet
    const allowMintingAfter = await contract.allowMintingAfter()
    const timeDeployed = await contract.timeDeployed()
    const revealTime = new Date((Number(timeDeployed) + Number(allowMintingAfter)).toString() + '000')
    setRevealTime(revealTime)


    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.getAddress(accounts[0])
      setAccount(account)
    })
  }

  const handleWithdraw = async () => {
    console.log('Balance:', balance);
    console.log('Account:', account);
    try {
      if (balance === 0) {
        window.alert('Balance is zero. No funds to withdraw.');
        return;
      }

      const signer = provider.getSigner()
      const tx = await contract.connect(signer).withdraw();
      await tx.wait();
      alert('Withdrawal successful');
      loadBlockchainData();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navbar account={account} setAccount={setAccount}/>
        <Container className="App">
        <div class="card">
          <div class="card-body">
          <Row>
            <Col>
              <h2 class="card-header" style={{ marginBottom: '10px' }}>NFT Campaign Status</h2>
              { account!==owner ? (
              <p>Account not loaded</p> 
              ) : (
              <div>
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td><h5>Account:</h5></td>
                      <td><h5>{account}</h5></td>
                    </tr>
                    <tr>
                      <td>Reading Contract:</td>
                      <td>{contractAddress}</td>
                    </tr>
                    <tr>
                      <td>Minting Status:</td>
                      <td>{revealTime > new Date().getTime() ? ( 
                        <div>
                          <p>Minting Not Live Until: <Countdown date={currentTime + (revealTime - currentTime)} className='countdown mx-3' /></p>
                        </div> 
                          ) : (
                        <p>Minting is Live!</p>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Total NFTs in Contract:</td>
                      <td>{total}</td>
                    </tr>
                    <tr>
                      <td>Total NFTs Minted:</td>
                      <td>{totalSupply.toString()}</td>
                    </tr>
                    <tr>
                      <td>Total ETH Profit:</td>
                      <td>{profit} ETH</td>
                    </tr>
                    <tr>
                      <td>ETH on Contract:</td>
                      <td>{balance}</td>
                    </tr>
                  </tbody>
                </Table>
                <Button variant="primary" onClick={handleWithdraw} style={{ marginBottom: '10px' }}>
                  Withdraw Funds
                </Button>

              </div>
              )}
            </Col>
          </Row>
          </div>
        </div>
        </Container>
      </div>
  );
}

export default App;

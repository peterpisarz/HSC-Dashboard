import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { ethers } from 'ethers';
import LaPiscinaAbi from '../abis/LaPiscina.json';

const ContractInteraction = ({ contractAddress, provider }) => {
  const [nftsMinted, setNFTsMinted] = useState(0);
  const [totalInCollection, setTotalInCollection] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [profit, setProfit] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [secondsUntilMinting, setSecondsUntilMinting] = useState(0);

  const contract = new ethers.Contract(contractAddress, LaPiscinaAbi.abi, provider);
  let contractName = "";

  const loadContractData = async () => {
    setLoading(true);
    try {
      const minted = await contract.walletOfOwner(provider.getSigner().getAddress());
      setNFTsMinted(minted.length);

      const total = await contract.maxSupply();
      setTotalInCollection(total);

      setRemaining(total - minted.length);

      contractName = await contract.name();
      console.log(contractName);

      const secondsUntilMinting = await contract.getSecondsUntilMinting();
      setSecondsUntilMinting(secondsUntilMinting)

      setIsLive(secondsUntilMinting === 0);

      const nftPrice = await contract.cost(); // Replace with your contract's function to get NFT price
      const profit = nftPrice.mul(minted.length); // Calculate profit by multiplying price with minted NFTs
      setProfit(profit);

    } catch (error) {
      console.error('Error loading contract data:', error);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    try {
      const signer = provider.getSigner()
      const tx = await contract.connect(signer).withdraw();
      await tx.wait();
      alert('Withdrawal successful');
      loadContractData();
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  };

  useEffect(() => {
    loadContractData();
  }, []);

  return (
    <Container>
      <Row>
        <Col>
          <h2>{contractName} Contract Interaction</h2>
          <p>NFTs Minted: {nftsMinted}</p>
          <p>Total in Collection: {totalInCollection}</p>
          <p>Remaining: {remaining}</p>
          <p>Profit: {profit.toString()} ETH</p>
          <Button variant="primary" onClick={handleWithdraw} disabled={loading}>
            Withdraw Funds
          </Button>
          {isLive ? (
            <p>Minting is currently live.</p>
          ) : (
            <p>Minting will be live in {secondsUntilMinting} seconds.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ContractInteraction;

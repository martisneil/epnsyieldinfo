const express = require('express');
const path = require('path');
const app = express();
const fetch = require('node-fetch');
const ethers = require("ethers");
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();
const Web3 = require('web3');
const port = process.env.PORT || 3000;
const etherscanAPI="<--ETHERSCAN API-->";
const epnsAddress="0xf418588522d5dd018b425E472991E52EBBeEEEEE";
const epnsyeildAddress= "0x6019B84E2eE9EB62BC42E32AB6375A7095886366";
const epnsstakingAddress="0xB72ff1e675117beDefF05a7D0a472c3844cfec85";
const infuraAPI='<--INFURA API-->';
var privatekey = "<--PRIVATE KEY-->";
const web3= new Web3(infuraAPI);


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(__dirname+"/index.html");
});

const allMetrics = {
  epochData: [],
  push_cg: null,
  currentEpochID: null,
  poolSize: null,
  currentAPR: null,
  latestepochID: null,
}

app.get('/data', async (req, res) => {

await coingeckoPrice(allMetrics);
await yeildMetrics(allMetrics);
res.json({latestPrice:allMetrics.push_cg,currentPoolSize:allMetrics.poolSize,latestEpochID:allMetrics.latestepochID,latestApr:allMetrics.currentAPR,epochArray:allMetrics.epochData});

});

  // getting current EPNS price
async function coingeckoPrice(populateObj){
  const epnsresult = await CoinGeckoClient.coins.fetch('ethereum-push-notification-service', {});
  populateObj.push_cg=JSON.stringify(epnsresult.data.market_data.current_price.usd)
  console.log("PUSH value is: $"+populateObj.push_cg);
}



// getting yeild metrics

async function yeildMetrics(populateObj){
  const response = await fetch('https://api.etherscan.io/api?module=contract&action=getabi&address='+epnsyeildAddress+'&apikey='+etherscanAPI);
  const data = await response.json();
  let abi = data.result;
  const node = infuraAPI;
  const provider = new ethers.providers.WebSocketProvider(node);
  let wallet = new ethers.Wallet(privatekey, provider);
  let contract = new ethers.Contract(epnsyeildAddress, abi, wallet);
  populateObj.currentEpochID=  await contract.getCurrentEpoch();
  populateObj.latestepochID= populateObj.currentEpochID.toString();
  console.log('current epoch ID: '+populateObj.currentEpochID);
  console.log('converted epochID type: '+populateObj.latestepochID);


  // reading historical epoch pool size & APY
  populateObj.epochData=[];
  for (var epochID = 1; epochID < populateObj.currentEpochID; epochID++)
  {
  let read = await contract.getPoolSize(epochID);
  populateObj.epochData.push(web3.utils.fromWei(read.toString()));
  }


  // calculating current APY
  const response2 = await fetch('https://api.etherscan.io/api?module=contract&action=getabi&address='+epnsAddress+'&apikey='+etherscanAPI);
  const data2 = await response2.json();
  let abi2 = data2.result;
  let contract2 = new ethers.Contract(epnsAddress, abi2, wallet);
  let read2 =await contract2.balanceOf(epnsstakingAddress);
  var currentStakeCoins=web3.utils.fromWei(read2.toString());
  populateObj.poolSize=Math.floor(currentStakeCoins);
  let currentReward=30000-(populateObj.currentEpochID*100);
  // use summation of reducing reward arithemtic progression for APR calculation
  populateObj.currentAPR=(100*26*(2*currentReward-5100)/currentStakeCoins).toFixed(2);
  console.log("total staked coins: "+ populateObj.poolSize);
  console.log("current APR: "+populateObj.currentAPR);
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

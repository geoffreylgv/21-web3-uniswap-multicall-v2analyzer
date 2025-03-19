// const provider = new ethers.providers.JsonRpcProvider(import.meta.env.ALCHEMY_SEPOLIA_API_KEY_URL);

import "./index.css";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import multicallAbi from "./ABI/multicallabi.json";
import pairAbi from "./ABI/pairabi.json";
import erc20Abi from "./ABI/erc20.json";
import { getReadOnlyProvider } from './utils';
import { EXAMPLE_PAIRS } from './utils/sample';

function App() {

  const multicallAddress = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';
  // const provider = new ethers.JsonRpcProvider(import.meta.env.ALCHEMY_SEPOLIA_API_KEY_URL);
  const provider = getReadOnlyProvider();

  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSampleClick = (address) => {
    setPairAddress(address);
  };

  useEffect(() => {
    if (pairAddress) {
      handleSubmit({ preventDefault: () => {} });
    }
  }, [pairAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(pairAddress)) {
      setError('Invalid Ethereum address');
      return;
    }
    setError('');
    setIsLoading(true);

    console.log('Multicall Address:', multicallAddress);
    console.log('Is Valid Address?', ethers.isAddress(multicallAddress));

    try {
      // init
      // const multicall = new ethers.Contract(multicallAddress, multicallAbi, provider); 
      const multicall = new ethers.Contract(multicallAddress,
        [
          "function aggregate(tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)"
        ],
        provider
      );
      console.log(" multicallAddress: ", multicallAddress);

      const pairInterface = new ethers.Interface(pairAbi);
      const erc20Interface = new ethers.Interface(erc20Abi);

      const pairCalls = [
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('token0'),
          value: 0
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('token1'),
          value: 0
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('getReserves'),
          value: 0
        }, {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('totalSupply'),
          value: 0
        }
      ];

      console.log('Result pair calls :', pairCalls);

      // Exe aggra
      const [, pairResults] = await multicall.aggregate.staticCall(pairCalls);
      console.log('\nPair results :', pairResults);
      // Results decoder paair
      const token0 = pairInterface.decodeFunctionResult('token0', pairResults[0])[0];
      const token1 = pairInterface.decodeFunctionResult('token1', pairResults[1])[0];
      const reserves = pairInterface.decodeFunctionResult('getReserves', pairResults[2]);
      const totalSupply = pairInterface.decodeFunctionResult('totalSupply', pairResults[3])[0];

      console.log('\nToken 0 :', token0);
      console.log('\nToken 1 :', token1);
      // Token details anotha call
      const tokenCalls = [
        { target: token0, callData: erc20Interface.encodeFunctionData('name'), value: 0 },
        { target: token0, callData: erc20Interface.encodeFunctionData('symbol'), value: 0 },
        { target: token0, callData: erc20Interface.encodeFunctionData('decimals'), value: 0 },
        { target: token1, callData: erc20Interface.encodeFunctionData('name'), value: 0 },
        { target: token1, callData: erc20Interface.encodeFunctionData('symbol'), value: 0 },
        { target: token1, callData: erc20Interface.encodeFunctionData('decimals'), value: 0 }
      ];
      console.log('Result pair calls :', tokenCalls);

      const [, tokenResults] = await multicall.aggregate.staticCall(tokenCalls);

      // Decode token results
      const token0Details = {
        name: erc20Interface.decodeFunctionResult('name', tokenResults[0])[0],
        symbol: erc20Interface.decodeFunctionResult('symbol', tokenResults[1])[0],
        decimals: erc20Interface.decodeFunctionResult('decimals', tokenResults[2])[0]
      };

      const token1Details = {
        name: erc20Interface.decodeFunctionResult('name', tokenResults[3])[0],
        symbol: erc20Interface.decodeFunctionResult('symbol', tokenResults[4])[0],
        decimals: erc20Interface.decodeFunctionResult('decimals', tokenResults[5])[0]
      };

      console.log('\ntoken0Details :', token0Details, '\ntoken1Details', token1Details);

      setPairData({
        token0: { address: token0, ...token0Details },
        token1: { address: token1, ...token1Details },
        reserves: {
          reserve0: reserves._reserve0.toString(),
          reserve1: reserves._reserve1.toString(),
          blockTimestamp: reserves._blockTimestampLast.toString()
        },
        totalSupply: totalSupply.toString()
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Uniswap V2 Pair Analyzer
          </h1>
          <p className="text-gray-600">Explore liquidity pool details in real-time</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-material">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value.trim())}
                placeholder="Your pair address goes here ..."
                className="flex-1 p-4 bg-gray-100 rounded-lg placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-primary text-white font-medium 
                         rounded-lg hover:bg-primary-dark disabled:opacity-50 
                         transition-material"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>

            {/* Example Pairs */}
            <div className="mb-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-medium text-gray-500 mb-2">Try these examples:</h3>
              <div className="flex gap-2">
                {EXAMPLE_PAIRS.map((pair) => (
                  <button
                    key={pair.address}
                    type="button"
                    onClick={() => handleSampleClick(pair.address)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-blue-600 text-gray-700 rounded-lg transition-colors"
                  >
                    {pair.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-800 rounded-xl p-4 text-red-300">
            ⚠️ Error: {error}
          </div>
        )}

        {/* Results Section */}
        {pairData && (
          <div className="space-y-6">
            {/* Token Pair Overview */}
            <div className="bg-gray-900/100 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-cyan-400 mb-6">Token Pair</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <TokenCard token={pairData.token0} />
                <TokenCard token={pairData.token1} />
              </div>
            </div>

            {/* Pool Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <MetricCard
                title="Total Liquidity"
                value={formatLargeNumber(pairData.totalSupply)}
                unit="LP"
                icon="🌊"
              />
              <MetricCard
                title="Reserve 0"
                value={formatLargeNumber(pairData.reserves.reserve0)}
                unit={pairData.token0.symbol}
                icon="📈"
              />
              <MetricCard
                title="Reserve 1"
                value={formatLargeNumber(pairData.reserves.reserve1)}
                unit={pairData.token1.symbol}
                icon="📉"
              />
            </div>

            {/* Last Updated */}
            <div className="text-center text-gray-400 text-sm">
              Last updated: Block #{pairData.reserves.blockTimestamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TokenCard = ({ token }) => (
  <div className="bg-gray-700 rounded-lg p-5">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-cyan-400">
        {token.symbol?.[0] || '?'}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-100">{token.name}</h3>
        <p className="font-mono text-cyan-400 text-sm">{token.symbol}</p>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <DetailItem label="Address" value={trancateAddress(token.address)} />
      <DetailItem label="Decimals" value={token.decimals} />
    </div>
  </div>
);

const MetricCard = ({ title, value, unit, icon }) => (
  <div className="bg-gray-800 rounded-xl p-5">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-gray-400 text-sm mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-100">
          {value} <span className="text-cyan-400 text-lg">{unit}</span>
        </div>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-600/50 last:border-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="font-mono text-gray-300 text-sm">{value}</span>
  </div>
);


// Utility function
function formatLargeNumber(num) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
}
function trancateAddress(address, length = 10) {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}
export default App;

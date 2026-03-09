#!/usr/bin/env node
// Comprehensive test: RPC, Multicall3, Batch RPC, Etherscan V2 for all EVM chains
const MULTICALL3_ADDR = '0xcA11bde05977b3631167028862bE2a173976CA11';
const ETHERSCAN_KEY = 'GSG4FQIMXZBXINZE2ZKQAEXNFW1C1VVZSP';
// A known active address (Vitalik) for nonce test
const TEST_ADDR = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

const CHAINS = [
  { id: 'ethereum', chainId: 1, name: 'Ethereum', rpcUrls: ['https://ethereum-rpc.publicnode.com','https://rpc.ankr.com/eth','https://eth.llamarpc.com'] },
  { id: 'polygon', chainId: 137, name: 'Polygon', rpcUrls: ['https://polygon-bor-rpc.publicnode.com','https://rpc.ankr.com/polygon','https://polygon.llamarpc.com'] },
  { id: 'base', chainId: 8453, name: 'Base', rpcUrls: ['https://base.drpc.org','https://base-rpc.publicnode.com','https://rpc.ankr.com/base','https://base.llamarpc.com','https://mainnet.base.org'] },
  { id: 'arbitrum', chainId: 42161, name: 'Arbitrum', rpcUrls: ['https://arbitrum-one-rpc.publicnode.com','https://rpc.ankr.com/arbitrum','https://arbitrum.llamarpc.com'] },
  { id: 'optimism', chainId: 10, name: 'Optimism', rpcUrls: ['https://optimism-rpc.publicnode.com','https://rpc.ankr.com/optimism','https://optimism.llamarpc.com'] },
  { id: 'avalanche', chainId: 43114, name: 'Avalanche', rpcUrls: ['https://avalanche-c-chain-rpc.publicnode.com','https://rpc.ankr.com/avalanche'] },
  { id: 'bsc', chainId: 56, name: 'BNB Chain', rpcUrls: ['https://bsc-rpc.publicnode.com','https://rpc.ankr.com/bsc','https://bsc.llamarpc.com'] },
  { id: 'gnosis', chainId: 100, name: 'Gnosis', rpcUrls: ['https://gnosis-rpc.publicnode.com','https://rpc.ankr.com/gnosis','https://rpc.gnosischain.com'] },
  { id: 'zora', chainId: 7777777, name: 'Zora', rpcUrls: ['https://rpc.zora.energy','https://zora.drpc.org'] },
  { id: 'linea', chainId: 59144, name: 'Linea', rpcUrls: ['https://linea-rpc.publicnode.com','https://rpc.linea.build'] },
  { id: 'scroll', chainId: 534352, name: 'Scroll', rpcUrls: ['https://scroll-rpc.publicnode.com','https://rpc.scroll.io'] },
  { id: 'fantom', chainId: 250, name: 'Fantom', rpcUrls: ['https://fantom-rpc.publicnode.com','https://rpc.ankr.com/fantom','https://fantom.drpc.org'] },
  { id: 'moonbeam', chainId: 1284, name: 'Moonbeam', rpcUrls: ['https://moonbeam-rpc.publicnode.com','https://rpc.api.moonbeam.network'] },
  { id: 'moonriver', chainId: 1285, name: 'Moonriver', rpcUrls: ['https://moonriver-rpc.publicnode.com','https://rpc.api.moonriver.moonbeam.network'] },
  { id: 'cronos', chainId: 25, name: 'Cronos', rpcUrls: ['https://cronos-evm-rpc.publicnode.com','https://evm.cronos.org'] },
  { id: 'celo', chainId: 42220, name: 'Celo', rpcUrls: ['https://celo-rpc.publicnode.com','https://forno.celo.org'] },
  { id: 'aurora', chainId: 1313161554, name: 'Aurora', rpcUrls: ['https://aurora-rpc.publicnode.com','https://mainnet.aurora.dev'] },
  { id: 'mantle', chainId: 5000, name: 'Mantle', rpcUrls: ['https://mantle-rpc.publicnode.com','https://rpc.mantle.xyz'] },
  { id: 'blast', chainId: 81457, name: 'Blast', rpcUrls: ['https://blast-rpc.publicnode.com','https://rpc.blast.io'] },
  { id: 'mode', chainId: 34443, name: 'Mode', rpcUrls: ['https://mode-rpc.publicnode.com','https://mainnet.mode.network'] },
  { id: 'abstract', chainId: 2741, name: 'Abstract', rpcUrls: ['https://api.mainnet.abs.xyz','https://abstract.api.onfinality.io/public'] },
  { id: 'sei', chainId: 1329, name: 'Sei', rpcUrls: ['https://evm-rpc.sei-apis.com','https://sei-evm.drpc.org'] },
  { id: 'apechain', chainId: 33139, name: 'ApeChain', rpcUrls: ['https://apechain.calderachain.xyz/http','https://rpc.apechain.com/http'] },
  { id: 'berachain', chainId: 80094, name: 'Berachain', rpcUrls: ['https://rpc.berachain.com','https://berachain-rpc.publicnode.com'] },
  { id: 'monad', chainId: 10143, name: 'Monad Testnet', rpcUrls: ['https://testnet-rpc.monad.xyz'] },
  { id: 'ronin', chainId: 2020, name: 'Ronin', rpcUrls: ['https://api.roninchain.com/rpc','https://ronin-rpc.publicnode.com'] },
];

async function rpcCall(url, method, params = []) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 8000);
  try {
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: c.signal,
    });
    return r.json();
  } finally { clearTimeout(t); }
}

async function batchRpcCall(url, calls) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 10000);
  try {
    const payload = calls.map((call, i) => ({
      jsonrpc: '2.0', id: i + 1, method: call.method, params: call.params,
    }));
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: c.signal,
    });
    const data = await r.json();
    if (!Array.isArray(data)) return null;
    return data;
  } catch { return null; }
  finally { clearTimeout(t); }
}

async function testChain(chain) {
  const r = {
    name: chain.name,
    rpc: '-', rpcVia: '',
    multicall3: '-',
    batchRpc: '-',
    etherscanV2: '-',
  };

  // 1. RPC connectivity
  let workingUrl = '';
  for (const url of chain.rpcUrls) {
    try {
      const data = await rpcCall(url, 'eth_blockNumber');
      if (data.result) {
        r.rpc = 'OK';
        r.rpcVia = new URL(url).hostname;
        workingUrl = url;
        break;
      }
    } catch {}
  }
  if (!workingUrl) { r.rpc = 'FAIL'; return r; }

  // 2. Multicall3
  for (const url of chain.rpcUrls) {
    try {
      const data = await rpcCall(url, 'eth_getCode', [MULTICALL3_ADDR, 'latest']);
      if (data.result && data.result !== '0x' && data.result.length > 10) {
        r.multicall3 = 'OK';
        break;
      } else if (data.result === '0x') {
        r.multicall3 = 'NO';
        break;
      }
    } catch {}
  }

  // 3. Batch RPC (test with 3 nonce queries)
  const testAddrs = [TEST_ADDR, MULTICALL3_ADDR, '0x0000000000000000000000000000000000000001'];
  const batchResult = await batchRpcCall(workingUrl, testAddrs.map(a => ({
    method: 'eth_getTransactionCount', params: [a, 'latest'],
  })));
  if (batchResult && batchResult.length === 3) {
    const allValid = batchResult.every(b => b.result !== undefined);
    r.batchRpc = allValid ? 'OK' : 'PARTIAL';
  } else {
    r.batchRpc = 'NO';
  }

  // 4. Etherscan V2
  try {
    const url = `https://api.etherscan.io/v2/api?chainid=${chain.chainId}&module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_KEY}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await resp.json();
    if (data.result && typeof data.result === 'string' && data.result.startsWith('0x')) {
      r.etherscanV2 = 'FREE';
    } else if (typeof data.result === 'string' && data.result.includes('not supported')) {
      r.etherscanV2 = 'PAID';
    } else {
      r.etherscanV2 = 'NO';
    }
  } catch { r.etherscanV2 = 'ERR'; }

  return r;
}

async function main() {
  console.log('\nDead or Alive NFT — EVM Chain Compatibility Test\n');
  console.log(
    'Chain'.padEnd(16),
    'RPC'.padEnd(5),
    'Via'.padEnd(28),
    'MC3'.padEnd(5),
    'Batch'.padEnd(8),
    'EthV2'
  );
  console.log('-'.repeat(80));

  let ok = 0, warn = 0, fail = 0;

  for (const chain of CHAINS) {
    const r = await testChain(chain);

    const rpcIcon = r.rpc === 'OK' ? 'OK' : 'FAIL';
    const mc3Icon = r.multicall3 === 'OK' ? 'OK' : 'NO';
    const batchIcon = r.batchRpc === 'OK' ? 'OK' : r.batchRpc === 'NO' ? 'NO' : r.batchRpc;
    const ethIcon = r.etherscanV2;

    console.log(
      r.name.padEnd(16),
      rpcIcon.padEnd(5),
      (r.rpcVia || '-').padEnd(28),
      mc3Icon.padEnd(5),
      batchIcon.padEnd(8),
      ethIcon
    );

    if (r.rpc === 'FAIL') fail++;
    else if (r.multicall3 !== 'OK' || r.batchRpc !== 'OK') warn++;
    else ok++;

    await new Promise(ok => setTimeout(ok, 200));
  }

  console.log('-'.repeat(80));
  console.log(`\nSummary: ${ok} fully optimized, ${warn} with fallbacks, ${fail} failed`);
  console.log('\nLegend:');
  console.log('  MC3 = Multicall3 (batch ownerOf). NO = uses individual calls (slower)');
  console.log('  Batch = JSON-RPC batch nonces. NO = uses individual calls (slower)');
  console.log('  EthV2 = Etherscan V2 API. FREE/PAID/NO. NO = RPC event scan only');
}

main().catch(console.error);

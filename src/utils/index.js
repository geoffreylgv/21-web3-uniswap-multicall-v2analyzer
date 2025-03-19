import { JsonRpcProvider } from "ethers";
import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

let readonlyProvider = null;

export const supportedNetworks = [mainnet];

export const config = createConfig({
    chains: supportedNetworks,
    multiInjectedProviderDiscovery: true, connectors: [],
    transports: {
        [mainnet.id]: http(),
    },
});


export const getReadOnlyProvider = () => {
    if (readonlyProvider) return readonlyProvider;
    readonlyProvider = new JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/H52v4zgu-ah7796G2rMlUoIvb9NPFULH');

    return readonlyProvider;
};

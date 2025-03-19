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
    readonlyProvider = new JsonRpcProvider(import.meta.env.ALCHEMY_SEPOLIA_API_KEY_URL);

    return readonlyProvider;
};

import { createViemWalletClient } from '../viem/createViemWalletClient.js';
import { ERC20_ABI, ERC20_BYTECODE } from '../const/contractDetails.js';
import { createViemPublicClient } from '../viem/createViemPublicClient.js';
import { ToolConfig } from './allTools.js';

export const deployErc20Tool: ToolConfig = {
    definition: {
        type: 'function',
        function: {
            name: 'deploy_erc20_token',
            description: 'Deploy a new ERC20 token contract',
            parameters: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the token'
                    },
                    symbol: {
                        type: 'string',
                        description: 'The symbol of the token'
                    },
                    initialSupply: {
                        type: 'string',
                        description: 'Initial supply in natural language (e.g., "one million", "half a billion", "10k", "1.5M tokens"). Interpret the amount and format it into a number amount and then convert it into wei. Defaults to 1 billion tokens if not specified.',
                    }
                },
                required: ['name', 'symbol']
            }
        }
    },
    handler: async (args: { name: string, symbol: string, initialSupply?: string }) => {
        const baseNumber = parseFloat(args.initialSupply || '1000000000'); // 1 billion default

        const publicClient = createViemPublicClient();
        const walletClient = createViemWalletClient();

        const hash = await walletClient.deployContract({
            account: walletClient.account,
            abi: ERC20_ABI,
            bytecode: ERC20_BYTECODE,
            args: [args.name, args.symbol, baseNumber]
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        console.log(`Contract deployed at address: ${receipt.contractAddress}`);

        return `${args.name} (${args.symbol}) token deployed successfully at: ${receipt.contractAddress}`;
    }
};
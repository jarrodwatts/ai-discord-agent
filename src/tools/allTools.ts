import { deployErc20Tool } from "./deployErc20.js";
import { getBalanceTool } from "./getBalance.js";
import { getWalletAddressTool } from "./getWalletAddress.js";

export interface ToolConfig<T = any> {
    definition: {
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: {
                type: 'object';
                properties: Record<string, unknown>;
                required: string[];
            };
        };
    };
    handler: (args: T) => Promise<any>;
}

export const tools: Record<string, ToolConfig> = {
    get_balance: getBalanceTool,
    get_wallet_address: getWalletAddressTool,
    deploy_erc20_token: deployErc20Tool
};

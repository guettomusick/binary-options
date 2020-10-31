import { drizzleReactHooks } from '@drizzle/react-plugin'

export const useAccount = () => drizzleReactHooks
  .useDrizzleState(({ accounts }) => ({ accounts }))
  .accounts[0];
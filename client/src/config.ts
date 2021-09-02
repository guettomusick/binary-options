export type PriceFeed = {
  router: string,
  eth?: string,
  dai?: string,
}

type PriceFeeds = {
  [key: string]: PriceFeed,
}

export const priceFeeds: PriceFeeds = {
  '1': {
    router: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    eth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    dai: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  },
  '4': {
    router: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  },
  '42': {
    router: '0x9326BFA02ADD2366b30bacB125260Af641031331',
  },
  "137": {
    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    eth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    dai: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  },
  default: {
    // TODO: Invalid, just for deploying ok
    router: '0x9326BFA02ADD2366b30bacB125260Af641031331',
  }
};
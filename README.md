[![npm scoped](https://img.shields.io/npm/v/@haloplatform/vuex-web3-sync.svg?style=for-the-badge)](https://www.npmjs.com/package/@haloplatform/vuex-web3-sync)

# vuex-web3-sync

Vuex module to sync with web3

## install:

```shell
npm i @haloplatform/vuex-web3-sync --save
```

## Usage:

requires Babel-Polyfill if you don't have it install it via: https://babeljs.io/docs/usage/polyfill

```js
import store from './vuex/store'
import web3Sync from '@haloplatform/vuex-web3-sync'

web3Sync(store, 'webThree')
// second parameter is module name, optional
```

## Exposed Getters:

* `address` - need description
* `coinbase` - `String` ETH Address Hex
* `instance` - `Function<Web3>` Function that returns web3 instance
* `isInjected` - `Boolean` True if web3 is injected
* `networkId` - `String` Network ID
* `isLocal` - `Boolean` True if web3 instance is connected to local node
* `balance` - `String` Wallet balance
* `isApprovedNetwork` - `Boolean` True if network is approved
* `networkName` - `String` Network Name
* `filter` - same as `web3.eth.filter`
* `reset` - same as `web3.reset`
* `sha3` - same as `web3.sha3`
* `contract` - same as `web3.eth.contract`
* `isConnected` - same as `web3.isConnected`

[![npm scoped](https://img.shields.io/npm/v/@haloplatform/vuex-web3-sync.svg?style=for-the-badge)](https://www.npmjs.com/package/@haloplatform/vuex-web3-sync)

# vuex-web3-sync

Vuex module to sync with web3

## install:

```shell
npm i @haloplatform/vuex-web3-sync --save
```

## Usage:

```js
import store from './vuex/store'
import web3Sync from 'vuex-web3-sync'

web3Sync(store, 'webThree')
// second parameter is module name, optional
```

## Exposed Getters:

* `address` - need description
* `coinbase` - need description
* `instance` - need description
* `isInjected` - need description
* `networkId` - need description
* `isLocal` - need description
* `balance` - need description
* `isApprovedNetwork` - need description

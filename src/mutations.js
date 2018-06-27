export default {
  setInjected(state, payload) {
    state.web3.isInjected = payload
  },
  setInstance(state, payload) {
    state.web3.instance = payload
  },
  setLocal(state, payload) {
    state.web3.isLocal = payload
  },
  setNetworkId(state, payload) {
    state.web3.networkId = payload
  },
  setCoinbase(state, payload) {
    state.web3.coinbase = payload
  },
  setAddress(state, payload) {
    state.web3.address = payload
  },
  setBalance(state, payload) {
    state.web3.balance = payload
  },
  setUnlock(state, payload) {
    state.web3.isUnlocked = payload
  },
  setConnected(state, payload) {
    state.web3.isConnected = payload
  },
}

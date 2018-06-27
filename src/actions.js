import Web3 from 'web3'
import { Provider, Accounts } from '@haloplatform/halo.js'

const accounts = new Accounts()
const sleep = (ms = 1000) => new Promise((resolve, reject) => setTimeout(resolve, ms))

export default {
  connectToWeb3: ({ commit }) =>
    new Promise((resolve, reject) => {
      const web3 = new Web3(new Provider())
      commit('setInjected', web3.isConnected())
      commit('setInstance', () => web3)
      commit('setLocal', false)
      resolve(web3)
    }),
  getBlockchainNetworkId: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance().version.getNetwork((err, networkId) => {
        if (err) {
          reject(err)
        } else {
          commit('setNetworkId', networkId)
          resolve(networkId)
        }
      })
    }),
  getCoinbase: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      state.web3.instance().eth.getCoinbase((err, coinbase) => {
        if (err) {
          if (state.web3.address) {
            commit('setCoinbase', state.web3.address)
            resolve(state.web3.address)
          }
          reject(err)
        } else {
          if (state.coinbase !== coinbase) commit('setCoinbase', coinbase || state.web3.address)
          resolve(coinbase)
        }
      })
    }),
  getBalance: ({ commit, state }) =>
    new Promise((resolve, reject) => {
      const coinbase = state.web3.coinbase
      if (!coinbase) {
        return resolve('0')
      }
      state.web3.instance().eth.getBalance(state.web3.coinbase, (err, result) => {
        if (err) {
          reject(err)
        } else {
          const balance = state.web3.instance().fromWei(result.toString(10), 'ether')
          if (state.balance !== balance) commit('setBalance', balance)
          resolve(balance)
        }
      })
    }),
  async checkUnlock({ state }) {
    const unlocked = await accounts.unlockedAccounts()

    return unlocked.includes(state.web3.coinbase)
  },
  async monitorWeb3({ state, dispatch, commit }) {
    // if (state.web3.isLocal || !state.web3.instance()) {
    //   return
    // }
    while (true) {
      await sleep(1000)
      // refresh coinbase
      try {
        commit('setAddress', await dispatch('getCoinbase'))
      } catch (err) {
        console.log('get coinbase error:', err)
      }
      try {
        await dispatch('getBalance')
      } catch (err) {
        console.log('get balance error:', err)
      }
      commit('setUnlock', await dispatch('checkUnlock'))
      commit('setConnected', state.web3.instance().isConnected())
    }
  },
  async init({ dispatch, commit, state }) {
    await dispatch('connectToWeb3')
    await dispatch('getBlockchainNetworkId')
    try {
      commit('setAddress', await dispatch('getCoinbase'))
    } catch (err) {
      console.log('get coinbase error:', err)
    }
    try {
      await dispatch('getBalance')
    } catch (err) {
      console.log('get balance error:', err)
    }
    commit('setUnlock', await dispatch('checkUnlock'))
    commit('setConnected', state.web3.instance().isConnected())
    dispatch('monitorWeb3')
  },
}

const moment = require('moment')
const client = require('./plaidClient')

exports.fetchTransactions = async function(startDate, endDate) {
    const transactionFetchOptions = [
      startDate,
      endDate,
      {
        count: 250,
        offset: 0
      }
    ]

    const plaidAccountTokens = Object.keys(process.env)
      .filter(key => key.startsWith(`PLAID_TOKEN`))
      .map(key => ({
        account: key.replace(/^PLAID_TOKEN_/, ''),
        token: process.env[key]
      }))

  const rawTransactions = await Promise.all(plaidAccountTokens.map(({ account, token }) => {
    return client.getTransactions(token, ...transactionFetchOptions)
      .then(({ transactions }) => ({
        account,
        transactions
      })).catch((e) => {console.log(e)})
  }))

  // concat all transactions
  return rawTransactions.reduce((all, { account, transactions }) => {
    return all.concat(transactions.map(({ name, account_id, date, amount, category, pending }) => ({
      account,
      name,
      account_id,
      date,
      amount: -amount,
      category,
      pending,
    })))
  }, [])
}

require('dotenv').config()

const { getDates } = require('./lib/dateRange')
const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet } = require('./lib/update')

;(async () => {
  const dates = await getDates()
  const transactions = await fetchTransactions(dates[0], dates[1])
  const updates = transformTransactionsToUpdates(transactions)
  updateSheet(updates)
})()

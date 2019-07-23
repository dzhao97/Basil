require('dotenv').config()

const { getDates } = require('./lib/dateRange')
const { fetchTransactions } = require('./lib/fetch')
const { transformTransactionsToUpdates } = require('./lib/transform')
const { updateSheet } = require('./lib/update')

;(async () => {
  const dates = await getDates()
  const transactions = await fetchTransactions(dates[0], dates[1])
  const updates_bound = transformTransactionsToUpdates(transactions)
  updateSheet(updates_bound[0], updates_bound[1])
})()

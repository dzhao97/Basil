require('dotenv').config()

const path = require('path')
const { writeFile } = require('fs-extra')
const { getDates } = require('../lib/dateRange')
const { fetchTransactions } = require('../lib/fetch')

;(async () => {
  const dates = await getDates()
  const res = await fetchTransactions(dates[0], dates[1])
  console.log('Transactions fetch successful!')
  console.log(res)
})()

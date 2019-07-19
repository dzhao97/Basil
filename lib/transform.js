require('dotenv').config();
const moment = require('moment')

var id_dict = {
    [process.env.ID_checking]: "Checking",
    [process.env.ID_boacard]: "BoA Card",
    [process.env.ID_ubercard]: "Uber Card"
};

exports.transformTransactionsToUpdates = function(transactions) {
  /**
   * Implement your custom logic of transforming transactions into
   * Google Sheet cell updates.
   *
   * Transactions come in the format of:
   * {
   *   account: 'paypal',
   *   name: 'Payment from XXX',
   *   date: 2019-xx-xx,
   *   amount: 123
   * }
   *
   * Updates should be in the form of:
   * {
   *   range: 'A1:B2',
   *   values: [[1,2],[3,4]]
   * }
   *
   * Example: Put each transaction on a line in the spreadsheet.
   * const updates = transactions.map(function(transaction, i) {
   *   return {
   *     range: `A${i + 1}:D${i + 1}`,
   *     values: [Object.values(transaction)]
   *   }
   * });
   *
   */

  // See example in comment above.
  const updates = transactions.map(function(transaction, i) {
    return {
      range: `A${i + 2}:G${i + 2}`,
      values: [[id_dict[transaction.account_id], transaction.name,
          transaction.date, transaction.amount, transaction.category[0],
          transaction.category[1], transaction.category[2]]]
    }
  });

  updates.push({
      range: `A1:G1`,
      values: [['Source', 'Name', 'Date', 'Amount',
          'Category 1', 'Category 2', 'Category 3']]
  })

  console.log('DEBUG: updates to be made:')
  console.log(updates)

  return updates
}

require('dotenv').config();
const moment = require('moment')
var _ = require('underscore');

var id_dict = {
    [process.env.ID_checking]: "Checking",
    [process.env.ID_boacard]: "BoA Card",
    [process.env.ID_ubercard]: "Uber Card"
};

// sort transaction objects
function compare( a, b ) {
    if ( a.date < b.date){
      return -1;
    }
    if ( a.date > b.date ){
      return 1;
    }
      return 0;
}

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

    // sort by date
    transactions.sort(compare)
    // filter to only Venmo and Zelle from checking
    transactions = _.reject(transactions, function(el){return (id_dict[el.account_id] === 'Checking' &&
            (!(el.name.includes('Venmo')) && !(el.name.includes('Zelle')))); })

    const updates = transactions.map(function(transaction, i) {
    return {
      range: `B${i + 2}:H${i + 2}`,
      values: [[id_dict[transaction.account_id], transaction.name,
          transaction.date, transaction.amount, transaction.category[0],
          transaction.category[1], transaction.category[2]]]
    }
  });

  updates.push({
      range: `B1:H1`,
      values: [['Source', 'Name', 'Date', 'Amount',
          'Category 1', 'Category 2', 'Category 3']]
  })

  console.log('DEBUG: updates to be made:')
  console.log(updates)

  return updates
}

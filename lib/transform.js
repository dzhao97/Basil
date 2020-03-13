require('dotenv').config();
const moment = require('moment')
var _ = require('underscore');

var id_dict = {
    [process.env.ID_checking]: "Checking",
    [process.env.ID_boatravelrewards]: "BoA Travel Rewards",
    [process.env.ID_ubercard]: "Uber Card",
    [process.env.ID_boacashrewards]: "BoA Cash Rewards",
};

// sort transaction objects by date
function compare_date( a, b ) {
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
    transactions.sort(compare_date)
    // filter to only Venmo, Zelle, Abacus, and withdrawals from checking
    transactions = _.reject(transactions, function(el){
        return (id_dict[el.account_id] === 'Checking'
            && (!(el.name.includes('Venmo'))
                && !(el.name.includes('Zelle'))
                && !(el.name.includes('ABACUS LABS'))
                && !(el.name.includes('WITHDRWL'))
            )
        );
    })
    // filter BoA card payments
    transactions = _.reject(transactions, function(el){return (id_dict[el.account_id] === 'BoA Card' &&
            el.name === 'PAYMENT - THANK YOU'); })
    // filter Uber card payments
    transactions = _.reject(transactions, function(el){return (id_dict[el.account_id] === 'Uber Card' &&
            el.name === 'Payment Received'); })

    // filter pending transactions
    const updates = transactions.filter(({pending}) => !pending).map(function(transaction, i) {
    // add transactions (sometimes no categories are attached)
        if (!transaction.category){
            transaction.category = [null, null]
        }
    return {
      range: `B${i + 2}:G${i + 2}`,
      values: [[(id_dict.hasOwnProperty(transaction.account_id) ?
          id_dict[transaction.account_id] : transaction.account_id),
          transaction.name, transaction.date, transaction.amount,
          transaction.category[0], transaction.category[1]]]
    }
  });

  // total constants
  const n_updates = updates.length
  const total_loc = n_updates + 2

  // category 1 constants
  var cat1_list = updates.map((el) => (el.values[0][4]))
  unique_cat1 = [...new Set(cat1_list)]
  const cat1_nrow = unique_cat1.length
  const cat1_head = total_loc + 2

  // category 2 constants
  var cat2_list = updates.map((el) => (el.values[0][5]))
  unique_cat2 = [...new Set(cat2_list)]
  const cat2_nrow = unique_cat2.length
  const cat2_head = cat1_head + cat1_nrow + 1

  // add total price cell w/default to 0
  if (n_updates > 0) {
    updates.push({
      range: `E${total_loc}`,
      values: [[`=SUM(E2:E${n_updates + 1})`]]
    });
  } else {
    updates.push({
      range: `E${total_loc}`,
      values: [['0']]
    });
  }

  // category 1 summary table
  if (n_updates > 0) {
    updates.push({
      range: `A${cat1_head}`,
      values: [[`=UNIQUE(F2:F${total_loc - 1})`]]
    });
    for (i = 0; i < cat1_nrow; i++) {
      updates.push({
        range: `B${cat1_head + i}:C${cat1_head + i}`,
        values: [[`=SUMIF(F$2:F$${n_updates + 1}, A${cat1_head + i}, E$2:E$${n_updates + 1})`
            , `=B${cat1_head + i}/$E$${total_loc}`]]
      })
    }
  }

  // category 2 summary table
  if (n_updates > 0) {
    updates.push({
      range: `E${cat1_head}`,
      values: [[`=UNIQUE(G2:G${total_loc - 1})`]]
    });
    for (i = 0; i < cat2_nrow; i++) {
      updates.push({
        range: `F${cat1_head + i}:G${cat1_head + i}`,
        values: [[`=SUMIF(G$2:G$${n_updates + 1}, E${cat1_head + i}, E$2:E$${n_updates + 1})`
            , `=F${cat1_head + i}/$E$${total_loc}`]]
      })
    }
  }

  // header line
  updates.push({
      range: `B1:G1`,
      values: [['Source', 'Name', 'Date', 'Amount',
          'Category 1', 'Category 2']]
  })

  console.log('DEBUG: updates to be made:')
  console.log(updates)

  return [updates, cat1_head]
}

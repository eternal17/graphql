let userInfoDiv = document.getElementById("user-info")

async function getApiData(graphqlQuery) {
  const response = await fetch('https://learn.01founders.co/api/graphql-engine/v1/graphql', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: graphqlQuery
    })
  })
  return response.json()
}

// holds all of the xp transactions
const arrayOfTransactionObjs = []
// for getting xp points from div01
getApiData(`{
  user(where: {login: {_eq: "eternal17"}}) {
    login
    id
    transactions(
      where: {_or: [{_and: [{amount: {_gt: 4999}}, {type: {_eq: "xp"}}, {object: {type: {_eq: "project"}}}]}, 
        						{_and: [{path: {_iregex: "check-point"}}, {type: {_eq: "xp"}}]}, 
        						{_and: [{type: {_eq: "xp"}}, {object: {type: {_eq: "piscine"}}}]}]}
      order_by: {createdAt: desc}
    ) {
      amount
      type
      object {
        name
      }
    }
  }
}`)
  .then((data) => {

    // All of the transactions from the query above
    const allTransactions = data.data.user[0].transactions

    // creating new array and adding only project name and xp
    allTransactions.forEach(obj => {
      const objToPush = {}
      objToPush["project"] = obj.object.name
      objToPush["amount"] = obj.amount
      arrayOfTransactionObjs.push(objToPush)
    });

    // removing all duplicates, only keeping highest xp for each project. (Some xp have been added to same project. Could be for bonus points etc. Do not add those.)
    const uniqueTransacations = Object.values(arrayOfTransactionObjs.reduce((acc, obj) => {
      const curr = acc[obj.project];
      acc[obj.project] = curr ? (curr.amount < obj.amount ? obj : curr) : obj;
      return acc;
    }, {}));

    // get all the xp points added up to display final xp figure, in KB. Same as on intra.

    const finalXpAmount = uniqueTransacations.reduce((acc, obj) => {
      return acc + obj.amount / 1000
    }, 0)

    const xpConvertedToKB = Math.round(finalXpAmount)
    // display final xp amount


  })




const scrollableProjects = document.querySelector(".scroll-projects")
const pieWedge = document.querySelector(".pie-wedge")
const pieTextPercent = document.querySelector(".pie-text")
const pieProjectName = document.querySelector(".pie-project-name")
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

// holds all of the xp transactions of div01
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
    const uniqueTransactions = Object.values(arrayOfTransactionObjs.reduce((acc, obj) => {
      const curr = acc[obj.project];
      acc[obj.project] = curr ? (curr.amount < obj.amount ? obj : curr) : obj;
      return acc;
    }, {}));



    // get all the xp points added up to display final xp figure, in KB. Same as on intra.
    const finalXpAmount = uniqueTransactions.reduce((acc, obj) => {
      return acc + obj.amount / 1000
    }, 0)

    const xpConvertedToKB = Math.round(finalXpAmount)


    // display final xp amount
    const displayXpDiv = document.querySelector(".xp-amount")
    console.log(displayXpDiv);
    displayXpDiv.innerHTML = xpConvertedToKB
  })

// xp points from projects only (not including piscine and exercise xp)
const xpFromProjects = []

// for xp points of only projects (no piscine or excercises)

getApiData(`{
  user(where:  {login: {_eq: "eternal17"}}) {
    transactions(
      where: {_and: [{amount: {_gt: 4999}}, {type: {_eq: "xp"}}, {object: {type: {_eq: "project"}}}]}
      order_by: {createdAt: desc}
    ) {
      amount
      type
      createdAt
      object {
        name
        type
      }
    }
  }
}`).then((data) => {

  const projectTransactions = data.data.user[0].transactions
  console.log(projectTransactions)

  // put into object and take out all the duplicates
  projectTransactions.forEach((transaction) => {
    const objToPush = {}
    objToPush["project"] = transaction.object.name
    objToPush["amount"] = transaction.amount
    xpFromProjects.push(objToPush)
  })

  // removing all duplicates, only keeping highest xp for each project. (Some xp have been added to same project. Could be for bonus points etc. Do not add those.)
  const uniqueTransactions = Object.values(xpFromProjects.reduce((acc, obj) => {
    const curr = acc[obj.project];
    acc[obj.project] = curr ? (curr.amount < obj.amount ? obj : curr) : obj;
    return acc;
  }, {}));

  // get total amount of xp
  const finalXpAmount = uniqueTransactions.reduce((acc, obj) => {
    return acc + obj.amount
  }, 0)

  console.log(finalXpAmount, "xp without pis");

  // find out percentage of each project, add to uniquetransactions object
  uniqueTransactions.forEach((transaction) => {
    transaction["percentage"] = ((transaction.amount / finalXpAmount) * 100).toFixed(1)

    // add div for each project into scrollable div
    const projectdiv = document.createElement("div")
    projectdiv.classList.add("each-project")
    projectdiv.innerHTML = transaction.project
    projectdiv.id = transaction.percentage
    scrollableProjects.appendChild(projectdiv)


    // onclick change percentage to currently clicked
    projectdiv.onclick = (e) => {
      pieWedge.style.strokeDasharray = `calc(${e.target.id} * 31.42/100) 31.42`
      pieTextPercent.innerHTML = `${e.target.id}%`
      pieProjectName.innerHTML = transaction.project

    }
  })

})

// console.log(xpFromProjects, "xp from projects");
// const idOne = document.querySelector("#one")
// let pieWedge = document.querySelector(".pie-wedge")
// idOne.onclick = () => {
//   pieWedge.style.strokeDasharray = "calc(50 * 31.42/100) 31.42"
// }

// get only projects and find out percentages of each project compared to overall xpAmount

const scrollableProjects = document.querySelector(".scroll-projects")
const pieWedge = document.querySelector(".pie-wedge")
const pieTextPercent = document.querySelector(".pie-text")
const pieProjectName = document.querySelector(".pie-project-name")
const introSpan = document.querySelector(".intro-span")
const barChart = document.querySelector(".bar-chart")
const gradeSection = document.querySelector("#grade-section")
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

    // add the username, id to the profile section 
    const username = data.data.user[0].login
    const userId = data.data.user[0].id
    const introParagragh = document.createElement("p")
    introParagragh.innerHTML = `Hello. My name is Sarmad Khatri AKA <span style="color: #3CB043">${username}(${userId})</span>. Check out some of stats during my
    time at 01Founders.`
    introSpan.appendChild(introParagragh)

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

    displayXpDiv.innerHTML = xpConvertedToKB
  })

// xp points from projects only (not including piscine and exercise xp)
const xpFromProjects = []


// for xp points of only projects (no piscine or excercises). Query used for the pie chart
getApiData(`{
  user(where:  {login: {_eq: "eternal17"}}) {
    transactions(
      where: {_and: [{amount: {_gt: 4999}}, {type: {_eq: "xp"}}, {object: {type: {_eq: "project"}}}]}
      order_by: {createdAt: asc}
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

// query for bar chart data - getting the days between project start and end 

getApiData(`{
  user(where: {login: {_eq: "eternal17"}}) {
    progresses(
      where: {_and: [{object: {type: {_eq: "project"}}}, {isDone: {_eq: true}}]}
    order_by: {createdAt: desc}) {
      object {
        name
      }
      createdAt
      updatedAt
      grade
    }
  }
}`).then((data) => {
  const projectStartAndEndDates = data.data.user[0].progresses

  const daysBetweenEachProject = []

  // calculate days between each project and push into array
  projectStartAndEndDates.forEach((proj) => {
    // get the difference between create and update in days
    const projectStartDate = new Date(proj.createdAt)
    const projectEndDate = new Date(proj.updatedAt)
    const objToPush = {}
    objToPush["project"] = proj.object.name
    objToPush["days"] = Math.ceil((projectEndDate - projectStartDate) / (1000 * 3600 * 24))
    objToPush["grade"] = (proj.grade).toFixed(2)
    daysBetweenEachProject.push(objToPush)
  })


  // bar width for 1 day
  const baseBarWidth = 5

  // positioning each bar
  let rectY = 0

  // positioning text for each bar
  let textY = 13

  // populate the svg with bars and text from queried data.
  daysBetweenEachProject.forEach((proj) => {
    populateGrades(proj)
    const nameSpace = "http://www.w3.org/2000/svg"
    const bar = document.createElementNS(nameSpace, "g")
    bar.classList.add("bar")
    let rect = document.createElementNS(nameSpace, "rect")
    rect.setAttribute("width", `${proj.days * baseBarWidth}`)
    rect.setAttribute("y", `${rectY}`)
    rectY += 30
    bar.appendChild(rect)
    const text = document.createElementNS(nameSpace, "text")
    text.classList.add("bar-chart-text")
    text.setAttribute("y", `${textY}`)
    text.setAttribute("x", `2`)
    textY += 30
    text.innerHTML = `${proj.project} - ${proj.days} days`
    bar.appendChild(text)
    barChart.appendChild(bar)
  })
})

// populates the grade section with project names and grades
function populateGrades(obj) {
  const eachProjGradeDiv = document.createElement("div")
  eachProjGradeDiv.classList.add("each-proj-grade")
  const projectName = document.createElement("div")
  projectName.innerHTML = obj.project
  const grade = document.createElement("div")
  grade.classList.add("grade")
  grade.innerHTML = obj.grade
  eachProjGradeDiv.appendChild(projectName)
  eachProjGradeDiv.appendChild(grade)
  gradeSection.appendChild(eachProjGradeDiv)
}
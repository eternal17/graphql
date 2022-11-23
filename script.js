

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

getApiData(`query {
  user (where: {id: {_eq: 171}}) {
    login
  }
}`)
  .then((data) => {
    // username
    console.log(data.data.user[0].login);
  })


  // `    query {
  //   transaction (  where: {
  //     _and: [{ type: { _eq: "xp" } }, { userId: { _eq: 171 } }]
  //   }) {
  //     userId
  //     amount
  //     type
  //     createdAt
  //   }
  // }`
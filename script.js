

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

getApiData(`    query {
    transaction (  where: {
      _and: [{ type: { _eq: "xp" } }, { userId: { _eq: 171 } }]
    }) {
      userId
      amount
      type
      createdAt
    }
  }`)
  .then((data) => {
    console.log(data);
  })
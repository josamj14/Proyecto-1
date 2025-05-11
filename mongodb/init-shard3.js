rs.initiate({
  _id: 'mongors3',
  members: [
    { _id: 0, host: 'mongors3n1' },
    { _id: 1, host: 'mongors3n2' },
    { _id: 2, host: 'mongors3n3' }
  ]
})
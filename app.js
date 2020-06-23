const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const dotenv = require("dotenv");
dotenv.config();

const { pocketVariables } = require('./helpers/pocketVars');

const mongoose = require('mongoose');
const mongodb = require('mongodb');
const isAuth = require('./middleware/is-auth');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const https = require("https");
const io = require('socket.io')(server);
var cron = require('node-cron');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// if (process.env.APP_SECRET) {
//   console.log('...env vars present...');
// } else {
//   console.log('...env vars absent...');
// }

// cron.schedule('*/5 * * * * *', () => {
//   let cronExp = 'every 5 seconds..';
//   graphQlResolvers.cronTest(cronExp);
// });
// cron.schedule(' */1 * * * *', () => {
//   let cronExp = 'every 1 Minute...'
//   graphQlResolvers.cronTest(cronExp);
// });
// cron.schedule('21 13 15 6 1', () => {
//   let cronExp = 'Monday 15/06, 13:21...'
//   graphQlResolvers.cronTest(cronExp);
// },
// {
//    scheduled: true,
//    timezone: "America/Bogota"
//  });


app.use(isAuth);

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

// mongoose.connect(`mongodb+srv://${process.env.ATLAS_A}:${process.env.ATLAS_B}@{process.env.ATLAS_C}/test?retryWrites=true&w=majority`,
mongoose.connect('mongodb://localhost:27017/all_ankara_everything',
{useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log(`
      DB connected... Now Serving Port: ${process.env.PORT}
      `);
    app.listen(process.env.PORT);
  })
  .catch(err => {
    console.log(err);
});


let connectedClients = [];

io.on('connection', (socket) => {

    // socket.on('unauthorizedClientConnect', function(data) {
    //   console.log("a wild client appeared...socket..",socket.id);
    //   // connectedClients.push({socket: socket.id, user: 'wild'});
    //   // console.log('connectedClients',connectedClients);
    // });
    // socket.on('msg_subscribe', function(data) {
    //     console.log('a domestic client appeared...socket...'+socket.id+'...user...'+data.user);
    //     console.log('joining room', data.room);
    //     socket.join(data.room);
    //     connectedClients.push({socket: socket.id, user: data.user})
    //     console.log('connectedClients',connectedClients);
    //     userOnline(data.user);
    // });
    // socket.on('send message', function(data) {
    //   console.log('sending room post', data.room);
    //   socket.broadcast.to(data.room).emit('conversation private post', {
    //       message: data.message
    //   });
    //   socket.emit("MESSAGE_SENT", {msg: "message sent!!"});
    //   console.log('sender confirmation sent');
    // });
    // socket.on('disconnect', function(){
    //   let clientToRemove = connectedClients.find(x => x.socket === socket.id);
    //   if (clientToRemove === undefined) {
    //     console.log('a wild client disappeared', socket.id);
    //   } else {
    //     console.log('a domestic client disappeared...',clientToRemove);
    //     let connectedClientsUpdate = connectedClients.filter(x => x.socket !== socket.id)
    //     connectedClients = connectedClientsUpdate;
    //     console.log('connectedClients', connectedClients);
    //     userOffline(clientToRemove.user);
    //   }
    // })

});

io.on('disconnect', (socket) => {
  console.log("a wild client disappeared..");
});
server.listen(process.env.SOCKET_PORT, function (err) {
  if (err) throw err
  console.log(`
    socket.io listening on port ${process.env.SOCKET_PORT}
    `)
})


app.use(
  express.static(path.join(__dirname, "./frontend/build"))
);
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

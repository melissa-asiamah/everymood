module.exports = function (app, passport, db) {

  ObjectID = require('mongodb').ObjectID;
  var AssistantV2 = require('ibm-watson/assistant/v2')

  console.log("creating assistant");
  var assistant = new AssistantV2({
    // iam_apikey: "qz_ygf0wJ32sUwLCZ6oWpc_eZ197bZMESzIgmU5lSwzd",
    // assistant_id: "9d52cb15-fc97-4686-b091-b83e0fbd539c",
    // url: "https://gateway.watsonplatform.net/assistant/api",
    version: '2019-02-28'
  });

  console.log("done creating assistant");

  //routes for homepage and chat

  app.get('/', function (req, res) {
    res.render('index.ejs');
  });


  app.get('/profile', function (req, res) {
    res.render('chat.ejs');
  });


  app.get('/chat-history', isLoggedIn, function (req, res) {
    db.collection('chats').find({ user_id: ObjectID(req.user._id) }).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('chat-history.ejs', {
        user: req.user,
        chats: result
      })
    })
  });

  app.get('/chatlog/:chat_id', function (req, res) {
    db.collection('chats').findOne({ _id: ObjectID(req.params.chat_id)}, (err, result) => {
      if (err) return console.log(err)
      res.render('chat-logs.ejs', {
        user: req.user,
        chat: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // chat routes ===============================================================


  app.post('/api/message', function (req, res) {

    //push and save (UpdateOne)
    console.log(req.body, req.body.session_id);
    var assistantId = process.env.ASSISTANT_ID || '<assistant-id>';
    if (!assistantId || assistantId === '<assistant-id>') {
      return res.json({
        'output': {
          'text': 'The app has not been configured with a <b>ASSISTANT_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/assistant-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
        }
      });

    }

    var textIn = '';

    if (req.body.input) {
      textIn = req.body.input.text;
    }
    console.log("Message from client", req.body.input.text);

    var payload = {
      assistant_id: assistantId,
      session_id: req.body.session_id,
      input: {
        // message_type : 'text',
        text: textIn
      }
    };
    console.log("Payload:", payload)
    // Send the input to the assistant service
    assistant.message(payload, function (err, data) {
      if (err) {
        console.log("error:", err);
        const status = (err.code !== undefined && err.code > 0) ? err.code : 500;
        return res.status(status).json(err);
      }
      console.log("response from watson", data)
      db.collection('chats').findOne({ session_id: req.body.session_id }, (err, result) => {
        console.log("Looking for chat", req.session_id, result)
        console.log("Adding user message", textIn)
        result.messages.push({
          source: "user",
          message: textIn
        })
        if(data.output.generic.length > 0) {
        result.messages.push({
          source: "watson",
          message: data.output.generic[0].text
        })
      } else {
        result.messages.push({
          source: "watson",
          message: "Watson fell asleep!"
        })
      }
        db.collection('chats').updateOne({
          _id: ObjectID(result._id),

        },
          {
            $set: { messages: result.messages },
          }, function (err, result) {
            if (err) throw err;
          }
        )
      })
      return res.json(data);
    });
  });

  app.get('/api/session', function (req, res) {
    //create a new conversation in mongoDB (date, time it starts)
    //will have the ObjectId of the user who is logged in <--req.user._id (will get ID of current user)
    //will have the conversation name (date and time it starts)
    //array of messages
    //need session_id!
    //db.collection('conversations').insert(response.session_id)
    assistant.createSession({
      assistant_id: process.env.ASSISTANT_ID || '{assistant_id}',
    }, function (error, response) {
      console.log("session response:", response, error);
      if (error) {
        return res.send(error);
      } else {
        const currentDate = new Date();
        db.collection("chats").insertOne({
          user_id: req.user._id,
          session_id: response.session_id,
          chatName: "Chat started on" + currentDate.toString(),
          messages: []
        })
        return res.send(response);
      }
    });
  });

  app.delete('/deleteChat', (req, res) => {
    db.collection('chats').findOneAndDelete({_id: ObjectID(req.body.chat_id)}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

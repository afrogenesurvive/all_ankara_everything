const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { pocketVariables } = require('../../helpers/pocketVars');

module.exports = {
  login: async ({ email, password }) => {
    console.log("Resolver: Login...");
    // console.log(email,password);
    const user = await User.findOne({ 'contact.email': email });
    if (!user) {
      // throw new Error('User does not exist!');
      console.log('User does not exist!');
      return{
        activityId: 0,
        role:"",
        token:"",
        tokenExpiration:0 ,
        error: 'User does not exist!'
      }
    }
    // console.log(user._id);
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      // throw new Error('Password is incorrect!');
      return{
        activityId: 0,
        role:"",
        token:"",
        tokenExpiration:0 ,
        error: 'Password is incorrect!'
      }
    }
    // console.log("user.verification",user.verification);
    if (user.verification.verified !== true) {

      console.log('Please  verify user 1st!');
      return{
        activityId:user.id,
        role:"",
        token:"",
        tokenExpiration:0 ,
        error: 'Please  verify user 1st!'}
      // throw new Error('Please  verify user 1st!');
    }
    const token = jwt.sign({ userId: user.id },'CoronaWorkLife',{expiresIn: '4h'});

    const userLoggedIn = await User.findOneAndUpdate({_id: user.id},{loggedIn: true},{new: true, useFindAndModify: false})
    // console.log("userLoggedIn", JSON.stringify(userLoggedIn.loggedIn));
    // pocketVariables.token = token;
    // pocketVariables.userId = user.id;

    return { activityId: userLoggedIn.id, role: userLoggedIn.role, token: token, tokenExpiration: 4 };
  },
  logout: async (args) => {
    console.log("Resolver: Logout...");
    const userLogout = await User.findOneAndUpdate({ _id: args.activityId },{loggedIn: false, clientConnected: false},{new: true, useFindAndModify: false});

    return {
      ...userLogout._doc,
      _id: userLogout.id,
      email: userLogout.contact.email ,
      name: userLogout.name,
    };
  }
};

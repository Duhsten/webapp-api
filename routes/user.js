var express = require('express');
var router = express.Router();
var md5 = require('md5');
var jwt = require('jsonwebtoken');

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "duhsten",
  password: "890708#Keith",
  database: "trikon_games"
});
let regCount = 0;
let logCount = 0;
let rFailCount = 0;
let lFailCount = 0;
let rank = "";
let userRoles = {id: 0, rankname: '', isAdmin: 0, canViewClients: 0};
/* GET users listing. */
router.post('/register', async function (req, res, next) {
  console.log("Registering User");
  try {
    let { username, email, password } = req.body; 
   
    const hashed_password = md5(password.toString())

    const checkUsername = `Select username FROM accounts WHERE username = ?`;
    con.query(checkUsername, [username], (err, result, fields) => {
      if(!result.length){
        const sql = `Insert Into users (username, email, password) VALUES ( ?, ?, ? )`
        con.query(
          sql, [username, email, hashed_password],
        (err, result, fields) =>{
          if(err){
            res.send({ status: 0, data: err });
            statusReport(0,0,1,0);
          }else{
            let token = jwt.sign({ data: result }, 'secret')
            console.log(result);
            res.send({ status: 1, data: result, token : token });
            statusReport(1,0,0,0);
          }
         
        })
      }
    });

    

   
  } catch (error) {
    res.send({ status: 0, error: error });
  }
});

router.post('/login', async function (req, res, next) {
  try {
    let { username, password } = req.body; 
   
    const hashed_password = md5(password.toString())
    const sql = `SELECT * FROM accounts WHERE username = ? AND password = ?`
    con.query(
      sql, [username, hashed_password],
    function(err, result, fields){
      if(err){
        res.send({ status: 0, data: err });
        statusReport(0,0,0,1);
      }else{
        let token = jwt.sign({ data: result }, 'secret')
        res.send({ status: 1, data: result, token: token });
        statusReport(0,1,0,0);
      }
     
    })
  } catch (error) {
    res.send({ status: 0, error: error });
    statusReport(0,0,0,1);
  }
});

router.post('/getRoles', async function (req, res, next) {
  console.log("Registering User: " + req.body["username"]);
  let rid = "";
  try {
    let username  = req.body["username"]; 
    

    const rankID = `Select id, rankid FROM accounts WHERE username = ?`;
    const roles = `Select rankname, isAdmin, canViewClients FROM userrank WHERE id = ?`;
    con.query(rankID, [username], (err, result, fields) => {
    if(result.length > 0) {
      userRoles["id"] =  result[0]["id"];
      rank = result[0]["rankid"];
      console.log("RankID: " + result[0]["rankid"]);
    }
  
    });
    console.log("RankID2: " + rank);
    con.query(roles, [rank], (err, result2, fields) => {
      if(result2.length > 0)
      {
        userRoles["rankname"] = result2[0]["rankname"]
        userRoles["isAdmin"] = result2[0]["isAdmin"]
        userRoles["canViewClients"] = result2[0]["canViewClients"]
        console.log("isAdmin: " + result2[0]["isAdmin"]);
        console.log(userRoles);
        return res.send({ status: 1, roles: userRoles});
      }
      else
      {
        console.log("No");
      }
      
    });
    
    
   
  } catch (error) {
    console.log("Error: " + error);
    res.send({ status: 0, error: error });
  }
});

function statusReport(reg, log, rFail, lFail) {
regCount = regCount + reg;
logCount = logCount + log;
rFailCount = rFailCount + rFail;
lFailCount = lFailCount + lFail;
const d = new Date();
let time = d.getTime();
console.clear();
console.log("Service Panel Auth Server");
console.log("");
console.log("Register Requests: " + regCount + " Login Requests: " + logCount + " Register Failures: " + rFailCount + " Login Failures:" + lFailCount);
console.log("Last Request: " + time);
}

module.exports = router;
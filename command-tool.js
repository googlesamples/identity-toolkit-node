/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs');
var GitkitClient = require('gitkitclient');
var gitkitClient = new GitkitClient(JSON.parse(fs.readFileSync('./gitkit-server-config.json')));

var args = process.argv.slice(2);
var cmd = args[0];

if (cmd === 'get') {
  if (args[1] === '-e') {
    getAccountByEmail(args[2]);
  } else if (args[1] === '-l') {
    getAccountById(args[2]);
  } else {
    showHelp();
  }
} else if (cmd === 'download') {
  downloadAccount();
} else if (cmd === 'upload') {
  uploadSampleAccounts();
} else if (cmd === 'delete') {
  if (args[1] === '-l') {
    deleteAccount(args[2]);
  } else {
    showHelp();
  }
} else {
  showHelp();
}

function showHelp() {
  console.log('\nUsage: node command-tool.js <command> <options> ...');
  console.log('\nAvailable commands:\n');
  console.log('  get [-e <email>|-l <localId>]\t\tGet account information.');
  console.log('  download\t\t\t\tDownload all accounts information from Identity Toolkit.');
  console.log('  upload\t\t\t\tBatch upload sample accounts.');
  console.log('  delete -l <localId>\t\t\tDelete an account.');
}

// Get account information by email
function getAccountByEmail(email) {
  gitkitClient.getAccountByEmail(email, function(err, resp) {
    console.log('getAccountByEmail resp: ' + JSON.stringify(resp) + ' / ' + JSON.stringify(err));
  });
}

// Get account info by user's local id
function getAccountById(localId) {
  gitkitClient.getAccountById(localId, function(err, resp) {
    console.log('getAccountById resp: ' + JSON.stringify(resp) + ' / ' + JSON.stringify(err));
  });
}

// Download all accounts info from Gitkit
function downloadAccount() {
  gitkitClient.downloadAccount(2, function(err, accounts){
    if (err) {
      console.log("error: " + err);
    } else {
      if (accounts != null) {
        console.log(JSON.stringify(accounts));
      } else {
        console.log("finished");
      }
    }
  });
}

// Batch upload existing accounts
function uploadSampleAccounts() {
  var hashKey = new Buffer("key123");
  var hashOptions = {
    'hashAlgorithm': 'HMAC_SHA1',
    'hashKey': hashKey
  };
  var users = createNewUsers(hashKey);
  gitkitClient.uploadAccount(users, hashOptions, function (err, resp){
    if (err) {
      console.log("error: " + JSON.stringify(err));
    } else {
      console.log("account uploaded: " + JSON.stringify(users) + "\n" + JSON.stringify(resp));
    }
  });

  function createNewUsers(hashKey) {
    var crypto = require('crypto');
    var user1 = {
      localId: '1234nodejs',
      email: '1234node@example.com',
      salt: new Buffer('salt-1'),
      passwordHash: crypto.createHmac('SHA1', hashKey).update('1111' + 'salt-1').digest()
    };
    var user2 = {
      localId: '5678nodejs',
      email: '5678node@example.com',
      salt: new Buffer('salt-2'),
      passwordHash: crypto.createHmac('SHA1', hashKey).update('2222' + 'salt-2').digest()
    };
    return [user1, user2];
  }
}

// Delete an account
function deleteAccount(localId) {
  gitkitClient.deleteAccount(localId, function(err, response){
    if (err) {
      console.log("error: " + JSON.stringify(err));
    } else {
      console.log(JSON.stringify(response));
    }
  });
}

var fs = require("fs");

let nameMap = new Map();

let data = JSON.parse(fs.readFileSync("./src/frontend/teamline-data-min.json"));

// pass over name 3 times.
// each time, pick random location in string and assign random lowercase letter
function obfuscateUsername(name) {
  let n = name.split("");
  for (var i = 0; i < 3; i++) {
    var pos = Math.floor(Math.random() * (name.length - 1));
    n[pos] = String.fromCharCode(Math.floor(Math.random() * (122 - 97)) + 97);
  }
  return n.join("");
}

// build the name map (ignore the gross inefficiency here...)
Object.keys(data.teams).forEach((team) => {
  Object.keys(data.teams[team]).forEach((del) => {
    Object.keys(data.teams[team][del].users).forEach((user) => {
      nameMap.set(user, obfuscateUsername(user));
    });
  });
});


// Change the original username to the obfuscated username
// Since we used a map, a unique username maps to a unique obfuscated username
let strData = JSON.stringify(data);
nameMap.forEach((value, key) => {
  console.log(`Replacing ${key} with ${value}.`);
  // strData = strData.replace(/hlee2052/g, "XXXXX");
  strData = strData.replace(new RegExp(key, "g"), value);
});

fs.writeFileSync("./temp.json", strData);

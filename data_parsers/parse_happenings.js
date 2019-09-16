// parse_happenings.js
const fs = require('fs');

// load happenings.txt
fs.readFile('../happenings.txt', 'utf8', (err, data) => {
  if (err) throw err;
  list = data.split('\n');
  happenings = [];
  for (let i = 0; i < list.length; i++) {
    list_data = list[i].split('\t');
    happening = {};
    if (list_data.length == 3) {
      ds = list_data[2].split('.'); // ds = date string
      happening = { name: list_data[0], dayname: list_data[1], date: new Date(ds[2], ds[1], ds[0]) };
    } else if (list_data.length == 4) {
      ds = list_data[3].split('.'); // ds = date string
      happening = { country: list_data[0], name: list_data[1], dayname: list_data[2], date: new Date(ds[2], ds[1], ds[0]) };
    } else if (list_data.length > 4 || list_data.length < 3) {
      // console.log("list_data.length: ", list_data.length);
      // console.log(list_data);
    }
    if (happening.name != undefined && happening.date != undefined && !isNaN(happening.date.getTime())) {
      happenings.push(happening);
    } else {
      console.error("error in happening object:", happening);
    }
  }

  fs.writeFile('happenings.json', JSON.stringify(happenings), (err) => {
    if (err) throw err;
    console.log("write file success!");
  });
})
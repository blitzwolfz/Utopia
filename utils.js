const fs = require("fs");

module.exports = function(){
    
    getBaseLog = function(x, y) {
        return Math.log(y) / Math.log(x);
    },
    sort_by = function(field, reverse, primer){

        var key = primer ? 
            function(x) {return primer(x[field])} : 
            function(x) {return x[field]};
      
        reverse = !reverse ? 1 : -1;
      
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
          } 
    },
    Sleep = function(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    },
    Number.prototype.commafy = function () {
        return String(this).commafy();
      },
      
    String.prototype.commafy = function () {
        return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
            return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
        });
    },
    searchUser = function(msg){
        let rawdataUser = fs.readFileSync('userdata.json');
        let parsedData = JSON.parse(rawdataUser);
        for(var i = 0; i < parsedData.length; i++){
          if(msg.author.id == parsedData[i].id){
            return parsedData[i];
          }
        }
      },
      
    searchUserByID  = function(id){
      let rawdataUser = fs.readFileSync('userdata.json');
      let parsedData = JSON.parse(rawdataUser);
      for(var i = 0; i < parsedData.length; i++){
        if(id == parsedData[i].id){
          return parsedData[i];
        }
      }
    }

    isNumber = function(n){
        return ((n >= '0' && n <= '9') ? true : false);
    }
}
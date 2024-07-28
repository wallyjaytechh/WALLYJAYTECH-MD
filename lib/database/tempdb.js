  
  const mongoose = require('mongoose');  
  const TempDb = new mongoose.Schema({
    id: { type: String,  unique: true ,required: true, default:"Walyjaytech_Md"},
    creator: { type: String, default: "Walyjaytech" },
    data: { type: Object, default: {} },
    sdb: { type: Object, default: {} }
  });  
  const dbtemp = mongoose.model("dbtemp", TempDb)
  module.exports = { dbtemp }
  

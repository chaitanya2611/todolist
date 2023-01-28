//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash")
mongoose.set('strictQuery', true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Chaitanya-Walvekar:Test123@cluster0.eje49wj.mongodb.net/?retryWrites=true&w=majority/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true})
.then(() => {
  console.log(`CONNECTED TO MONGO!`);
})
.catch((err) => {
  console.log(`OH NO! MONGO CONNECTION ERROR!`);
  console.log(err);
});

const itemsSchema = {
  name:String
}

const Item = mongoose.model("Item",itemsSchema);

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name:"Welcome to your ToDoList!"
});
const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"<-- Hit to delete an item"
});

const defaultItems = [item1,item2,item3];



app.get("/", function(req, res) {
Item.find({},function (err,foundItems) {
  
     if (foundItems==0) {
     Item.insertMany(defaultItems,function (err) {
      if (err) {
        console.log(err);
      } else{
        console.log("Successfully saved default items to database");
        res.redirect("/");
      }
});   
}else{

    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
//  const day = date.getDate();
  

});
  

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const titleName = req.body.list;
  // const Day = date.getDate();
  const item = new Item({
    name:itemName
  });

  if(titleName === "Today"){
  item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:titleName},function(err,foundList){
      if(!foundList){
        console.log("list not found");
      }else{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+titleName)
  }});
  }
});

app.post("/delete",function(req,res){
    const checkedItem = req.body.checkbox.trim();
    const listTitle = req.body.listName
    if(listTitle==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Item is deleted");
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if (!err) {
        res.redirect("/"+listTitle);  
      } 
      
    });
  }
});
app.get('/favicon.ico', (req, res) => res.status(204));
app.get("/:listName",function(req,res){
  const title = _.capitalize(req.params.listName);
  
  List.findOne({name:title},function(err,foundList){
    if(!err){
    if(!foundList){
          const list = new List({
            name:title,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+title);
          
    }
    else{
      res.render("views/list", {listTitle: foundList.name, newListItems: foundList.items});
    }
}});

         
});

app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

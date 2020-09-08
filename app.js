const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-brogan:broganethan@cluster0.6ywrx.mongodb.net/<todolistDB>?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter an item"]
  }
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDoList!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter an item"]
  },
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err) {
        if (err)
        {
          console.log(err);
        }
        else
        {
          console.log("Items added successfully");
        }
      })
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
})

app.get("/:pageName", function(req, res) {
  const pageName = _.capitalize(req.params.pageName);

  List.findOne({name: pageName}, function(err, foundList) {
    if(err)
    {
      console.log(err);
    }
    else
    {
      if(!foundList)
      {
        const list = new List({
          name: pageName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + pageName);
      }
      else
      {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})

app.post("/", function(req, res) {
  const itemName= req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

   if(listName === "Today")
   {
     item.save();
     res.redirect("/");
   }
   else
   {
     List.findOne({name: listName}, function(err, foundList) {
       foundList.items.push(item)
       foundList.save();
       res.redirect("/" + listName);
     })
   }

})

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(err)
      {
        console.log("Item removed unsuccessfully");
      }
      else
      {
        console.log("Item removed successfully");
        res.redirect("/");
      }
    })
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if(err)
      {
        console.log(err);
      }
      else
      {
        res.redirect("/" + listName);
      }
    })
  }
})

app.get("/")

app.post("/work", function (req, res) {
  const listItem = req.body.newItem;

  workItems.push(listItem);

  res.redirect("/work");
})

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("server started on port 3000");
})

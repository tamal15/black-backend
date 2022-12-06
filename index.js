const express= require("express")
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require("cors");
const app=express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json())

// E-krish-ban
// vfOAvj7RQdalNWU4



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcndbqa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try{
        await client.connect();
        console.log("connected to database");
        const database = client.db('E-Keishi-BD');

        const userCollection = database.collection('users');
        const buyerProductCollection = database.collection('buyerProducts');





          // add database user collection 
          app.post('/users', async(req,res)=>{
            const user=req.body;
            console.log(user)
            const result=await userCollection.insertOne(user);
            // console.log(body)
            res.json(result);
           
        })

        

        app.put('/users', async(req,res) =>{
            const user=req.body;
            console.log(user)
            const filter= {email:user.email}
            const option = {upsert:true}
            const updateDoc= {$set : user}
            const result= await userCollection.updateOne(filter,updateDoc,option)
            res.json(result)
        });

          // database searching check buyer
    app.get('/users/:email', async(req,res)=>{
        const email=req.params.email;
        const query={email:email}
        const user=await userCollection.findOne(query)
        let isbuyer=false;
        if(user?.client==='buyer'){
          isbuyer=true;
        }
        res.json({buyer:isbuyer})
    });

     // database admin role 
     app.put('/userLogin/admin', async(req,res)=>{
        const user=req.body;
        console.log('put',user)
        const filter={email:user.email}
        const updateDoc={$set:{role:'admin'}}
        const result=await userCollection.updateOne(filter,updateDoc)
        res.json(result)
    });

       // database searching check admin 
       app.get('/userLogin/:email', async(req,res)=>{
        const email=req.params.email;
        const query={email:email}
        const user=await userCollection.findOne(query)
        let isAdmin=false;
        if(user?.role==='admin'){
          isAdmin=true;
        }
        res.json({admin:isAdmin})
    });

    //    post product buyer 
    app.post('/PostUploadBuyer', async(req,res) =>{
      const user=req.body;
    console.log(user);
    
      const result=await buyerProductCollection.insertOne(user);
      res.json(result)
  });

  app.get('/PostUploadBuyer', async(req,res)=>{
      const result=await buyerProductCollection.find({}).toArray()
      res.json(result)
  });

   // get product
   app.get("/products", async (req, res) => {
    const page = req.query.page;
    const size = parseInt(req.query.size);
    const query = req.query;
    delete query.page
    delete query.size
    Object.keys(query).forEach(key => {
        if (!query[key])
            delete query[key]
    });

    if (Object.keys(query).length) {
        const cursor = buyerProductCollection.find(query, status = "approved");
        const count = await cursor.count()
        const allData = await cursor.skip(page * size).limit(size).toArray()
        res.json({
            allData, count
        });
    } else {
        const cursor = buyerProductCollection.find({
            // status: "approved"
        });
        const count = await cursor.count()
        const allData = await cursor.skip(page * size).limit(size).toArray()

        res.json({
          allData, count
        });
    }

});

app.get('/product/:id', async(req,res)=>{
  const id=req.params.id
  const query={_id:ObjectId(id)}
  const result=await buyerProductCollection.findOne(query)
  res.json(result)
});



    }

    finally{
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req,res)=>{
    res.send("E-Krishi-BD shopping");
   });

   app.listen(port, ()=>{
    console.log("runnning online on port", port);
  });
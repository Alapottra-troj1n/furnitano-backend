const express = require('express');
const app = express();
const cors = require('cors');
const slugify = require('slugify');
require('dotenv').config(); 
const port = process.env.PORT || 5000;



//middlewares
app.use(cors()); 
app.use(express.json()); 



//connect to mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://furnitano-admin:${process.env.DB_PASS}@furnitano.ykxho.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async() =>{


    try{
        await client.connect();
        const database = client.db('furnitano');
        const productCollection = database.collection('products');

        
       //Show all products functionality 

        app.get('/products', async(req, res) =>{

            const query = {};
            const cursor = await productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        })

        //Product by id functionality

        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const user = await productCollection.findOne(query);
            res.send(user);

            

        })

        //Delivered Functionality

        app.put('/deliver/:id', async(req, res) =>{
            const id = req.params.id;
            const updatedData = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: false };
            const updatedDoc = {
                $set: {
                    quantity: updatedData.updatedQuantity
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        });

        //Restock Functionality

        app.put('/restock/:id', async(req, res) =>{
            const id = req.params.id;
            const updatedData = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: false };
            const updatedDoc = {
                $set: {
                    quantity: updatedData.data
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        });

 



    }
    finally{




    }
}

run().catch(console.dir);

//home api 
app.get('/', async(req, res) =>{
    res.json({message : 'hello world'})

})



//port
app.listen(port, ()=>{
    console.log("listening to the port", port)
})

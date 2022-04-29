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
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://furnitano-admin:${process.env.DB_PASS}@furnitano.ykxho.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async() =>{


    try{
        await client.connect();
        const database = client.db('furnitano');
        const productCollection = database.collection('products');

        //home api 
        app.get('/', async(req, res) =>{
            res.json({message : 'hello world'})

        })

        app.get('/products', async(req, res) =>{

            const query = {};
            const cursor = await productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        })


    }
    finally{




    }
}

run().catch(console.dir);



//port
app.listen(port, ()=>{
    console.log("listening to the port", port)
})

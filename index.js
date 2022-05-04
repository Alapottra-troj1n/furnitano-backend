const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;



//middlewares
app.use(cors());
app.use(express.json());

//verify function

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ error: 'verification failed. access denied.' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: 'access denied' });
        }
        req.decoded = decoded;
        next();
    })
}



//connect to mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://furnitano-admin:${process.env.DB_PASS}@furnitano.ykxho.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {


    try {
        await client.connect();
        const database = client.db('furnitano');
        const productCollection = database.collection('products');

        //giving webtoken

        app.post('/getToken', async (req, res) => {
            const userEmail = req.body;
            const jwtToken = jwt.sign(userEmail, process.env.TOKEN_SECRET);
            res.send({ jwtToken });
        })


        //Show all products functionality 

        app.get('/products', async (req, res) => {

            const query = {};
            const cursor = await productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);

        })

        //Product by id functionality

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await productCollection.findOne(query);
            res.send(user);



        })

        //Delivered Functionality

        app.put('/deliver/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            const filter = { _id: ObjectId(id) };
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

        app.put('/restock/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: false };
            const updatedDoc = {
                $set: {
                    quantity: updatedData.data
                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        });

        //add a furniture 
        app.post('/manage/add', async (req, res) => {
            
            const addedProduct = req.body;
            console.log(req.body);
            const newProduct = {
                "image": addedProduct.productImageUrl,
                "email": addedProduct.productEmail,
                "name": addedProduct.productName,
                "description": addedProduct.productDescription,
                "price": addedProduct.productPrice,
                "supplier": addedProduct.productSupplier,
                "quantity": addedProduct.productQuantity

            };
            const result = await productCollection.insertOne(newProduct);
            res.send(result);

        })

        //delete a furniture

        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const results = await productCollection.deleteOne(query);
            res.send(results);
        })

        //fetch my inventory

        app.get('/myinventory',verifyToken, async (req, res) => {
            const email = req.query.email;
            const jwtEmail = req.decoded;

            if(email === jwtEmail){
                const query = { email: email };
                const cursor = productCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);

            }else{
                res.status(403).send({error: 'access denied'})
            }
            //
          


        })








    }
    finally {




    }
}

run().catch(console.dir);

//home api 
app.get('/', async (req, res) => {
    res.json({ message: 'hello world' })

})



//port
app.listen(port, () => {
    console.log("listening to the port", port)
})

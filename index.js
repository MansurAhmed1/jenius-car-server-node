/** @format */

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// use middleware
app.use(cors());
app.use(express.json());
//middleware

app.use(cors());
app.use(express.json());
//for tokken
function varifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
  });

  next();
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v85be.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});
async function run() {
  try {
    await client.connect();
    const serviceCollection = client
      //database name bosate hobe
      .db("Genius-car-service")
      //collection name bosate hobe
      .collection("service");

    //amader order kora data guloke joma rakhar jonno notun kore collectio  toiri korar niom
    //database name ager ta rakhbo order collection name change hobe
    const orderCollection = client.db("Genius-car-service").collection("order");

    //AUTH RELATED KAJ-KAM BA JWT
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
      });
      res.send({ accessToken });
    });

    //backend er datake ui te pathanor jonno nicher re.send app.get er moddho
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //id dara query toiri kora
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //update

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          data
        }
      };
      const result = await serviceCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //POST mane ui theke backend a data pathano hoi
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });

    //DELETE
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    //order colllection  api create
    //datake client thke pathaise
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    //oraer er datagulake backend theke client a pathate hobe
    app.get("/order", varifyJWT, async (req, res) => {
      // const authHeader=req.headers.authorization;
      // console.log( authHeader)
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const order = await cursor.toArray();
        res.send(order);
      }
      else{
        res.status(403).send({message:"forbidden access"})
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running jenius server");
});

app.listen(port, () => {
  console.log("listening to port variable");
});

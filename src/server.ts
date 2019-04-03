import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { createGroup } from './requests';

const API_PORT = 3001;
const app = express();
const router = express.Router();
const dbRoute = 'mongodb://localhost:27017/secure-cloud';

app.use(cors());

mongoose.connect(
  dbRoute,
  { useNewUrlParser: true },
);

const db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

router.get('/createGroup', cors(), (req, res) => {
  const name = req.query.name;
  const pubKey = req.query.pubKey;
  if (!name) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }
  createGroup(
    name,
    pubKey,
    data => {
      return res.json({
        data,
        success: true,
      });
    },
    () => {
      return res.json({
        success: false,
      });
    },
  );
});

app.use('/api', router);

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

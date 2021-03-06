import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { addUser, getEncryptedSession, getGroups, leaveGroup } from './requests';

const API_PORT = 3002;
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

router.get('/getEncryptedSession', cors(), (req, res) => {
  const name = req.query.name;
  const pubKey = req.query.pubKey;
  if (!name || !pubKey) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }
  getEncryptedSession(
    name,
    pubKey,
    data => {
      return res.json({
        session: data,
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

router.get('/addUser', cors(), (req, res) => {
  const name = req.query.name;
  const adderKey = req.query.adderKey;
  const addedKey = req.query.addedKey;
  if (!name || !adderKey || !addedKey) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }
  addUser(
    name,
    adderKey,
    addedKey,
    () => {
      return res.json({
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

router.get('/leaveGroup', cors(), (req, res) => {
  const name = req.query.name;
  const pubKey = req.query.pubKey;
  const signature = req.query.signature;
  if (!name || !pubKey || !signature) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }
  leaveGroup(
    name,
    pubKey,
    signature,
    () => {
      return res.json({
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

router.get('/getGroups', cors(), (req, res) => {
  const publicKey = req.query.publicKey;
  if (!publicKey) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }
  getGroups(
    publicKey,
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
app.disable('etag');

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

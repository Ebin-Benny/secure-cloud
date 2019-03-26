import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { getRepoContributions, getUserRepos } from './database';

const API_PORT = 3001;
const app = express();
const router = express.Router();
const dbRoute = 'mongodb://localhost:27017/github-measurement';

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

router.get('/getUserRepos', cors(), (req, res) => {
  const userName = req.query.username;
  if (!userName) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }
  getUserRepos(
    userName,
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

router.get('/getRepoContributions', cors(), (req, res) => {
  const fullRepo = req.query.repo;
  const split = fullRepo.split('/');
  const owner = split[0];
  const repo = split[1];

  if (!fullRepo || !owner || !repo) {
    return res.json({
      error: 'INVALID INPUTS\n',
      success: false,
    });
  }

  getRepoContributions(
    owner,
    repo,
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

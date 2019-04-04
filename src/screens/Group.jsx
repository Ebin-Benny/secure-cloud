import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import crypto from 'crypto'
var RSA = require('hybrid-crypto-js').RSA;

axios.defaults.port = 3001;
var fetch = require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'ywzAGqMCbBAAAAAAAAAAT2bHwmOTsYLJv0LcFUVYkUn6gOOwbPlWP3FIMZdhoFtr', fetch: fetch });

const styles = {
    root: {
        flexGrow: 1,
    },
    card: {
        margin: 20
    },
    pos: {
        marginBottom: 12,
    },
};

class Group extends Component {

    constructor(props) {
        super(props);
        this.state = {
            session: ''
        }
    }

    componentDidMount() {
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3001/api/getEncryptedSession',
            params: {
                pubKey: decodeURIComponent(this.props.publicKey),
                name: this.props.groupName,
            }
        }).then((result) => {
            this.setState({ session: result.data.session });
        }).catch((e) => {
            console.log(e);
        });
    }

    uploadFile(files) {
        const { groupName } = this.props;
        const { session } = this.state;
        if (files.length > 0 && session !== '') {
            let fileName = files[0].file.name;
            let reader = new FileReader();
            reader.onload = function () {
                const iv = Buffer.alloc(16, 0);
                console.log(session);
                console.log(Buffer.from(session, 'hex').length);
                console.log(Buffer.from(session, 'hex'));
                const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(session, 'hex'), iv);
                const encrypted = cipher.update(reader.result);
                const encryptedFinal = cipher.final();
                const encryptedBuffer = Buffer.concat([encrypted, encryptedFinal], encrypted.length + encryptedFinal.length);
                dbx.filesUpload({
                    contents: encryptedBuffer,
                    path: '/' + groupName + '/' + fileName,
                    mode: { '.tag': 'overwrite' },
                    autorename: true,
                    mute: true,
                    strict_conflict: false
                });
            };
            reader.readAsBinaryString(files[0].file)
        }
    }

    render() {
        const { classes, groupName } = this.props;
        const { session } = this.state;
        const sessionLoaded = session !== '';
        return (
            <div>
                <Grid container spacing={24}>
                    <Grid item xs={3}>
                        <Card className={classes.card}>
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    Filename
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small">Download</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
                {sessionLoaded ? <FilePond
                    styles={{ width: 50 }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    allowMultiple={true}
                    onupdatefiles={(files) => {
                        this.uploadFile(files)
                    }} /> : ''}

            </div>
        );
    }
}

Group.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Group);
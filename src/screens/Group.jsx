import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import crypto from 'crypto'
import File from '../components/File'

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
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            session: '',
            mounted: false,
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.groupName !== ''){
            axios({
                method: 'get',
                url: 'http://127.0.0.1:3001/api/getEncryptedSession',
                params: {
                    pubKey: encodeURIComponent(this.props.publicKey),
                    name: this.props.groupName,
                }
            }).then((result) => {
                if(this._isMounted){
                    console.log(result);
                    this.setState({ session: result.data.data });
                }
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    componentWillReceiveProps(){
        if (this.props.groupName !== ''){
            axios({
                method: 'get',
                url: 'http://127.0.0.1:3001/api/getEncryptedSession',
                params: {
                    pubKey: encodeURIComponent(this.props.publicKey),
                    name: this.props.groupName,
                }
            }).then((result) => {
                if(this._isMounted){
                    console.log(result);
                    this.setState({ session: result.data.data });
                }
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    uploadFile(files) {
        const { groupName, privateKey} = this.props;
        const { session } = this.state;
        if (files.length > 0 && session !== '') {
            let fileName = files[0].file.name;
            let reader = new FileReader();
            reader.onload = function () {
                const decrypted = crypto.privateDecrypt(privateKey,Buffer.from(session,'hex'));
                const iv = Buffer.alloc(16, 0);
                const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(decrypted, 'hex'), iv);
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
                    <File name='something.pdf'/>
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
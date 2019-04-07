import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import crypto from 'crypto'
import File from '../components/File'
import mime from 'mime-types';

axios.defaults.port = 3001;
var fetch = require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'ywzAGqMCbBAAAAAAAAAAT2bHwmOTsYLJv0LcFUVYkUn6gOOwbPlWP3FIMZdhoFtr', fetch: fetch });
var Buffer = require('buffer/').Buffer
var arrayBufferToBuffer = require('arraybuffer-to-buffer');
var download = require("downloadjs")

const server_address = 'http://127.0.0.1:3002/api/';


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
    filePond: {
        margin: 10
    }
};

class Group extends Component {
    _isMounted = false;
    _previous = '';

    constructor(props) {
        super(props);
        this.state = {
            session: '',
            mounted: false,
            files: [],
            uploading: false,
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this._previous = this.props.groupName;
        this.updateSession(this.props.groupName);
        this.updateFiles(this.props.groupName);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.groupName !== this._previous) {
            this.setState({ session: '', files: [] })
            this.updateSession(nextProps.groupName);
            this.updateFiles(nextProps.groupName);
            this._previous = nextProps.groupName;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateSession = (groupName) => {
        if (groupName !== '') {
            axios({
                method: 'get',
                url: `${server_address}getEncryptedSession`,
                params: {
                    pubKey: encodeURIComponent(this.props.publicKey),
                    name: groupName,
                }
            }).then((result) => {
                if (this._isMounted) {
                    this.setState({ session: result.data.session });
                }
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    handleDownload = (name) => () => {
        const { groupName, privateKey } = this.props;
        const { session } = this.state;
        dbx.filesDownload({ path: `/${groupName}/${name}` }).then((response) => {
            let reader = new FileReader();
            reader.onload = function () {
                const decryptedSession = crypto.privateDecrypt(privateKey, Buffer.from(session, 'hex'));
                let iv = Buffer.alloc(16, 0);
                const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decryptedSession, 'hex'), iv);
                decipher.setAutoPadding(true);
                let buffer = arrayBufferToBuffer(reader.result);
                const decrypted = decipher.update(buffer);
                const decryptedFinal = decipher.final();
                const type = mime.lookup(name);
                const decryptedBuffer = Buffer.concat([decrypted, decryptedFinal], decrypted.length + decryptedFinal.length);
                const b64String = `data:${type};base64,${decryptedBuffer.toString('base64')}`;
                download(b64String, name, type)
            }
            reader.readAsArrayBuffer(response.fileBlob);
        }).catch((e) => { console.log(e) });
    }

    updateFiles = async (groupName) => {
        try {
            const response = await dbx.filesListFolder({
                path: '/' + groupName + '/',
                recursive: false,
                include_media_info: false,
                include_deleted: false,
                include_has_explicit_shared_members: false,
                include_mounted_folders: false
            });
            this.setState({ files: response.entries })
        } catch (e) {
        }
    }

    uploadFile = (files) => {
        const { groupName, privateKey } = this.props;
        const { session, uploading } = this.state;
        const t = this;
        if (!uploading && files.length > 0 && session !== '') {
            this.setState({ uploading: true })
            let fileName = files[0].file.name;
            let reader = new FileReader();
            reader.onload = function () {
                const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(session, 'hex'));
                const iv = Buffer.alloc(16, 0);
                const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(decrypted, 'hex'), iv);
                let buffer = arrayBufferToBuffer(reader.result);
                cipher.setAutoPadding(true);
                const encrypted = cipher.update(buffer);
                const encryptedFinal = cipher.final();
                const encryptedBuffer = Buffer.concat([encrypted, encryptedFinal], encrypted.length + encryptedFinal.length);
                dbx.filesUpload({
                    contents: encryptedBuffer,
                    path: '/' + groupName + '/' + fileName,
                    mode: { '.tag': 'overwrite' },
                    autorename: true,
                    mute: true,
                    strict_conflict: false
                }).then(() => {
                    t.setState({ uploading: false })
                    t.updateFiles(groupName);
                });
            };
            reader.readAsArrayBuffer(files[0].file)
        }
    }

    render() {
        const { session, files } = this.state;
        const { groupName, classes } = this.props;
        const loaded = session !== '' && groupName !== '' && groupName !== undefined;


        let filesView = [];
        for (let file of files) {
            filesView.push(<File name={file.name} key={file.id} handleDownload={this.handleDownload(file.name)} />)
        }

        return (
            <div>
                {loaded ? <FilePond
                    className={classes.filePond}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    allowMultiple={false}
                    onupdatefiles={(files) => {
                        this.uploadFile(files)
                    }} /> : ''}
                <Grid container spacing={0}>
                    {loaded ? filesView : ''}
                </Grid>
            </div>
        );
    }
}

Group.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Group);
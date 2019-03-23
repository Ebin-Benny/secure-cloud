import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
var fetch = require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'ywzAGqMCbBAAAAAAAAAAT2bHwmOTsYLJv0LcFUVYkUn6gOOwbPlWP3FIMZdhoFtr', fetch: fetch });
class Files extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        var fileName = 'newFile'
        return (
            <div>
                <FilePond
                    onupdatefiles={(files) => {
                        if (files.length > 0) {
                            fileName = files[0].file.name;
                            var reader = new FileReader();
                            reader.onload = function () {
                                dbx.filesUpload({
                                    contents: reader.result,
                                    path: '/' + fileName,
                                    mode: { '.tag': 'overwrite' },
                                    autorename: true,
                                    mute: true,
                                    strict_conflict: false
                                })
                            };
                            reader.readAsBinaryString(files[0].file)
                        }
                    }} />
            </div>
        );
    }

}

export default Files;
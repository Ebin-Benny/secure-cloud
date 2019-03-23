import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';

class Files extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <FilePond
                    onupdatefiles={(filelist) => {
                        if (filelist.length > 0) {
                            console.log(filelist[0].file)
                            var reader = new FileReader();
                            reader.onload = function () {
                                var text = reader.result;
                                console.log(text);
                            };
                            reader.readAsText(filelist[0].file)
                        }
                    }} />
            </div>
        );
    }

}

export default Files;
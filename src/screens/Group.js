import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

var fetch = require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'ywzAGqMCbBAAAAAAAAAAT2bHwmOTsYLJv0LcFUVYkUn6gOOwbPlWP3FIMZdhoFtr', fetch: fetch });

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        margin: 20,
        width: 100,
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
});

function Files(props) {

    const { classes } = props;
    var fileName = 'newFile'
    return (
        <div>
            <Grid container spacing={24}>
                <Grid item xs={3}>
                    <Paper className={classes.paper}>Filename</Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper className={classes.paper}>Filename</Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper className={classes.paper}>Filename</Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper className={classes.paper}>Filename</Paper>
                </Grid>
            </Grid>
            <FilePond
                allowMultiple={true}
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

Files.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Files);
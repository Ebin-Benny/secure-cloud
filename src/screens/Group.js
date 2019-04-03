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

var fetch = require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'ywzAGqMCbBAAAAAAAAAAT2bHwmOTsYLJv0LcFUVYkUn6gOOwbPlWP3FIMZdhoFtr', fetch: fetch });
var serverPub = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC4Bz/Lp1AvTJFLYyqI/sxTFSm6l+uEQhgYzccNR+ab/66S1jLoUn64NqhbSvT9HsiDIP2vRwAG7PELBNpZtCx8Z8kHodJ3knncosXsLnT3XGR+AJ+WoMXprf1ePsvCnzaPVMU5dtdbfc7nmPPs4y2kMvAAtvxboXASTFrNqUIZZq907+x9ZFRYssjdZax1IHxM33c9Aj2sh6QBbQRcf8wAVUrcVWanukxRRj6VHr0UVZdrGkAaLxfMWiiqQBM1YiO7riV9nOvOSLejsa+G1MQ35O2Zky/v2ZsohloOHAb5aHRCxSJiN4lu1/fv6Jzz2OBQC11VryigvCuIRKemr5Dt ebin@ebin-UX430UA";


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
    }

    render() {
        const { classes, groupName } = this.props;
        var fileName = 'newFile'
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
                <FilePond
                    styles={{ width: 50 }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    allowMultiple={true}
                    onupdatefiles={(files) => {
                        if (files.length > 0) {
                            fileName = files[0].file.name;
                            var reader = new FileReader();
                            reader.onload = function () {
                                dbx.filesUpload({
                                    contents: reader.result,
                                    path: '/' + groupName + '/' + fileName,
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

Group.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Group);
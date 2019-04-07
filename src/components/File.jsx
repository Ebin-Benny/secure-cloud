import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

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

class File extends Component {




    render() {
        const { classes, name, handleDownload } = this.props;

        return (
            <Grid item xs={3}>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant="body1">
                            {name}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleDownload}>Download</Button>
                    </CardActions>
                </Card>
            </Grid>
        )
    }
}

File.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(File);
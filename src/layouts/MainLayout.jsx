import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import Group from '../screens/Group.jsx';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


const NodeRSA = require('node-rsa');

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 20,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    button: {
        margin: theme.spacing.unit,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    pubKey: {
        width: drawerWidth - 20,
        'word-break': 'break-all',
        margin: theme.spacing.unit,
    },
});

class MainLayout extends React.PureComponent {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            open: false,
            name: undefined,
            privateKey: '',
            publicKey: '',
            groups: [],
            group: '',
            nameInput: '',
            dialogOpen: false,
            newUser: '',
        }


    }

    componentDidMount = () => {
        this._isMounted = true;
        let privateKey = localStorage.getItem('privateKey');
        let publicKey = localStorage.getItem('publicKey');

        if (privateKey === '' || privateKey === undefined || privateKey === null) {
            const key = new NodeRSA({ b: 2048 });
            key.generateKeyPair();
            privateKey = key.exportKey('pkcs8-private-pem');
            publicKey = key.exportKey('pkcs8-public-pem');
            localStorage.setItem('privateKey', privateKey);
            localStorage.setItem('publicKey', publicKey);
        }

        this.updateGroups(publicKey);

        this.setState({ privateKey, publicKey });
    }

    updateGroups = (publicKey) => {
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3002/api/getGroups',
            params: {
                publicKey: encodeURIComponent(publicKey),
            }
        }).then((result) => {
            if (this._isMounted) {
                let groups = result.data.data;
                if (groups === undefined) groups = [];
                if (this.state.group === '') {
                    this.setState({ group: groups[0], groups });
                } else {
                    this.setState({ groups });
                }
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    componentWillUnmount = () => {
        this._isMounted = false;
    }

    handleGetName = (name) => {
        this.setState({ name: name });
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    handleGroupClick = (name) => () => {
        this.setState({ group: name });
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.value });
    };

    handleCreateGroup = () => {
        const name = this.state.nameInput;
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3002/api/getEncryptedSession',
            params: {
                pubKey: encodeURIComponent(this.state.publicKey),
                name,
            }
        }).then(() => {
            this.setState({ group: name });
            this.updateGroups(this.state.publicKey);
        }).catch((e) => {
            console.log(e);
        });
    }

    handleDialogOpen = () => {
        this.setState({ dialogOpen: true });
    };

    handleDialogClose = () => {
        this.setState({ dialogOpen: false });
    };

    handleAddUser = () => {
        this.handleDialogClose();
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3002/api/addUser',
            params: {
                adderKey: encodeURIComponent(this.state.publicKey),
                addedKey: (this.state.newUser),
                name: this.state.group,
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    handleLeaveGroup = () => {
        const key = new NodeRSA();
        key.importKey(this.state.privateKey, 'pkcs8-private-pem');
        const signature = key.sign(Buffer.from('leaveGroup'), 'hex');
        this.setState({ group: '' });
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3002/api/leaveGroup',
            params: {
                pubKey: encodeURIComponent(this.state.publicKey),
                signature,
                name: this.state.group,
            }
        }).then(() => {
            this.updateGroups(this.state.publicKey);
        }).catch((e) => {
            console.log(e);
        });
    }

    render() {
        const { classes, theme } = this.props;
        const { open, privateKey, publicKey, groups, group } = this.state;
        const keyLoaded = privateKey !== '' && privateKey !== undefined;
        const groupSelected = (group !== '' && group !== undefined);
        const drawGroup = keyLoaded && groupSelected;

        return (
            <div className={classes.root}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    className={classNames(classes.appBar, {
                        [classes.appBarShift]: open,
                    })}
                >
                    <Toolbar disableGutters={!open}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={this.handleDrawerOpen}
                            className={classNames(classes.menuButton, open && classes.hide)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography className={classes.grow} variant="h6" color="inherit" noWrap>
                            {group}
                        </Typography>
                        {drawGroup ?
                            <>
                                <IconButton aria-label="Add User" color="inherit" className={classes.button} onClick={this.handleDialogOpen}>
                                    <AddIcon />
                                </IconButton>
                                <IconButton aria-label="Exit group" color="inherit" className={classes.button} onClick={this.handleLeaveGroup}>
                                    <CloseIcon />
                                </IconButton>
                            </> : ''}

                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    anchor="left"
                    open={open}
                    classes={{
                        paper: classes.drawerPaper,
                    }}>
                    <div className={classes.drawerHeader}>
                        <IconButton onClick={this.handleDrawerClose}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <div className={classes.pubKey}>
                        {encodeURIComponent(publicKey)}
                    </div>
                    <Divider />
                    <form className={classes.container} noValidate autoComplete="off">
                        <TextField
                            id="standard-name"
                            label="Group"
                            className={classes.textField}
                            value={this.state.groupName}
                            onChange={this.handleChange('nameInput')}
                            margin="normal"
                        />
                    </form>
                    <Button variant="contained" color="primary" className={classes.button} onClick={this.handleCreateGroup}>
                        Create
                        <AddIcon />
                    </Button>
                    <Divider />
                    <List>
                        {groups.map((text) => (
                            <ListItem button key={text} onClick={this.handleGroupClick(text)}>
                                <ListItemIcon><GroupRoundedIcon /></ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <main
                    className={classNames(classes.content, {
                        [classes.contentShift]: open,
                    })}>
                    <div className={classes.drawerHeader} />
                    {drawGroup ? <Group groupName={group} publicKey={publicKey} privateKey={privateKey} /> : ''}
                </main>
                <Dialog
                    open={this.state.dialogOpen}
                    onClose={this.handleDrawerClose}
                    aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Add User</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Add a user to this group using their public key.
                        </DialogContentText>
                        <TextField
                            id="standard-name"
                            label="Public Key"
                            className={classes.textField}
                            value={this.state.groupName}
                            onChange={this.handleChange('newUser')}
                            fullWidth />

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleAddUser} color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </div >
        );
    }
}

MainLayout.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MainLayout);
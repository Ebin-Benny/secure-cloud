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
import Cookies from 'universal-cookie';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';


const NodeRSA = require('node-rsa');
const cookies = new Cookies();

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
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
        }


    }

    componentDidMount() {
        this._isMounted = true;
        let privateKey = cookies.get('privateKey');
        let publicKey = cookies.get('publicKey');

        if (privateKey === '' || privateKey === undefined) {
            const key = new NodeRSA({ b: 2048 });
            key.generateKeyPair();
            privateKey = key.exportKey('pkcs8-private-pem');
            publicKey = key.exportKey('pkcs8-public-pem');
            cookies.set('privateKey', privateKey, { path: "/" });
            cookies.set('publicKey', publicKey, { path: "/" });
        }
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3001/api/getGroups',
            params: {
                publicKey: encodeURIComponent(publicKey),
            }
        }).then((result) => {
            if (this._isMounted) {
                if (result.data.data !== undefined)
                    this.setState({ groups: result.data.data });
            }
        }).catch((e) => {
            console.log(e);
        });
        this.setState({ privateKey, publicKey });
    }

    updateGroups = () => {

    }

    componentWillUnmount() {
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
        axios({
            method: 'get',
            url: 'http://127.0.0.1:3001/api/getEncryptedSession',
            params: {
                pubKey: encodeURIComponent(this.state.publicKey),
                name: this.state.nameInput,
            }
        }).then((result) => {

        }).catch((e) => {
            console.log(e);
        });
    }

    render() {
        const { classes, theme } = this.props;
        const { open, privateKey, publicKey, groups, group } = this.state;
        const keyLoaded = privateKey !== '' && privateKey !== undefined;
        const groupSelected = group !== '';
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
                        <Typography variant="h6" color="inherit" noWrap>
                            {group}
                        </Typography>
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
                    <Typography paragraph>
                        {publicKey}
                    </Typography>
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
                        {groups.map((text, index) => (
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
            </div >
        );
    }
}

MainLayout.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MainLayout);
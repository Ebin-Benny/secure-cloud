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
import PeopleIcon from '@material-ui/icons/People';
import Group from '../../screens/Group.jsx';
import Cookies from 'universal-cookie';
import Button from '@material-ui/core/Button';
import crypto from 'crypto'

const queryString = require('query-string');
var Dropbox = require('dropbox').Dropbox;

const CLIENT_ID = 'd8fbp50ftq67ldb';
var dbx = new Dropbox({ clientId: CLIENT_ID });
var authUrl = dbx.getAuthenticationUrl('http://localhost:3000/');

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
});

class MainLayout extends React.PureComponent {

    constructor(props) {
        super(props);
        const parsed = queryString.parse(window.location.hash);
        let access_token = parsed.access_token;
        let uid = parsed.uid;
        let account_id = parsed.account_id;
        let privateKey = cookies.get('privateKey');
        let publicKey = cookies.get('publicKey');

        if (access_token === undefined) {
            access_token = cookies.get('access_token');
        } else {
            cookies.set('access_token', access_token, { path: "/" });
        }
        if (uid === undefined) {
            uid = cookies.get('uid');
        } else {
            cookies.set('uid', uid, { path: "/" });
        }
        if (account_id === undefined) {
            account_id = cookies.get('account_id');
        } else {
            cookies.set('account_id', account_id, { path: "/" });
        }

        console.log(crypto);

        if (privateKey === undefined) {
            crypto.generateKeyPair('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                    passphrase: 'top secret'
                }
            }, (err, publicKey, privateKey) => {
                console.log(publicKey);
                console.log(privateKey);
            });
        }

        this.state = {
            open: false,
            access_token,
            uid,
            account_id,
            name: undefined,
            privateKey,
            publicKey,
        }
    }

    componentDidMount() {
        const { access_token } = this.state;
        if (access_token !== undefined) {
            var dbu = new Dropbox({ accessToken: access_token });
            var comp = this;
            dbu.usersGetCurrentAccount()
                .then((response) => {
                    comp.handleGetName(response.name.display_name)
                });
        }
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

    handleLogIn = () => {
        window.open(authUrl, '_blank')
    }

    render() {
        const { classes, theme } = this.props;
        const { open, name } = this.state;

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
                            Group 1
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
                    }}
                >
                    <div className={classes.drawerHeader}>
                        {name !== undefined ?
                            <Typography variant="h6" color="inherit" noWrap>{name}</Typography> :
                            <Button variant="contained" color="default" className={classes.button}
                                onClick={this.handleLogIn}>
                                Log In
                                <PeopleIcon className={classes.rightIcon} />
                            </Button>
                        }
                        <IconButton onClick={this.handleDrawerClose}>
                            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        {['Group 1', 'Group 2', 'Group3'].map((text, index) => (
                            <ListItem button key={text}>
                                <ListItemIcon><GroupRoundedIcon /></ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <main
                    className={classNames(classes.content, {
                        [classes.contentShift]: open,
                    })}
                >
                    <div className={classes.drawerHeader} />
                    <Group groupName="Group1" publicKey="-----BEGIN%20PUBLIC%20KEY-----%0AMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2zvTlvvsLsSip5vFmXm%2B%0Ao56WAZnS8M8az%2BLAkA3YkYVWL5a68zoJk4Yk5tM6U8GvbiHUF8r9OsZ2Rl8u41C3%0A%2Fg9NOReETM9%2Fwy9NaQXy9i%2BDg1VR3Rkn7a0Ag5bQC77S7oVjMBOWrgHGSNOXT4jQ%0AhlMejdpWRDezhp5OjB7nkmWk8mFvgkoR56AOwPxJgEsebo9kf3Lqs9lejed90Ytz%0AMM6sdiyiq%2BVgRAhJCxyUBfMxrfP97pwAIlJ3f00MEd3o5w%2FcT6CfdllMA2bPnROo%0AEZoyDtVa9IZ%2FjoAP7rTQXvksSJIsSLKxVi7HGwTUvnID1EEi3NbYLem2JgSS5AGa%0Akf0JI6x%2Bm6D0VU3%2FZ1X4Jo0B5RZ5XofPyf6kZrSHeP37%2FqpeXDJfPkEny72UwBpu%0AQar7Nzp0jXtQ24lshe5psg9ozI9Caq80l1G07YQ61UGGeGXAKlQs%2F265hZ9PwPhe%0AP%2BL1LxpYgkoSexbd17bb%2ByOlwFmVq761qfl5moygC%2F3Ckn5nkm44RXZoJRkS4upE%0A4x8nzneHD9g9fLivYC1T2SilBwOsWpAkeL4brudYP5IqSaUDCMCctOj0H6VBporV%0Aac0LF1eLAYbGLMu3poG6NXKcRxnpst2U3ghFqT3Nu999%2BFvLFaMjgX95Sf67Vths%0A3sBGnLmudBaqohEw15xAl3cCAwEAAQ%3D%3D%0A-----END%20PUBLIC%20KEY-----%0A" />
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
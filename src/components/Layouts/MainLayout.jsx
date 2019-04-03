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
import Group from '../../screens/Group';
import Cookies from 'universal-cookie';
import Button from '@material-ui/core/Button';
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
        let account_id = parsed.account_id
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

        this.state = {
            open: false,
            access_token,
            uid,
            account_id,
            name: undefined
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
                    <Group groupName="Group1" />
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
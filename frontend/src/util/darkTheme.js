import teal from '@material-ui/core/colors/teal';
import purple from '@material-ui/core/colors/purple';

export default {
  palette: {
    type: 'dark',
    primary: {
      main: teal[700],
    },
    secondary: {
      main: purple[500],
    },
  },
  chatUserData: {
    container: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      paddingTop: 20,
      paddingLeft: 20,
      paddingBottom: 20,
    },
    avatar: {
      width: 60,
      height: 60,
    },
    text: {
      color: '#fff',
      marginLeft: 20,
    },
    paper: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      width: 600,
      height: 250,
      backgroundColor: '#303030',
      border: '1px solid #000',
      boxShadow: '0.2rem 0.2rem rgba(0, 0, 0, 0.2)',
      // boxShadow: theme.shadows[5],
      // padding: theme.spacing(2, 4, 3),
      outline: 0,
      padding: 20,
    },
    modalContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    modal: {
      outline: 0,
      border: 'none',
    },
    modalAvatar: {
      width: 80,
      height: 80,
      // marginBottom: 10,
    },
    modalText: {
      // fontWeight: 'bold',
      // fontSize: '1.1rem',
      color: '#fff',
      marginLeft: 20,
      flex: 1,
    },
  },
  UploadAvatar: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    input: {
      display: 'none',
    },
    photoIcon: {
      height: 25,
      width: 25,
    },
    buttonContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    uploadButton: {
      marginLeft: 20,
    },
    text: {
      color: '#fff',
      paddingTop: 50,
      paddingBottom: 10,
      alignSelf: 'center',
    },
  },
};

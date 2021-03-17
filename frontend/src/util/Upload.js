// import { DropzoneArea } from 'material-ui-dropzone';

// const Upload = () => {
//   return (
//     <DropzoneArea
//       acceptedFiles={['image/*']}
//       dropzoneText={'Drag and drop an image here or click'}
//       onChange={files => console.log('Files:', files)}
//       cancelButtonText={'cancel'}
//       submitButtonText={'submit'}
//     />
//   );
// };

// export default Upload;

// //
// import { DropzoneDialog } from 'material-ui-dropzone';
// import Button from '@material-ui/core/Button';

// const [open, setOpen] = React.useState(false);

// <div>
//   <Button variant='contained' color='primary' onClick={() => setOpen(true)}>
//     Add Image
//   </Button>

//   <DropzoneDialog
//     acceptedFiles={['image/*']}
//     cancelButtonText={'cancel'}
//     submitButtonText={'submit'}
//     maxFileSize={5000000}
//     open={open}
//     onClose={() => setOpen(false)}
//     onSave={files => {
//       console.log('Files:', files);
//       setOpen(false);
//     }}
//     showPreviews={true}
//     showFileNamesInPreview={true}
//   />
// </div>;
